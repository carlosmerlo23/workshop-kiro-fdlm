// Tests de las funciones puras del handler.
//
// No requieren mocks de AWS: `validarSolicitud` y `enmascarar` no hablan con
// ningun servicio. Es una ventaja de separar la validacion de forma del acceso
// a datos, y la razon por la que un adaptador bien escrito se puede probar sin
// montar media infraestructura.
const { validarSolicitud, enmascarar } = require('../src/handlers/registrarTransaccion');

describe('validarSolicitud', () => {
  const solicitudValida = {
    referenciaIdempotencia: 'CB-BUC-0142-20260828-0001',
    tipo: 'DEPOSITO',
    codigoCorresponsal: 'CB-BUC-0142',
    monto: 150000,
    documentoCliente: '1098765432',
  };

  test('acepta una solicitud completa y bien formada', () => {
    expect(validarSolicitud(solicitudValida)).toEqual({ valido: true });
  });

  test('exige la referencia de idempotencia', () => {
    const sinReferencia = { ...solicitudValida, referenciaIdempotencia: undefined };
    expect(validarSolicitud(sinReferencia)).toEqual({
      valido: false,
      motivo: 'REFERENCIA_IDEMPOTENCIA_REQUERIDA',
    });
  });

  test('rechaza montos negativos', () => {
    expect(validarSolicitud({ ...solicitudValida, monto: -150000 })).toEqual({
      valido: false,
      motivo: 'MONTO_INVALIDO',
    });
  });

  test('rechaza monto cero', () => {
    expect(validarSolicitud({ ...solicitudValida, monto: 0 })).toEqual({
      valido: false,
      motivo: 'MONTO_INVALIDO',
    });
  });

  test('rechaza montos con centavos: en pesos colombianos no existen', () => {
    expect(validarSolicitud({ ...solicitudValida, monto: 150000.5 })).toEqual({
      valido: false,
      motivo: 'MONTO_INVALIDO',
    });
  });

  test('rechaza un cuerpo vacio', () => {
    expect(validarSolicitud(null)).toEqual({ valido: false, motivo: 'CUERPO_INVALIDO' });
  });
});

describe('enmascarar', () => {
  test('deja visibles solo los ultimos 4 digitos del documento', () => {
    expect(enmascarar('1098765432')).toBe('****5432');
  });

  test('no expone nada si el documento es demasiado corto', () => {
    expect(enmascarar('12')).toBe('****');
  });

  test('tolera un valor ausente', () => {
    expect(enmascarar(undefined)).toBe('****');
  });
});
