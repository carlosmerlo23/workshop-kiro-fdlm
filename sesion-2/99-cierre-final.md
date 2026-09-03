# Resultados, plan de adopción y cierre

**Sesión 2 · Minuto 102–120 · 18 minutos**

---

## 1. Presentación de resultados (8 min)

Cada equipo, 2 minutos:

1. Cómo modelaron el giro y por qué
2. Cómo resolvieron la consulta de giros pendientes
3. **El prompt que mejor les funcionó**, leído textualmente

Mientras escuchas, anota los prompts de los otros equipos. Es lo que te vas a llevar y usar.

### Puntaje

El facilitador suma con la rúbrica de [lab7-reto](./lab7-reto/README.md#rúbrica).

| Reconocimiento | Criterio |
|----------------|----------|
| Mejor solución integral | Mayor puntaje total |
| Mejor decisión de arquitectura | Modelado del giro y consulta de pendientes |
| Mejor prompt | Votación de la sala |
| Mejor hallazgo | El equipo que encontró algo que nadie pidió |

---

## 2. Lo que se construyó en 4 horas (2 min)

```
┌───────────────────────────────────────────────────────────────────┐
│  ARTEFACTOS GENERADOS                                             │
├───────────────────────────────────────────────────────────────────┤
│  Documentación   ONBOARDING · DEUDA-TECNICA · ARQUITECTURA        │
│                  RUNBOOK · JSDoc en el código                     │
│                                                                   │
│  Configuración   3 steering files · 3 hooks · 2 servidores MCP    │
│                                                                   │
│  Código          handler Lambda con idempotencia                  │
│                  tests de borde en varios módulos                 │
│                  defecto de validación corregido                  │
│                                                                   │
│  Infraestructura plantilla CloudFormation completa                │
│                  validada con cfn-lint y cfn-guard                │
│                  6 alarmas con acción asociada                    │
│                                                                   │
│  Pipelines       CI · validación de infraestructura · gate de PR  │
└───────────────────────────────────────────────────────────────────┘
```

La pregunta honesta no es cuántos artefactos salieron. Es esta:

> **¿Cuánto habría tomado esto con el método actual del equipo?**

Respóndanla entre ustedes, con su propia experiencia. Es el único número que sirve para justificar
una decisión de adopción, y es un número que solo ustedes pueden estimar.

---

## 3. Las ideas que sobreviven al workshop (2 min)

**El contexto es la palanca, no el modelo.** La diferencia entre una respuesta inútil y una útil casi
siempre está en cuánto contexto le diste. Por eso el Lab 2 es el que más rinde a largo plazo.

**Generar es rápido; verificar sigue siendo el trabajo.** Cada lab terminó con un comando que
comprueba el resultado. Ese hábito es lo que hace la diferencia entre acelerar y acumular deuda a
mayor velocidad.

**Los guardarraíles habilitan la velocidad.** Puedes trabajar en Autopilot en el 95% del código
precisamente porque el 5% sensible está protegido de forma automática.

**El validador es la fuente de verdad, no el agente.** Kiro corrigió la plantilla porque `cfn-lint` le
dijo qué estaba mal. Ese patrón —herramienta determinista que verifica lo que el modelo genera— es
lo que hace auditable el resultado.

**Lo que más se posponía es lo que más se acelera.** Runbooks, documentación de arquitectura, alarmas,
tests de borde. Son texto estructurado y repetitivo. Es donde el agente rinde más, y es justo lo que
antes nunca alcanzaba el tiempo.

---

## 4. Plan de adopción (3 min)

Un workshop sin siguiente paso concreto se olvida en dos semanas.

### Esta semana: lo que se puede hacer sin permiso de nadie

- [ ] Crear `.kiro/steering/` en un repositorio real del equipo con el contexto de negocio de ese producto
- [ ] Un hook de comando que corra el linter o los tests al guardar
- [ ] Usar Kiro para documentar un módulo que hoy nadie entiende del todo
- [ ] Configurar los servidores MCP de AWS en tu proyecto

### Este mes: lo que requiere acuerdo del equipo

- [ ] Steering files versionados en los repositorios principales, revisados como se revisa el código
- [ ] Validación de IaC en el pipeline de al menos un servicio
- [ ] Un runbook generado para un servicio que hoy no lo tiene
- [ ] Definir qué archivos merecen guardarraíl (tarifas, tasas, políticas IAM, plantillas de producción)
- [ ] Acordar el criterio de uso: qué se genera con IA y qué se revisa siempre a mano

### Este trimestre: lo que requiere decisión

- [ ] Modelo de licenciamiento definido: cuántas licencias, de qué plan, para quién
- [ ] Reglas de `cfn-guard` propias de la entidad, más allá de las genéricas
- [ ] Postura de seguridad sobre MCP: qué servidores se aprueban y con qué permisos
- [ ] Medir el impacto: tiempo de onboarding, cobertura de tests, tiempo de generación de artefactos
- [ ] Decidir si Spec sessions entran al flujo formal de documentación de features

Detalle en [docs/PLAN-ADOPCION.md](../docs/PLAN-ADOPCION.md).

---

## 5. Compromiso individual

Cada participante escribe una frase, concreta y con fecha:

```
Esta semana voy a usar Kiro para ______________________________________

en el repositorio _____________________________________________________

y el resultado que espero es __________________________________________
```

Y ahora vuelve a la pregunta del ice-breaker de la Sesión 1:

> *¿Cuál es la tarea de tu trabajo que más tiempo te quita y menos te aporta?*

¿Es una de las que vimos hoy? Si sí, ya sabes por dónde empezar. Si no, vale la pena revisar si Kiro
tiene algo que decir al respecto: probablemente sí, y no lo cubrimos en cuatro horas.

---

## 6. Créditos consumidos

```
Créditos usados en total: ______________
Créditos restantes este mes: ______________
```

Este dato importa para dimensionar el licenciamiento. Cuatro horas de trabajo intensivo dan una
referencia razonable de lo que consume una jornada real de desarrollo asistido.

---

## Cierre

```
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│   Kiro no reemplaza el criterio del equipo. Lo libera del         │
│   trabajo que no lo necesitaba.                                   │
│                                                                   │
│   Las cuatro horas de hoy no fueron sobre escribir código más     │
│   rápido. Fueron sobre dejar de posponer lo que siempre queda     │
│   para después: documentar, testear los bordes, escribir el       │
│   runbook, validar la infraestructura antes de desplegarla.       │
│                                                                   │
│   Esa es la parte del trabajo que decide si un servicio se        │
│   puede operar y auditar. Ahora tienen cómo hacerla sin que       │
│   cueste una semana.                                             │
│                                                                   │
│   Gracias, Fundación delamujer.                                   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Recursos para seguir

| Recurso | Enlace |
|---------|--------|
| Documentación de Kiro | <https://kiro.dev/docs> |
| Precios y planes | <https://kiro.dev/pricing/> |
| Servidores MCP de AWS | <https://awslabs.github.io/mcp/> |
| Referencia de CloudFormation | <https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/> |
| Reglas de cfn-guard | <https://github.com/aws-cloudformation/cloudformation-guard> |
| GitHub Actions | <https://docs.github.com/actions> |
| Repositorio de este workshop | `[URL DEL REPO]` |
| Canal de soporte post-workshop | `[POR DEFINIR]` |

---

## Feedback

> Encuesta de cierre: `[URL POR DEFINIR]`

Cuatro preguntas que de verdad nos sirven:

1. ¿Qué lab te resultó más útil y por qué?
2. ¿Qué lab sobraba o se sentía apurado?
3. ¿Qué vas a usar esta semana?
4. ¿Qué tema quedó fuera y te habría gustado cubrir?

---

## Material del workshop

Todo el contenido queda en este repositorio, incluidas las soluciones de referencia en
`soluciones/`. Es tuyo: reutilízalo, adáptalo y compártelo con quien no pudo venir.

Si quieres replicar el workshop para otro equipo, en
[docs/ADAPTAR-A-OTRO-CLIENTE.md](../docs/ADAPTAR-A-OTRO-CLIENTE.md) está lo que hay que cambiar.
