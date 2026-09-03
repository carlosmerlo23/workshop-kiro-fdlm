// comisiones.js
const { TARIFAS } = require('./tarifas');

function calcularComision(tipo, monto) {
  const t = TARIFAS[tipo];
  if (!t) {
    throw new Error('Tipo de transaccion no reconocido: ' + tipo);
  }
  if (typeof monto !== 'number' || Number.isNaN(monto)) {
    throw new Error('El monto debe ser numerico');
  }
  return t.comisionFija + monto * t.comisionPorcentual;
}

function calcularLiquidacion(transacciones) {
  let total = 0;
  for (const tx of transacciones) {
    total = total + calcularComision(tx.tipo, tx.monto);
  }
  return total;
}

function formatearCOP(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor);
}

module.exports = { calcularComision, calcularLiquidacion, formatearCOP };
