// Unico archivo de tests que existe hoy en el proyecto.
// Cobertura muy baja a proposito: en el Lab 1 vamos a ampliarla con Kiro.
const { calcularComision } = require('../src/corresponsales/comisiones');

describe('calcularComision', () => {
  test('cobra la comision fija de un deposito', () => {
    expect(calcularComision('DEPOSITO', 100000)).toBe(1200);
  });

  test('falla con un tipo desconocido', () => {
    expect(() => calcularComision('TRANSFERENCIA', 100000)).toThrow();
  });
});
