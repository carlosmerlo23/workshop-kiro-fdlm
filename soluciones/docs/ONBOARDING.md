# Onboarding: módulo de corresponsales

Referencia del Lab 1. Lo que debería saber alguien que entra hoy a mantener `src/corresponsales/`.

---

## Qué resuelve este módulo

Autoriza y registra las transacciones que los clientes hacen en la red de corresponsales de Fundación
de la Mujer: comercios aliados —papelerías, misceláneas, ferreterías— habilitados para prestar servicios
financieros en nombre de la entidad y que reciben una comisión por cada transacción. Es el mecanismo
que acerca los servicios financieros a zonas donde no hay oficinas.

Cada operación pasa por cuatro validaciones y, si las supera, genera un comprobante con consecutivo
único que se entrega al cliente.

---

## Flujo de `registrarTransaccion`

```
   payload + corresponsal
           │
           ├──▶ validarTipo      ── falla ──▶ RECHAZADA: TIPO_NO_SOPORTADO
           │
           ├──▶ validarHorario   ── falla ──▶ RECHAZADA: FUERA_DE_HORARIO
           │
           ├──▶ validarMonto     ── falla ──▶ RECHAZADA: LIMITE_EXCEDIDO
           │
           ├──▶ validarCupo      ── falla ──▶ RECHAZADA: CUPO_INSUFICIENTE
           │
           ├──▶ calcularComision
           ├──▶ generarConsecutivo
           │
           └──▶ APROBADA + comprobante
```

El orden importa: se rechaza en la primera validación que falla, así que el motivo que recibe el punto
corresponsal es el de la primera regla incumplida, no necesariamente la única.

---

## Archivos

| Archivo | Responsabilidad |
|---------|-----------------|
| `tarifas.js` | Configuración pura: tabla de tarifas, límites y horario de operación. **Fuente de verdad**: no dupliques estos valores en otro lugar |
| `comisiones.js` | `calcularComision`, `calcularLiquidacion`, `formatearCOP` |
| `limites.js` | `validarTipo`, `validarMonto`, `validarCupo`, `validarHorario`. Cada una devuelve `{ valido, motivo? }` |
| `transacciones.js` | `registrarTransaccion` orquesta las validaciones; `formatearComprobante` arma el soporte para el cliente |
| `../handlers/registrarTransaccion.js` | Adaptador entre Lambda/API Gateway y este dominio. No contiene reglas de negocio |

Dependencias: `transacciones.js` usa `comisiones.js` y `limites.js`; ambos leen de `tarifas.js`.
`tarifas.js` no depende de nada.

---

## Tipos de transacción

Leído de `tarifas.js`. Montos en pesos colombianos.

| Tipo | Comisión | Límite por transacción | Requiere cupo |
|------|----------|------------------------|:-------------:|
| `DEPOSITO` | $1.200 fijos | $3.000.000 | No |
| `RETIRO` | $1.500 fijos | $2.000.000 | **Sí** |
| `PAGO_CREDITO` | $900 + 0,15% del monto | $5.000.000 | No |
| `RECAUDO` | $700 fijos | $1.000.000 | No |
| `CONSULTA_SALDO` | $300 fijos | Sin límite | No |

Horario de operación de la red: 6:00 a 21:00.

---

## Cómo correr el proyecto

```bash
npm install
npm test                  # tests
npm run test:coverage     # tests con reporte de cobertura
npm run lint              # estilo
node src/index.js         # ejecuta cuatro transacciones de ejemplo
```

`node src/index.js` es la forma más rápida de ver el comportamiento: imprime dos comprobantes
aprobados y dos rechazos.

---

## Si tienes que agregar un tipo de transacción

En este orden:

1. **`tarifas.js`**: agrega la entrada con `comisionFija`, `comisionPorcentual`, `limiteMaximo` y
   `requiereCupo`. Agrégalo también al arreglo `TIPOS`.
2. **Revisa si las validaciones existentes alcanzan.** Si la regla nueva no encaja en
   `validarMonto` / `validarCupo` / `validarHorario`, agrega una función a `limites.js` y conéctala en
   `registrarTransaccion`, respetando el orden de rechazo.
3. **Tests**, incluidos los de borde: monto exactamente en el límite, uno por encima, y cupo
   exactamente igual al monto.
4. **Actualiza este documento** y `docs/CASO-NEGOCIO.md`.

> `tarifas.js` está protegido por un hook que pide confirmación antes de modificarlo. Es
> intencional: ese archivo define lo que se le cobra a cada corresponsal del país.

---

## Lo que hay que saber antes de tocar nada

Este módulo tiene deuda conocida. No es descuido del anterior mantenedor: es material didáctico del
workshop, y está documentado en `docs/DEUDA-TECNICA.md` cuando ese archivo se genera.

Los dos puntos con más impacto:

- **`generarConsecutivo` usa la hora del sistema.** No es idempotente: dos reintentos del mismo punto
  producen dos transacciones distintas. En zonas con conectividad intermitente, donde el reintento es
  el caso normal, eso significa duplicados. Se resuelve en la capa de infraestructura con una clave de
  idempotencia en DynamoDB, no en este módulo.
- **`registrarTransaccion` no valida la entrada.** No comprueba que el monto sea positivo ni que sea
  numérico. La validación de forma vive hoy en el handler
  (`src/handlers/registrarTransaccion.js`, función `validarSolicitud`), lo cual funciona pero deja al
  dominio expuesto si alguien lo llama desde otro punto de entrada.

---

## Convenciones del proyecto

- Node.js 22 LTS, CommonJS, sin TypeScript.
- Tests con Jest, en `tests/`, nombrados `<modulo>.test.js`.
- Comentarios y JSDoc en español; identificadores en español.
- Montos siempre en enteros de pesos colombianos. No existen centavos.
- Antes de commitear: `npm run lint` y `npm test` en verde.
