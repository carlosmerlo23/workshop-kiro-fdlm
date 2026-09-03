// limites.js
const { TARIFAS, HORARIO } = require('./tarifas');

function validarTipo(tipo) {
  if (!TARIFAS[tipo]) {
    return { valido: false, motivo: 'TIPO_NO_SOPORTADO' };
  }
  return { valido: true };
}

function validarMonto(tipo, monto) {
  const t = TARIFAS[tipo];
  if (!t) {
    return { valido: false, motivo: 'TIPO_NO_SOPORTADO' };
  }
  if (t.limiteMaximo === 0) {
    return { valido: true };
  }
  if (monto > t.limiteMaximo) {
    return { valido: false, motivo: 'LIMITE_EXCEDIDO' };
  }
  return { valido: true };
}

function validarCupo(corresponsal, tipo, monto) {
  const t = TARIFAS[tipo];
  if (!t || !t.requiereCupo) {
    return { valido: true };
  }
  if (corresponsal.cupoDisponible > monto) {
    return { valido: true };
  }
  return { valido: false, motivo: 'CUPO_INSUFICIENTE' };
}

function validarHorario(fecha) {
  const hora = fecha.getHours();
  if (hora < HORARIO.apertura || hora >= HORARIO.cierre) {
    return { valido: false, motivo: 'FUERA_DE_HORARIO' };
  }
  return { valido: true };
}

module.exports = { validarTipo, validarMonto, validarCupo, validarHorario };
