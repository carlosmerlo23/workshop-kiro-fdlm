# Cierre de la Sesión 1

**Sesión 1 · Minuto 106–120 · 14 minutos**

---

## Lo que construimos

```
✓ Onboarding asistido sobre código que nadie de la sala escribió
  → documentación, JSDoc, defectos encontrados y cobertura de tests

✓ Steering files que codifican el contexto y los estándares del equipo
  → producto, desarrollo, e infraestructura con activación condicional

✓ Hooks que automatizan calidad y protegen lo sensible
  → linter al guardar, exigencia de tests, guardarraíl sobre tarifas

✓ MCP conectando Kiro a la documentación y los validadores de AWS
  → respuestas verificables en lugar de respuestas de memoria
```

Todo eso está commiteado en tu rama y viaja con el repositorio. Quien clone el proyecto hereda el
estándar sin que nadie se lo explique.

---

## Las cuatro ideas que hay que retener

**1. El contexto es la palanca.** La diferencia entre una respuesta mediocre y una útil casi nunca
está en el modelo: está en cuánto contexto le diste. Implícito, explícito con `#`, o persistente en
un steering file.

**2. Generar es rápido; verificar sigue siendo tu trabajo.** Cada lab terminó con un comando que
comprueba el resultado. Ese hábito es lo que separa usar un agente de confiar ciegamente en uno.

**3. Los guardarraíles habilitan la velocidad.** Puedes trabajar en Autopilot en el 95% del código
precisamente porque el 5% sensible está protegido de forma automática.

**4. Lo que se repite, se automatiza o se escribe una vez.** Si lo dices en cada prompt, va en un
steering. Si depende de que alguien se acuerde, va en un hook.

---

## Ronda rápida (5 min)

Antes de cerrar, tres preguntas a la sala. Son cortas y sirven para el plan de adopción de mañana.

**1. ¿Cuál de los cuatro labs les ahorraría más tiempo el lunes?**

No hay respuesta correcta. Suelen dividirse: quien mantiene código heredado dice el Lab 1; quien
lidera un equipo dice el Lab 2. Ambos tienen razón, y es útil que la sala lo escuche.

**2. ¿Qué prompt les funcionó mejor?**

Léanlo textual. Los prompts que funcionaron son lo que la gente se lleva y usa.

**3. ¿Qué les sorprendió, para bien o para mal?**

Incluye lo que no funcionó. Si Kiro se equivocó en algo, decirlo en voz alta vale más que cualquier
demo: la herramienta se usa mejor cuando se conocen sus límites.

---

## Revisión de créditos (2 min)

Abre el panel de uso de Kiro y anota:

```
Créditos consumidos en la Sesión 1: ______________
Créditos disponibles para la Sesión 2: ______________
```

Si te quedan **menos de 20 créditos**, avísale al facilitador ahora. La Sesión 2 es más intensiva
en generación que la primera y conviene resolver el licenciamiento antes, no durante.

---

## Puente a la Sesión 2

Tenemos código funcional, documentado, testeado y con estándares. Falta lo que hace la diferencia
entre un módulo que funciona en una laptop y un servicio que atiende puntos corresponsales en todo
el país:

```
   TENEMOS                        FALTA
   ┌────────────────┐             ┌──────────────────────────────┐
   │ Lógica de      │             │ Dónde corre                  │
   │ negocio        │             │ Cómo se expone               │
   │ validada       │  ────────▶  │ Dónde se guarda              │
   │                │             │ Cómo se despliega            │
   │ Tests          │             │ Cómo se monitorea            │
   │ Documentación  │             │ Qué hacer cuando falle       │
   └────────────────┘             └──────────────────────────────┘
```

En la Sesión 2 Kiro genera esos artefactos: plantilla de infraestructura AWS validada, pipeline de
CI/CD y documentación operativa.

Y hay un pendiente concreto del Lab 1 que se resuelve allá: el consecutivo de transacciones no es
idempotente. En un punto corresponsal con conectividad intermitente, el reintento es el caso normal,
no la excepción. Con DynamoDB lo resolvemos bien.

---

## Si te quedó tiempo o curiosidad

Cada lab tiene una sección **Para después** con lo que no cupo en el bloque. Lo más rentable, en orden:

| Lab | Para después | Por qué vale |
|-----|--------------|--------------|
| Lab 1 | Los otros tres defectos del código | Uno de ellos es el que resolvemos mañana |
| Lab 2 | Escribir el steering de un repositorio propio | Media hora que cambia todas tus interacciones siguientes |
| Lab 3 | El hook de agente que exige tests | Muestra cuándo sí vale gastar créditos en un hook |
| Lab 4 | El servidor MCP de precios | Estimar el costo de una arquitectura antes de construirla |

---

## Antes de la Sesión 2

Cinco minutos de preparación:

- [ ] Commit y push de tu rama: `git push -u origin workshop/<tu-nombre>`
- [ ] Confirmar que los servidores MCP siguen conectados (se necesitan en el Lab 5)
- [ ] Créditos revisados y reportados si están justos
- [ ] Leer el diagrama de arquitectura objetivo en
      [docs/CASO-NEGOCIO.md](../docs/CASO-NEGOCIO.md#a-dónde-llega-en-la-sesión-2)
- [ ] Opcional: si tienes cuenta AWS, verificar `aws sts get-caller-identity`

---

## Pregunta para pensar

> De todo lo que hiciste hoy, **¿qué habrías podido llevar a tu trabajo mañana mismo?**

No la respondas ahora. Tráela a la Sesión 2: el plan de adopción del cierre se construye con esas
respuestas, no con una plantilla genérica.

---

## Siguiente

[Sesión 2 — Recap y objetivos →](../sesion-2/00-recap.md)
