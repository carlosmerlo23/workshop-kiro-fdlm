// tarifas.js

const TIPOS = ['DEPOSITO', 'RETIRO', 'PAGO_CREDITO', 'RECAUDO', 'CONSULTA_SALDO'];

const TARIFAS = {
  DEPOSITO: {
    comisionFija: 1200,
    comisionPorcentual: 0,
    limiteMaximo: 3000000,
    requiereCupo: false,
  },
  RETIRO: {
    comisionFija: 1500,
    comisionPorcentual: 0,
    limiteMaximo: 2000000,
    requiereCupo: true,
  },
  PAGO_CREDITO: {
    comisionFija: 900,
    comisionPorcentual: 0.0015,
    limiteMaximo: 5000000,
    requiereCupo: false,
  },
  RECAUDO: {
    comisionFija: 700,
    comisionPorcentual: 0,
    limiteMaximo: 1000000,
    requiereCupo: false,
  },
  CONSULTA_SALDO: {
    comisionFija: 300,
    comisionPorcentual: 0,
    limiteMaximo: 0,
    requiereCupo: false,
  },
};

const HORARIO = { apertura: 6, cierre: 21 };

module.exports = { TIPOS, TARIFAS, HORARIO };
