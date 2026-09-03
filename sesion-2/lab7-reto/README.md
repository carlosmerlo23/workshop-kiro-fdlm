> **Ruta guiada (22 min):** 3 min de brief, 15 min de trabajo, 4 min de entrega.
> La presentación va en el [bloque de cierre](../99-cierre-final.md).
> **[Para después](#para-después):** las extensiones del reto.

---

# Lab 7: Reto integrador por equipos

**Sesión 2 · Minuto 80–102 · 22 minutos**

---

## Formato

Equipos de **2 o 3 personas**, una sola máquina. Quien conduce escribe los prompts; los demás revisan
lo que va saliendo y piensan el siguiente.

No es una concesión por falta de créditos: el que revisa mientras el otro conduce encuentra los
problemas que el que escribe no ve.

```bash
git checkout -b reto/equipo-N
```

---

## El escenario

> **Solicitud de producto.** La red de corresponsales va a habilitar **giros nacionales**. Un cliente
> entrega efectivo en un punto y el beneficiario lo retira en otro punto de la red, en otro municipio.
>
> Reglas que definió producto:
> - Tipo de transacción: `GIRO`
> - Comisión: $2.000 fijos más 0,5% del monto
> - Límite por transacción: $1.500.000
> - El cupo se valida en el punto **de pago**, no en el de origen
> - El giro queda en estado `PENDIENTE_COBRO` hasta que el beneficiario lo retira
>
> Operaciones necesita además poder consultar los giros pendientes de un corresponsal.

---

## Los tres entregables

| # | Entregable | Archivo | Puntos |
|---|-----------|---------|:------:|
| 1 | Tarifa y límite del nuevo tipo | `src/corresponsales/tarifas.js` | 3 |
| 2 | Lógica del giro con sus tests de borde | `src/corresponsales/giros.js` + `tests/giros.test.js` | 4 |
| 3 | Consulta de giros pendientes en la infraestructura | `infra/cloudformation/corresponsales.yaml` | 3 |
| | **Total** | | **10** |

### 1. Tarifa y límite (3 puntos)

Agregar `GIRO` a la tabla de tarifas respetando la estructura que ya existe.

> **Ojo:** `tarifas.js` está protegido por el guardarraíl del Lab 3. Vas a tener que confirmar el
> cambio. Eso es exactamente lo que debe pasar.

### 2. Lógica y tests (4 puntos)

El giro tiene dos momentos —envío y cobro— así que no encaja en `registrarTransaccion` tal como está.
Decidan cómo modelarlo.

**Reutilicen lo que ya existe** (`calcularComision`, `validarMonto`, `validarHorario`) en lugar de
duplicarlo. Es el criterio que más pesa en la evaluación.

Tests de borde obligatorios: monto exactamente en el límite, un peso por encima, y cupo exactamente
igual al monto. Sí, ese último es el que falló en el Lab 1.

### 3. Infraestructura (3 puntos)

Operaciones necesita consultar los giros pendientes de un corresponsal. Con la clave de partición
actual eso obligaría a recorrer la tabla completa. Resuélvanlo bien y justifiquen la decisión.

**La plantilla debe seguir validando.** Una plantilla en rojo vale cero en este entregable.

---

## Reglas

1. **Todo con Kiro.** Corregir a mano está permitido, pero el trabajo pesado lo hace el agente.
2. **`npm test` en verde.** Tests que no pasan no cuentan.
3. **La plantilla debe validar.**
4. **No desplegamos**, y **datos ficticios**, como toda la sesión.

---

## Estrategia sugerida

```
┌──────────────────────────────────────────────────────────────────┐
│  Min 0–2    Leer el escenario y DECIDIR cómo modelar el giro.    │
│             No generar todavía.                                  │
│                                                                  │
│  Min 2–8    Un prompt combinado: tarifa + lógica + tests.        │
│             Correr npm test.                                     │
│                                                                  │
│  Min 8–13   Infraestructura: consulta de pendientes. Validar.    │
│                                                                  │
│  Min 13–15  Commit y push.                                       │
└──────────────────────────────────────────────────────────────────┘
```

**Los dos primeros minutos deciden el resultado.** Los equipos que arrancan generando de inmediato
terminan con el giro modelado de tres formas distintas. Los que deciden primero escriben un prompt que
sale bien en el primer intento.

### Prompts de referencia

No son obligatorios. Están para que no pierdan tiempo en la sintaxis del pedido.

**Dominio:**

> Agrega el tipo de transacción `GIRO` al servicio de corresponsales:
> - En `tarifas.js`: comisión de $2.000 fijos más 0,5% del monto, límite de $1.500.000, requiere cupo
> - En `src/corresponsales/giros.js`: la lógica de envío y de cobro, con estado `PENDIENTE_COBRO`. El
>   cupo se valida en el punto de pago, no en el de origen. Reutiliza `calcularComision`,
>   `validarMonto` y `validarHorario` en lugar de duplicarlos
> - En `tests/giros.test.js`: tests que incluyan monto exactamente en el límite, un peso por encima, y
>   cupo exactamente igual al monto
>
> Los montos son enteros de pesos colombianos. Explícame cómo modelaste los dos momentos del giro.

**Infraestructura:**

> Operaciones necesita consultar los giros pendientes de cobro de un corresponsal. Con la clave de
> partición actual habría que recorrer la tabla completa. Agrega a
> `infra/cloudformation/corresponsales.yaml` lo necesario para resolver esa consulta de forma
> eficiente, actualiza el rol IAM con los permisos mínimos que haga falta, y valida la plantilla.

---

## Rúbrica

| Puntos | Criterio |
|:------:|----------|
| Máximo | Completo, verificado, coherente con lo que ya existía, y con la decisión justificada |
| Mitad | Funciona pero incompleto, o resuelto de forma que no encaja con el diseño existente |
| Cero | No entregado, o entregado en rojo (tests fallando o plantilla que no valida) |

### Lo que suma más allá del puntaje

- **Reutilizó en vez de duplicar.** Lo que más separa un entregable bueno de uno mediocre.
- **Justificó la decisión de modelado.** Un equipo que puede explicar por qué lo hizo así, entendió
  el problema.
- **Encontró algo que nadie pidió.** Un caso de borde, una inconsistencia, un permiso de más.
- **Documentó una limitación conocida.** "Esto no resuelve X" vale más que pretender que sí.

---

## Entrega

```bash
npm test
```

Y en el chat:

> Valida la plantilla y confirma que pasa las verificaciones.

```bash
git add -A
git commit -m "feat: tipo de transaccion GIRO - reto equipo N"
git push -u origin reto/equipo-N
```

---

## Prepara 2 minutos de presentación

Tres cosas, en el bloque de cierre:

1. **Cómo modelaron el giro** y por qué.
2. **Cómo resolvieron la consulta de pendientes.**
3. **El prompt que mejor les funcionó**, textual.

El tercer punto es el más útil para la sala. Los prompts que funcionaron son lo que la gente se lleva
y usa el lunes.

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| El guardarraíl bloquea el cambio en `tarifas.js` | Es el comportamiento correcto. Confirma cuando te lo pregunte |
| No saben cómo modelar los dos momentos | Pregúntenle: "dame dos formas de modelar esto, con pros y contras" |
| La plantilla quedó en rojo | Prioridad uno: en rojo vale cero. Pidan validar y corregir en ciclo |
| Los tests nuevos rompieron los anteriores | Buena señal: hay una inconsistencia real. Léanla antes de "arreglar" el test |
| Se acabó el tiempo | Entreguen lo que tengan, en verde. **Parcial y verificado vale más que completo y roto** |
| Un integrante sin créditos | Conduzcan desde la máquina de quien tenga cuota |

---

## Para llevar

```
┌──────────────────────────────────────────────────────────────────┐
│  ✓ Decidir el modelo antes de generar ahorra más de lo que cuesta│
│  ✓ Reutilizar en vez de duplicar: el criterio que más pesa       │
│  ✓ Parcial y verificado vale más que completo y roto             │
│  ✓ El guardarraíl funcionó: te obligó a confirmar el cambio      │
│  ✓ Los prompts que funcionaron son el entregable que se lleva    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Para después

Las extensiones naturales del reto, si quieren completarlo con calma.

### Alarma de giros inmovilizados

Un giro que queda en `PENDIENTE_COBRO` demasiado tiempo es dinero inmovilizado, y puede ser señal de
un problema operativo en el punto de pago.

> Agrega una alarma de CloudWatch para giros que llevan más de un umbral de días en estado
> `PENDIENTE_COBRO`. El umbral debe venir de un `Parameter`. Explícame qué debería hacer operaciones
> cuando se dispare, y agrégalo al runbook.

### El comprobante doble

El giro genera dos comprobantes: uno de envío y uno de pago. No lo pedimos en la ruta guiada porque
consume tiempo, pero es parte del requisito real.

> Agrega a `src/corresponsales/giros.js` las funciones que formatean el comprobante de envío y el de
> pago. El de envío lleva la clave que el beneficiario necesita para cobrar; el de pago referencia el
> giro original. Genera sus tests.

### Documentación y compuertas

> Actualiza `docs/ARQUITECTURA.md` y `docs/RUNBOOK.md` para incluir el tipo `GIRO`: el flujo de los
> dos momentos, la consulta de pendientes, y los procedimientos operativos nuevos. No reescribas los
> documentos, actualízalos manteniendo la coherencia.

Y un control para que el nuevo tipo no se degrade:

> Crea un hook o una compuerta de PR que garantice que cualquier cambio a `src/corresponsales/giros.js`
> venga con su test actualizado.

### La pregunta difícil

Esta es la que vale más que todo el reto, y no la responde ninguna herramienta:

> El giro mueve efectivo entre dos puntos distintos de la red. ¿Qué pasa si el punto de origen recibe
> el efectivo y el sistema falla antes de registrar el giro? ¿Y si el beneficiario cobra en el punto
> de pago pero la confirmación no llega al origen? Dame los escenarios de inconsistencia y cómo se
> resuelven normalmente en un sistema financiero.

Kiro puede darte el mapa de escenarios y los patrones habituales. La decisión de cuál aplica, con qué
nivel de riesgo y bajo qué política de la entidad, sigue siendo trabajo humano. Es exactamente el
tipo de conversación para la que el workshop les liberó tiempo.

---

## Siguiente

[Resultados, plan de adopción y cierre →](../99-cierre-final.md)
