> **Ruta guiada (20 min):** Partes 1 a 3. Son 3 prompts. Es lo que hacemos en vivo.
> **[Para después](#para-después):** el resto queda como guía para cuando vuelvas al repo.

---

# Lab 6: El pipeline que valida siempre

**Sesión 2 · Minuto 60–80 · 20 minutos**

---

## Objetivo

Convertir la validación que acabas de hacer a mano en una condición del repositorio, y generar el
runbook que necesita quien opere el servicio.

## Por qué este lab cierra el ciclo

En el Lab 5 validaste la plantilla desde el chat. Eso funciona mientras tú te acuerdes de hacerlo.

```
   Lab 4  →  el validador existe
   Lab 5  →  lo usaste tú, a mano
   Lab 6  →  lo usa el repositorio, siempre, sin depender de nadie
```

---

## Lo que vas a lograr

- [ ] `.github/workflows/validar-infra.yml`: valida la plantilla en cada cambio de `infra/`
- [ ] `docs/RUNBOOK.md`: qué hacer cuando algo falle
- [ ] Criterio sobre qué debe bloquear y qué solo advertir

---

## Parte 1: Validación de infraestructura en el pipeline (8 min)

Es la parte que la mayoría de los pipelines no tiene, y la que conecta directo con el Lab 5.

### 1.1 Crear la carpeta

**macOS / Linux / Git Bash:**
```bash
mkdir -p .github/workflows
```

**Windows (PowerShell / CMD):**
```powershell
mkdir .github\workflows
```

### 1.2 Generar el workflow

> **Prompt 1:**
> Genera `.github/workflows/validar-infra.yml`, un workflow de GitHub Actions que:
>
> - Se ejecute en push a `main` y en pull requests, **solo** cuando cambien archivos bajo `infra/`
>   o el propio workflow
> - Instale `cfn-lint` con pip, fijando la versión, y valide todas las plantillas de
>   `infra/cloudformation/`
> - Falle si `cfn-lint` reporta errores
> - Publique el resultado como resumen de la ejecución en GitHub
> - **No requiera credenciales de AWS**: es validación local del archivo
> - Use permisos mínimos a nivel de workflow
>
> Nombres de pasos en español. Explícame por qué el filtro de rutas importa.

### 1.3 El punto clave: no necesita credenciales

Este workflow **no toca AWS**. Valida un archivo. Las consecuencias son grandes:

```
   Validar plantilla   →  sin credenciales  →  puede correr en cualquier PR
   Desplegar plantilla →  con credenciales  →  solo en ramas protegidas
```

Confundir esas dos etapas es un error común de diseño de pipelines, y una fuente de riesgo real: un
workflow con credenciales que corre en PRs de cualquier origen es una puerta abierta.

### 1.4 La conexión que cierra el círculo

> **Pregunta al grupo:** ¿este workflow aplica las reglas de `.kiro/steering/estandares-iac.md`?

No. Y entender por qué es importante:

```
   Steering  →  guía a Kiro cuando genera.  Aplica si usas Kiro.
   Pipeline  →  verifica el resultado.      Aplica siempre, sin importar
                                            quién escribió el archivo ni con qué.
```

Las dos capas se necesitan. El steering **evita** el error; el pipeline lo **detecta** si igual
ocurrió. Si mañana alguien escribe una plantilla a mano en el Notepad, el steering no lo alcanza pero
el pipeline sí.

---

## Parte 2: El runbook (9 min)

El artefacto que nadie escribe hasta que hace falta a las 2 de la mañana.

### 2.1 Generar desde los artefactos reales

> **Prompt 2:**
> Genera `docs/RUNBOOK.md` para el servicio de corresponsales, leyendo
> `infra/cloudformation/corresponsales.yaml` y `src/handlers/registrarTransaccion.js`. Incluye:
>
> - Descripción del servicio en un párrafo y su impacto de negocio si se cae
> - Tabla de alarmas: nombre, qué significa en términos de negocio, severidad, primeros pasos
> - Procedimiento paso a paso para cada escenario:
>   - La Lambda está lanzando errores
>   - La dead letter queue tiene mensajes acumulados
>   - Un corresponsal reporta una transacción duplicada
>   - Un corresponsal reporta que un retiro válido fue rechazado
> - Consultas de CloudWatch Logs Insights útiles para diagnosticar
> - Cómo cambiar una tarifa sin desplegar código
> - Criterio y procedimiento de rollback
>
> En español, con procedimientos accionables con comandos concretos, no descripciones generales.

### 2.2 Mira los dos últimos escenarios

"Transacción duplicada" y "retiro válido rechazado" no son escenarios inventados: **son los dos
defectos que encontraste en el Lab 1.** Ahora tienen un procedimiento operativo asociado.

Ese es el recorrido completo del workshop en una línea:

```
   Lab 1  →  encontraste el defecto
   Lab 5  →  lo resolviste en la arquitectura
   Lab 6  →  documentaste qué hacer si vuelve a aparecer
```

### 2.3 La prueba del runbook

> **Prompt 3:**
> Evalúa el runbook que acabas de generar con este criterio: ¿alguien que no conoce este servicio
> podría seguirlo a las 2 de la mañana sin llamar a nadie? Dime qué pasos son demasiado vagos y
> reescríbelos con comandos y valores concretos.

Un runbook que dice "revisar los logs" no sirve. Uno que dice qué log group, qué consulta y qué buscar,
sí. Este prompt es el que hace la diferencia, y funciona con cualquier documento que generes.

---

## Parte 3: Qué bloquea y qué advierte (3 min)

Con el pipeline funcionando, la decisión de diseño que queda es la más política de todas.

Los otros dos workflows del repositorio están listos para que los mires: `soluciones/workflows/ci.yml`
(lint, tests y umbral de cobertura) y `soluciones/workflows/pr-validation.yml` (convenciones de PR y
una compuerta sobre la tabla de tarifas).

### El detalle que vale ver en `pr-validation.yml`

Ábrelo y busca el job `compuerta-tarifas`. Es el mismo control que en el Lab 3 hiciste como hook de
Kiro, pero ahora vive en el repositorio:

```
   Hook de Kiro   →  te avisa mientras trabajas
                  →  aplica solo si usas Kiro

   Compuerta CI   →  bloquea el merge
                  →  aplica a todo el mundo, siempre
```

Un control que solo vive en el IDE de quien lo configuró no es un control. El hook mejora la
experiencia; la compuerta es la que garantiza.

### La conversación que importa

> **Pregunta al grupo:** ¿cuáles de estas validaciones deberían **bloquear** un merge y cuáles solo
> **advertir**, en un servicio transaccional de una entidad financiera?

| Validación | ¿Bloquea o advierte? |
|------------|----------------------|
| Tests fallando | |
| Cobertura por debajo del umbral | |
| Error de sintaxis en la plantilla | |
| Hallazgo de seguridad en la plantilla | |
| Título del PR sin convención | |
| Cambio en la tabla de tarifas sin revisión de producto | |

No hay una respuesta única. Pero sí una trampa conocida: **un pipeline que bloquea por todo se
termina saltando** con permisos de administrador, y entonces no protege nada. La disciplina de elegir
es lo que lo mantiene vivo.

---

## Verificación final

```bash
ls -la .github/workflows/
```

Y en el chat:

> Revisa `.github/workflows/validar-infra.yml` y confírmame que el YAML es válido, que los permisos
> son mínimos y que no hay secretos en texto plano.

```
.github/workflows/
└── validar-infra.yml       ✓ cfn-lint, sin credenciales, con filtro de rutas
docs/
└── RUNBOOK.md              ✓ procedimientos accionables
```

### Commit y push

```bash
git add .github/ docs/RUNBOOK.md
git commit -m "feat: validacion de infraestructura en CI y runbook operativo"
git push -u origin workshop/<tu-nombre>
```

> Si haces push a un repositorio de GitHub con Actions habilitado, el workflow **se ejecuta de verdad**.
> Es la única parte del workshop que corre fuera de tu máquina, y vale la pena verla pasar a verde.

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| El workflow no se dispara | Debe estar en `.github/workflows/` en la raíz del repo y Actions habilitado |
| El filtro de rutas nunca se activa | Los patrones son relativos a la raíz: `infra/**`, no `/infra/**` |
| `cfn-lint` falla en el pipeline pero pasa en local | Fija la versión de la herramienta en el workflow |
| No tienes repositorio remoto | Los workflows quedan generados y revisados igual. El valor está en el artefacto |
| El runbook quedó genérico | Usa el Prompt 3: es el que lo vuelve accionable |
| Vas retrasado | El runbook es lo más valioso. Si hay que saltar algo, salta la Parte 3 |
| Se te acabaron los créditos | Usa `soluciones/workflows/` y `soluciones/docs/RUNBOOK.md` |

---

## Para llevar

```
┌──────────────────────────────────────────────────────────────────┐
│  ✓ Validar a mano depende de la memoria; el pipeline no          │
│  ✓ Validar plantillas no necesita credenciales; desplegar sí      │
│  ✓ Steering evita el error; el pipeline lo detecta               │
│  ✓ Un control que vive solo en tu IDE no es un control           │
│  ✓ Decide qué bloquea y qué advierte, o te lo van a saltar       │
│  ✓ El runbook se genera desde los artefactos, no desde la memoria │
└──────────────────────────────────────────────────────────────────┘
```

---

## Para después

### El pipeline de integración continua

> Genera `.github/workflows/ci.yml` que se ejecute en push a `main` y en pull requests, use Node.js 22
> con caché de npm, corra `npm ci`, luego lint, luego tests con cobertura, publique el reporte como
> artefacto, y falle si la cobertura de sentencias baja del 60%. Permisos mínimos y cancelación de
> ejecuciones anteriores del mismo branch.

Y una pregunta que vale hacerle:

> ¿Por qué lint antes de tests y no al revés?

La respuesta tiene que ver con costo: el linter tarda segundos y los tests minutos. **Fallar temprano
y barato** es un principio de diseño de pipelines, no una preferencia estética.

### La compuerta de pull requests

> Genera `.github/workflows/pr-validation.yml` que en cada pull request hacia `main`: verifique que el
> título siga Conventional Commits, que el PR tenga descripción, y que bloquee el merge si
> `src/corresponsales/tarifas.js` cambió sin que el PR tenga la etiqueta `revisado-producto`. Comenta
> el resultado en el PR. Permisos mínimos.

### La capa de seguridad en el pipeline

El workflow de referencia en `soluciones/workflows/validar-infra.yml` agrega un segundo job con
`cfn-guard` y el conjunto de reglas de referencia de AWS. Está configurado para **advertir sin
bloquear**, y el comentario en el archivo explica por qué: el conjunto genérico es amplio y algunas
reglas no aplican.

Cuando la entidad tenga su propio conjunto de reglas, ese paso pasa a ser bloqueante. Ese es el
siguiente paso natural después del workshop.

### Cadena de suministro

> ¿Las versiones de las actions están fijadas de forma segura? Explícame el riesgo de usar una
> referencia móvil en una action de terceros.

Una action referenciada por etiqueta móvil puede cambiar de contenido sin que tú cambies nada. Para
actions oficiales el riesgo es bajo; para las de terceros conviene fijar el commit.

### Despliegue

Lo que no cubrimos: el workflow que efectivamente despliega. Requiere credenciales, y por eso vive en
otra categoría de riesgo. El patrón recomendado es OIDC con un rol de IAM en lugar de llaves de
acceso de larga vida, y ejecución solo desde ramas protegidas con aprobación manual para producción.

> Genera un workflow de despliegue que use OIDC para asumir un rol de IAM, ejecute
> `aws cloudformation deploy` con un change set, y requiera aprobación manual para el ambiente de
> producción. Explícame qué hay que configurar en la cuenta de AWS para que OIDC funcione.

---

## Siguiente

[Lab 7: Reto integrador por equipos →](../lab7-reto/README.md)
