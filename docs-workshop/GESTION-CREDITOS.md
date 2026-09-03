# Gestión de créditos y licencias de Kiro

Un workshop hands-on de 4 horas consume créditos reales. Este documento existe para que nadie se
quede sin poder trabajar a mitad del Lab 5.

Léelo completo si eres el facilitador. Si eres participante, con las secciones 1, 2 y 5 es suficiente.

---

## 1. Cómo funcionan los créditos de Kiro

Kiro cobra por **créditos**, no por mensaje. Un crédito es una unidad de trabajo, y el consumo es
**fraccionario**: se mide en incrementos de 0,01 crédito.

| Tipo de interacción | Consumo aproximado |
|---------------------|--------------------|
| Pregunta simple, edición puntual | menos de 1 crédito |
| Prompt que genera un archivo completo | 1 a 3 créditos |
| Ejecución de una tarea de una sesión Spec | típicamente más de 1 crédito, a veces varios |
| Ejecución de un hook de tipo agente | consume créditos como cualquier prompt |

Dos consecuencias prácticas:

- **Los hooks cuestan.** Un hook de tipo agente que se dispara en cada guardado de archivo puede
  vaciar la cuota sin que te des cuenta. En el Lab 3 lo tratamos explícitamente.
- **El modelo importa.** El agente `Auto` mezcla modelos y optimiza costo. Correr el mismo prompt
  forzando un modelo premium consume más créditos para el mismo resultado.

---

## 2. Planes disponibles

| Plan | Precio mensual | Créditos / mes | Modelos |
|------|----------------|----------------|---------|
| **Free** | $0 | 50 | Modelos de pesos abiertos y Claude Sonnet 4.5, con límites de tasa |
| **Pro** | $20 USD | 1.000 | Incluye modelos premium |
| **Pro+** | $40 USD | 2.000 | Incluye modelos premium |
| **Pro Max** | $100 USD | 5.000 | Incluye modelos premium |
| **Power** | $200 USD | 10.000 | Incluye modelos premium |

Otros datos relevantes:

- Los créditos **no se acumulan**: lo que no uses en el mes se pierde al reiniciar el ciclo.
- Los planes de pago admiten **consumo por encima de la cuota** a $0,04 USD por crédito, desactivado
  por defecto.
- Al acceder a Kiro por **primera vez** se otorgan **500 créditos de bonificación válidos por 14 días**,
  incluso en el plan Free.
- Las suscripciones son **por usuario**. No se comparten entre miembros de un equipo.
- Colombia está entre los países donde se pueden adquirir planes de pago.

