// src/handlers/registrarTransaccion.js
//
// Adaptador entre AWS Lambda / API Gateway y la logica de negocio del dominio.
//
// ESTE ARCHIVO VIENE HECHO A PROPOSITO.
// En el Lab 5 no lo generas: lo lees para entender dos cosas que despues se
// reflejan en la infraestructura.
//
//   1. El handler ADAPTA, no decide. La regla de negocio sigue viviendo en
//      src/corresponsales/. Si la duplicaramos aqui, tendriamos dos verdades.
//
//   2. La idempotencia se resuelve en dos pasos, y ambos son necesarios:
//      - consultar por la referencia antes de procesar, para responder rapido
//        al reintento;
//      - escribir con una condicion que impida sobrescribir una referencia que
//        ya existe.
//      Solo el primer paso deja una ventana entre la consulta y la escritura.
//      Dos peticiones simultaneas del mismo punto pasarian las dos. La
//      condicion en la escritura es lo que cierra esa ventana.
//
// Esto es lo que le faltaba a generarConsecutivo() en la Sesion 1: usaba la
// hora del sistema, asi que cada reintento producia una transaccion distinta.
// En un punto rural con senal intermitente, el reintento es el caso normal.

const { DynamoDBClient, ConditionalCheckFailedException } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const { registrarTransaccion } = require('../corresponsales/transacciones');

const TABLA = process.env.TABLA_TRANSACCIONES;
const COLA = process.env.COLA_LIQUIDACIONES;
const DIAS_RETENCION = 400;

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sqs = new SQSClient({});

/**
 * Emite un log estructurado en JSON.
 *
 * Nunca registra el documento del cliente completo: solo los ultimos 4 digitos,
 * suficiente para soporte y sin exponer el dato de identificacion.
 *
 * @param {string} nivel - INFO, WARN o ERROR.
 * @param {string} mensaje - Descripcion corta del evento.
 * @param {Object} [datos={}] - Datos adicionales del evento.
 * @returns {void}
 */
function log(nivel, mensaje, datos = {}) {
  console.log(JSON.stringify({ nivel, mensaje, ...datos }));
}

/**
 * Oculta un documento de identidad dejando visibles los ultimos 4 caracteres.
 *
 * @param {string} documento - Documento de identidad del cliente.
 * @returns {string} Documento enmascarado, por ejemplo '****5432'.
 */
function enmascarar(documento) {
  if (typeof documento !== 'string' || documento.length < 4) {
    return '****';
  }
  return '****' + documento.slice(-4);
}

/**
 * Construye la respuesta HTTP que espera la integracion proxy de API Gateway.
 *
 * @param {number} codigo - Codigo de estado HTTP.
 * @param {Object} cuerpo - Objeto que se serializa como cuerpo de la respuesta.
 * @returns {{statusCode: number, headers: Object, body: string}} Respuesta HTTP.
 */
function respuesta(codigo, cuerpo) {
  return {
    statusCode: codigo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  };
}

/**
 * Valida la solicitud recibida del punto corresponsal.
 *
 * Es la validacion de forma, no de negocio: comprueba que los campos existan y
 * tengan el tipo correcto. Las reglas de negocio (limites, cupo, horario) las
 * evalua el dominio.
 *
 * @param {Object} cuerpo - Cuerpo de la solicitud ya parseado.
 * @returns {{valido: boolean, motivo?: string}} Resultado de la validacion.
 */
function validarSolicitud(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object') {
    return { valido: false, motivo: 'CUERPO_INVALIDO' };
  }
  if (!cuerpo.referenciaIdempotencia || typeof cuerpo.referenciaIdempotencia !== 'string') {
    return { valido: false, motivo: 'REFERENCIA_IDEMPOTENCIA_REQUERIDA' };
  }
  if (!cuerpo.tipo || typeof cuerpo.tipo !== 'string') {
    return { valido: false, motivo: 'TIPO_REQUERIDO' };
  }
  if (!cuerpo.codigoCorresponsal || typeof cuerpo.codigoCorresponsal !== 'string') {
    return { valido: false, motivo: 'CORRESPONSAL_REQUERIDO' };
  }
  // Los montos son enteros de pesos colombianos: no existen centavos.
  if (!Number.isInteger(cuerpo.monto) || cuerpo.monto <= 0) {
    return { valido: false, motivo: 'MONTO_INVALIDO' };
  }
  return { valido: true };
}

