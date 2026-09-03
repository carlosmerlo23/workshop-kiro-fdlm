// transacciones.js
const { calcularComision } = require('./comisiones');
const { validarTipo, validarMonto, validarCupo, validarHorario } = require('./limites');

function generarConsecutivo(codigoCorresponsal) {
  return codigoCorresponsal + '-' + Date.now();
}

function registrarTransaccion(payload, corresponsal, fecha) {
  const f = fecha || new Date();

  const vTipo = validarTipo(payload.tipo);
  if (!vTipo.valido) {
    return { estado: 'RECHAZADA', motivo: vTipo.motivo };
  }

  const vHorario = validarHorario(f);
  if (!vHorario.valido) {
    return { estado: 'RECHAZADA', motivo: vHorario.motivo };
  }

  const vMonto = validarMonto(payload.tipo, payload.monto);
  if (!vMonto.valido) {
    return { estado: 'RECHAZADA', motivo: vMonto.motivo };
  }

  const vCupo = validarCupo(corresponsal, payload.tipo, payload.monto);
  if (!vCupo.valido) {
    return { estado: 'RECHAZADA', motivo: vCupo.motivo };
  }

  const comision = calcularComision(payload.tipo, payload.monto);

  return {
    estado: 'APROBADA',
    consecutivo: generarConsecutivo(corresponsal.codigo),
    tipo: payload.tipo,
    monto: payload.monto,
    comision: comision,
    corresponsal: corresponsal.codigo,
    documentoCliente: payload.documentoCliente,
    fecha: f.toISOString(),
  };
}

function formatearComprobante(tx) {
  if (tx.estado !== 'APROBADA') {
    return 'TRANSACCION RECHAZADA: ' + tx.motivo;
  }
  const lineas = [
    'FUNDACION DELAMUJER - RED DE CORRESPONSALES',
    'Comprobante: ' + tx.consecutivo,
    'Punto: ' + tx.corresponsal,
    'Tipo: ' + tx.tipo,
    'Monto: ' + tx.monto,
    'Comision: ' + tx.comision,
    'Fecha: ' + tx.fecha,
    'Conserve este comprobante',
  ];
  return lineas.join('\n');
}

module.exports = { registrarTransaccion, formatearComprobante, generarConsecutivo };
