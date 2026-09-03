// index.js - punto de entrada de ejemplo para probar el modulo a mano
const { registrarTransaccion, formatearComprobante } = require('./corresponsales/transacciones');
const { formatearCOP } = require('./corresponsales/comisiones');

const corresponsal = {
  codigo: 'CB-BUC-0142',
  nombre: 'Papeleria La Esperanza',
  municipio: 'Bucaramanga',
  cupoDisponible: 500000,
};

const ejemplos = [
  { tipo: 'DEPOSITO', monto: 150000, documentoCliente: '1098765432' },
  { tipo: 'RETIRO', monto: 500000, documentoCliente: '1098765432' },
  { tipo: 'PAGO_CREDITO', monto: 1200000, documentoCliente: '63512477' },
  { tipo: 'RECAUDO', monto: 2500000, documentoCliente: '63512477' },
];

for (const ejemplo of ejemplos) {
  const tx = registrarTransaccion(ejemplo, corresponsal);
  console.log('---');
  console.log(formatearComprobante(tx));
  if (tx.estado === 'APROBADA') {
    console.log('Comision formateada: ' + formatearCOP(tx.comision));
  }
}