> Fuentes: [Kiro — Pricing](https://kiro.dev/pricing/) y
> [Kiro — Announcing new pricing plans and Auto](https://kiro.dev/blog/new-pricing-plans-and-auto/).
> Contenido reformulado para cumplir con restricciones de licenciamiento. Los precios y cuotas
> cambian; **verifícalos en kiro.dev antes de cada edición del workshop**.

---

## 3. Presupuesto de créditos del workshop

Estimación por laboratorio usando el agente `Auto`, contando solo la **ruta guiada** de cada lab. Es
una estimación de planeación, no una garantía: el consumo real depende de cuánto itere cada participante.

| Lab | Actividad | Prompts | Créditos estimados |
|-----|-----------|:-------:|:------------------:|
| Lab 1 | Entender, documentar y corregir un defecto | 4 | 4 – 6 |
| Lab 2 | Steering files + prueba de verificación | 3 (+2 preguntas) | 3 – 5 |
| Lab 3 | Dos hooks | 2 (+1 prueba) | 2 – 3 |
| Lab 4 | MCP: configurar y consultar | 2 (+2 consultas) | 2 – 4 |
| Lab 5 | Infraestructura: generar, validar y corregir | 6 (+2 iteraciones) | 10 – 14 |
| Lab 6 | Pipeline y runbook | 3 (+1 verificación) | 4 – 6 |
| Lab 7 | Reto integrador | 4 – 6 | 5 – 8 |
| **Total participante** | | **~28–34** | **30 – 46** |

El **Lab 5 es el más caro del workshop**, y con razón: genera varios cientos de líneas de YAML y
después itera corrigiéndolas. Es también el de mayor valor, así que si hay que racionar créditos, se
racionan en los otros.

Los dos bloques de teoría incluyen demos del facilitador (3 prompts cada uno, 3–5 créditos por
sesión) que consumen **de la cuenta del facilitador**, no de la de los participantes.

**Conclusión:** los 50 créditos del plan Free alcanzan **si el participante llega al workshop con la
cuota intacta y trabaja con disciplina**. No alcanzan si ya consumió créditos ese mes o si itera sin
control.

> Esta tabla se calculó después de recortar los labs. Una versión anterior del material tenía casi el
> doble de prompts y no cabía ni en el tiempo ni en la cuota del plan Free. Si extiendes el workshop
> con las secciones **Para después**, recalcula el presupuesto: cada prompt adicional cuenta.

---

## 4. Escenarios de licenciamiento

### Escenario A — Kiro Pro provisto por AWS (preferido)

Si AWS provee suscripciones Pro para los participantes, el problema desaparece: 1.000 créditos por
persona son más que suficientes para 4 horas, con margen para experimentar después del workshop.

**Qué confirmar antes:**
- [ ] Número de licencias disponibles y si cubren a todos los participantes
- [ ] Fecha de activación (deben estar activas **antes** de la Sesión 1)
- [ ] Con qué identidad se asocian (Builder ID, correo corporativo, Identity Center)
- [ ] Duración: ¿solo el workshop o un período de evaluación posterior?
- [ ] Quién es el punto de contacto en AWS para incidencias de licenciamiento

### Escenario B — Plan Free con AWS Builder ID (plan de respaldo)

Cada participante crea su AWS Builder ID gratuito en <https://profile.aws.amazon.com/> e inicia sesión
en Kiro con él. Obtiene 50 créditos mensuales.

**Cómo hacerlo funcionar:**

1. **Cuentas nuevas, creadas en la ventana correcta.** Si el participante nunca ha usado Kiro, que
   cree la cuenta **dentro de los 14 días previos** al workshop para aprovechar los 500 créditos de
   bienvenida. Creada antes, el bono expira.
2. **Cuota intacta.** Pedir en la preparación que no consuman créditos explorando por su cuenta la
   semana previa. Suena contraintuitivo, pero es la diferencia entre terminar el Lab 7 y no llegar.
3. **Trabajo en parejas.** Dos personas, una máquina, una cuota. Además mejora el aprendizaje: uno
   conduce, el otro piensa el prompt. Duplica el margen de créditos.
4. **Usar `Auto`, no modelos premium.** Es lo más eficiente por crédito y en el plan Free es de todos
   modos la única ruta razonable.
5. **Sesiones Vibe, no Spec.** Todos los labs de este workshop están diseñados para ejecutarse en
   modo Vibe. La sesión Spec se muestra como **demo del facilitador** en el bloque teórico, no como
   ejercicio individual, precisamente por su costo en créditos.
6. **Hooks de tipo comando, no de tipo agente,** para las automatizaciones repetitivas. Un hook que
   corre `npx eslint` cuesta cero créditos. Uno que invoca al agente, no.

### Aclaración importante sobre AWS Skill Builder

**AWS Skill Builder no otorga créditos de Kiro.** Son dos cosas distintas:

- **AWS Skill Builder** es la plataforma de formación de AWS. Tiene contenido digital gratuito y
  suscripciones de pago (individual y de equipos) que dan acceso a laboratorios prácticos en la
  consola de AWS. Útil como complemento formativo, pero no habilita Kiro.
- **Los 50 créditos** provienen del **plan Free de Kiro**, al que se accede iniciando sesión en Kiro
  con AWS Builder ID (o con Google/GitHub). No hace falta pasar por Skill Builder.

Si en la conversación con el cliente se mencionó "suscripciones free vía Skill Builder con 50 créditos",
lo que aplica en la práctica es el plan Free de Kiro con AWS Builder ID. El resultado es el mismo
—50 créditos gratis— pero el camino de activación es distinto, y conviene decirlo bien para que nadie
espere el día del workshop una activación que no va a llegar.

> Este punto conviene confirmarlo con el equipo de AWS asignado a la cuenta antes de comprometer un
> escenario de licenciamiento con el cliente.

### Escenario C — Créditos agotados en medio del workshop

Plan de contingencia, en orden:

1. **Reasignar a parejas.** El facilitador junta a quien se quedó sin cuota con alguien que tenga margen.
2. **Continuar con `soluciones/`.** Cada lab tiene su resultado de referencia. El participante sigue el
   razonamiento, lee el artefacto y participa del review sin generar.
3. **Seguir la demo del facilitador.** Los labs 5 y 6 se pueden seguir en modo observación con valor real.
4. **Cuenta de respaldo del facilitador.** Tener una cuenta Pro propia para demostrar en vivo lo que
   los participantes no puedan ejecutar.

---

## 5. Checklist de créditos para el participante

Antes de la Sesión 1:

- [ ] Sé cuál es mi plan (Free / Pro / otro)
- [ ] Verifiqué mis créditos disponibles en el panel de uso de Kiro
- [ ] Tengo al menos 45 créditos disponibles, o ya avisé al facilitador que no
- [ ] Sé que el agente por defecto es `Auto` y que no debo cambiarlo a un modelo premium
- [ ] Entiendo que un hook de tipo agente consume créditos cada vez que se dispara

Durante el workshop:

- [ ] Reviso el consumo al final de cada sesión
- [ ] Antes de repetir un prompt, ajusto el prompt en vez de reintentar igual
- [ ] Doy contexto suficiente en el primer intento: un prompt bien armado cuesta menos que tres vagos

---

## 6. Cómo escribir prompts que cuesten menos

El costo depende de la complejidad, y la complejidad casi siempre viene de la ambigüedad.

| En vez de esto | Haz esto |
|----------------|----------|
| "Mejora este código" | "Agrega JSDoc en español a las 4 funciones de `src/corresponsales/limites.js`" |
| Tres prompts sueltos que piden cosas relacionadas | Un prompt que pida los tres archivos juntos |
| "No, mejor así" repetido cinco veces | Describir el resultado esperado y el formato desde el inicio |
| Repetir el estándar del equipo en cada prompt | Escribirlo una vez en un steering file (Lab 2) |
| Un hook de agente que revisa cada guardado | Un hook de comando que corre el linter |

El Lab 2 es, entre otras cosas, una estrategia de optimización de créditos: lo que queda en un
steering file no se vuelve a pagar en cada prompt.

---

## Siguiente

[Preparación previa](../PREPARACION.md) · [Caso de negocio](./CASO-NEGOCIO.md)