/**
 * Handler de la funcion Lambda que registra una transaccion de corresponsal.
 *
 * @param {Object} evento - Evento de API Gateway con integracion proxy.
 * @param {string} [evento.body] - Cuerpo JSON de la solicitud.
 * @returns {Promise<{statusCode: number, headers: Object, body: string}>}
 *   201 si la transaccion se aprueba, 200 si es un reintento ya procesado,
 *   400 si la solicitud es invalida, 422 si el negocio la rechaza,
 *   500 ante un error inesperado.
 */
async function handler(evento) {
  let cuerpo;

  try {
    cuerpo = typeof evento.body === 'string' ? JSON.parse(evento.body) : evento.body;
  } catch (error) {
    log('WARN', 'Cuerpo no es JSON valido');
    return respuesta(400, { estado: 'RECHAZADA', motivo: 'CUERPO_INVALIDO' });
  }

  const validacion = validarSolicitud(cuerpo);
  if (!validacion.valido) {
    log('WARN', 'Solicitud invalida', { motivo: validacion.motivo });
    return respuesta(400, { estado: 'RECHAZADA', motivo: validacion.motivo });
  }

  const referencia = cuerpo.referenciaIdempotencia;

  try {
    // Paso 1 de la idempotencia: si el punto ya envio esta referencia,
    // devolvemos la transaccion guardada sin volver a procesarla.
    const existente = await dynamo.send(
      new GetCommand({ TableName: TABLA, Key: { referenciaIdempotencia: referencia } })
    );

    if (existente.Item) {
      log('INFO', 'Reintento de una transaccion ya procesada', { referencia });
      return respuesta(200, { ...existente.Item, reintento: true });
    }

    const corresponsal = {
      codigo: cuerpo.codigoCorresponsal,
      cupoDisponible: cuerpo.cupoDisponible ?? 0,
    };

    // La decision de negocio la toma el dominio, no este handler.
    const transaccion = registrarTransaccion(
      {
        tipo: cuerpo.tipo,
        monto: cuerpo.monto,
        documentoCliente: cuerpo.documentoCliente,
      },
      corresponsal
    );

    if (transaccion.estado !== 'APROBADA') {
      log('INFO', 'Transaccion rechazada por regla de negocio', {
        referencia,
        motivo: transaccion.motivo,
      });
      return respuesta(422, transaccion);
    }

    const registro = {
      ...transaccion,
      referenciaIdempotencia: referencia,
      codigoCorresponsal: corresponsal.codigo,
      documentoCliente: enmascarar(cuerpo.documentoCliente),
      expiraEn: Math.floor(Date.now() / 1000) + DIAS_RETENCION * 86400,
    };

    // Paso 2 de la idempotencia: la condicion impide sobrescribir una
    // referencia que ya exista. Es lo que cierra la ventana entre la consulta
    // de arriba y esta escritura.
    await dynamo.send(
      new PutCommand({
        TableName: TABLA,
        Item: registro,
        ConditionExpression: 'attribute_not_exists(referenciaIdempotencia)',
      })
    );

    // La liquidacion de la comision es asincrona: si falla, no debe tumbar la
    // autorizacion que el cliente esta esperando frente al mostrador.
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: COLA,
        MessageBody: JSON.stringify({
          referenciaIdempotencia: referencia,
          codigoCorresponsal: corresponsal.codigo,
          tipo: transaccion.tipo,
          comision: transaccion.comision,
          fecha: transaccion.fecha,
        }),
      })
    );

    log('INFO', 'Transaccion aprobada', {
      referencia,
      tipo: transaccion.tipo,
      corresponsal: corresponsal.codigo,
    });

    return respuesta(201, registro);
  } catch (error) {
    // Dos peticiones simultaneas con la misma referencia: la segunda pierde la
    // condicion. No es un error, es la idempotencia funcionando.
    if (error instanceof ConditionalCheckFailedException) {
      log('INFO', 'Escritura concurrente con la misma referencia', { referencia });
      const guardada = await dynamo.send(
        new GetCommand({ TableName: TABLA, Key: { referenciaIdempotencia: referencia } })
      );
      return respuesta(200, { ...guardada.Item, reintento: true });
    }

    log('ERROR', 'Error inesperado al registrar la transaccion', {
      referencia,
      error: error.message,
    });
    return respuesta(500, { estado: 'ERROR', motivo: 'ERROR_INTERNO' });
  }
}

module.exports = { handler, validarSolicitud, enmascarar };
