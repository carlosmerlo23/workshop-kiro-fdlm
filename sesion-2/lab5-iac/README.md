> **Ruta guiada (34 min):** Partes 1 a 5. Son 6 prompts. Es lo que hacemos en vivo.
> **[Para después](#para-después):** el resto queda como guía para cuando vuelvas al repo.

---

# Lab 5: Infraestructura generada y validada con Kiro

**Sesión 2 · Minuto 18–52 · 34 minutos**

---

## Objetivo

Convertir la lógica de negocio en una plantilla de CloudFormation completa, segura y **validada**,
sin escribir YAML a mano ni memorizar propiedades de recursos.

Es el lab más importante del workshop. El resto de la sesión se apoya en lo que salga de acá.

## Recordatorio

**No desplegamos nada.** Generamos, validamos y documentamos. No hace falta cuenta de AWS.

---

## Lo que vas a lograr

- [ ] `infra/cloudformation/corresponsales.yaml`: la plantilla completa del servicio
- [ ] La plantilla pasando `cfn-lint` **y** la revisión de seguridad
- [ ] Alarmas de CloudWatch definidas junto a la infraestructura
- [ ] `docs/ARQUITECTURA.md` generado desde la plantilla real

---

## Parte 1: El adaptador ya está hecho (4 min)

Antes de la infraestructura hace falta un handler: el código que traduce entre Lambda y el dominio.
**Te lo damos hecho** en `src/handlers/registrarTransaccion.js`, porque generarlo consume el tiempo
que queremos gastar en la parte interesante.

Ábrelo y busca dos cosas. Son las que después se reflejan en la plantilla.

### 1.1 El handler adapta, no decide

Busca la llamada a `registrarTransaccion`. La regla de negocio sigue viviendo en
`src/corresponsales/`. Si la hubiéramos copiado al handler, tendríamos dos verdades sobre cuánto se
le cobra a un corresponsal, y tarde o temprano se separan.

### 1.2 La idempotencia son dos pasos, no uno

Busca `GetCommand` y después `ConditionExpression`. Son dos cosas distintas:

```
   1. Consultar por la referencia   →  responde rápido al reintento
   2. Escribir CON condición        →  cierra la ventana entre consulta y escritura
```

Solo el primer paso deja un hueco: entre la consulta y la escritura, dos peticiones simultáneas del
mismo punto pasarían las dos. La condición `attribute_not_exists` es lo que lo cierra.

> **Esto es lo que le faltaba a `generarConsecutivo` en la Sesión 1.** Usaba la hora del sistema, así
> que cada reintento producía una transacción distinta y el cliente aparecía con dos retiros. En un
> punto rural con señal intermitente, el reintento es el caso normal, no la excepción.

Ahora ya sabes por qué la tabla de DynamoDB que vas a generar tiene como clave de partición la
referencia de idempotencia y no un ID cualquiera.

---

## Parte 2: Generar la plantilla (8 min)

### 2.1 Crear la carpeta

**macOS / Linux / Git Bash:**
```bash
mkdir -p infra/cloudformation
```

**Windows (PowerShell / CMD):**
```powershell
mkdir infra\cloudformation
```

### 2.2 El prompt principal

Es el prompt más grande del workshop. Fíjate en su estructura: qué, dónde, con qué, cómo.

> **Prompt 1:**
> Consultando la documentación oficial de AWS a través del servidor MCP, genera
> `infra/cloudformation/corresponsales.yaml`: una plantilla de CloudFormation para el servicio de
> transacciones de la red de corresponsales.
>
> **Recursos:**
> - API Gateway REST con un recurso `/transacciones` y método `POST`, integración proxy con Lambda,
>   API key requerida y su usage plan
> - Función Lambda `registrar-transaccion` en Node.js 22, timeout de 10 segundos, con las variables
>   de entorno para los nombres de tabla y cola
> - Tabla DynamoDB con clave de partición `referenciaIdempotencia`, facturación bajo demanda,
>   cifrado en reposo y point-in-time recovery
> - Cola SQS para liquidación de comisiones con su dead letter queue y `maxReceiveCount` de 3
> - Parámetro de SSM Parameter Store para la configuración de tarifas
> - Log group de CloudWatch para la Lambda con retención explícita
> - Rol IAM para la Lambda con permisos mínimos: solo las acciones necesarias sobre esa tabla, esa
>   cola y ese parámetro
>
> **Estructura:**
> - `Parameters`: `NombreProyecto` y `Ambiente` (valores permitidos `dev`, `qa`, `prod`)
> - `Outputs`: URL de la API, nombre de la tabla, URL de la cola y ARN de la función
> - Agrupa los recursos por componente con comentarios de sección
>
> Sigue los estándares de infraestructura del proyecto. Comentarios en español.

Esto va a tardar. Son varios cientos de líneas de YAML. Aprovecha para mirar el siguiente punto
mientras corre.

### 2.3 El detalle que hay que notar

Cuando termine, busca en la plantilla cosas que **no pediste**:

- [ ] ¿Tiene los tags `Proyecto`, `Ambiente`, `Entidad`, `AdministradoPor`?
- [ ] ¿Los nombres siguen el patrón `{proyecto}-{ambiente}-{recurso}`?
- [ ] ¿La retención de logs es de al menos 30 días?
- [ ] ¿El rol IAM evita `Action: "*"`?

Nada de eso está en el prompt. Está en `.kiro/steering/estandares-iac.md`, el archivo que creaste en
el Lab 2 y que se activó solo al generar un archivo `.yaml`.

```
   Sin ese steering  →  este prompt necesitaría 15 líneas más
                     →  o esos puntos aparecerían como hallazgos de seguridad
```

> **El trabajo de la Sesión 1 acaba de reducir el trabajo de la Sesión 2.** Si a tu plantilla le
> faltan los tags, revisa el `fileMatchPattern` del steering: probablemente no coincide.

---

## Parte 3: Validar y corregir (12 min)

El corazón del lab. Aquí es donde Kiro deja de ser un generador de texto.

### 3.1 Sintaxis y esquema

> **Prompt 2:**
> Valida `infra/cloudformation/corresponsales.yaml` con el servidor MCP de IaC. Muéstrame los
> errores y advertencias con su número de línea y la ruta de la propiedad.

Es normal que aparezcan hallazgos en el primer intento. **Eso es exactamente el punto del ejercicio.**

### 3.2 Seguridad y cumplimiento

> **Prompt 3:**
> Ahora revisa el cumplimiento de seguridad de la plantilla. Agrupa las violaciones por recurso y
> dime cuáles son críticas y cuáles no aplican para nuestro caso.

Fíjate en la última parte del prompt. La revisión de seguridad corre contra un conjunto amplio de
reglas y algunas no aplican: puede pedir replicación entre regiones o bloqueo de objetos donde no
tiene sentido para este servicio.

**Distinguir el hallazgo crítico del ruido es criterio humano.** La herramienta no sabe que este
servicio solo opera en Colombia.

### 3.3 Corregir en ciclo

> **Prompt 4:**
> Corrige todos los errores de sintaxis y las violaciones de seguridad que sean críticas para este
> servicio. Para las que decidas no aplicar, agrega un comentario en la plantilla explicando por qué.
> Después vuelve a correr las dos validaciones y muéstrame el resultado.

Repite hasta que ambas pasen. Si se cicla en un hallazgo, dale contexto de negocio:

> Ese hallazgo pide replicación entre regiones. Este servicio opera solo en Colombia y la entidad no
> tiene requisito de multi-región para este dominio. Documenta la excepción con un comentario y
> continúa.

### 3.4 Lo que acabas de ver

Detente 30 segundos en esto, porque es la idea que justifica todo el workshop:

```
   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ GENERAR  │───▶│ VALIDAR  │───▶│ CORREGIR │───▶│REVALIDAR │
   └──────────┘    └──────────┘    └──────────┘    └──────────┘
        │               │                                │
        │               └────── hasta que pase ──────────┘
        │
        └── Kiro NO corrigió por criterio propio.
            Corrigió leyendo la salida de un validador.
```

Esa diferencia es lo que hace el resultado **auditable**. No estás confiando en que el modelo sepa
CloudFormation: estás confiando en `cfn-lint`, que es determinista y verificable. Y queda evidencia
de que se validó.

---

## Parte 4: Observabilidad (6 min)

Un servicio sin alarmas es un servicio que se cae en silencio, hasta que llama un corresponsal.

> **Prompt 5:**
> Agrega a la plantilla una sección de observabilidad con alarmas de CloudWatch para:
> - Errores de la Lambda
> - Duración de la Lambda cerca del timeout
> - Throttling de la Lambda
> - Mensajes visibles en la dead letter queue mayor que cero
> - Errores 5xx en API Gateway
> - Latencia p99 de API Gateway
>
> Los umbrales deben venir de `Parameters` con valores por defecto razonables, no estar en duro.
> Agrega un tópico SNS para las notificaciones y conecta las alarmas a él.
>
> Después dame una tabla con: qué significa cada alarma en términos de negocio y qué debería hacer
> quien la reciba. Y vuelve a validar la plantilla.

### 4.1 La tabla es el verdadero entregable

Esa tabla —qué significa y qué hacer— es la semilla del runbook del Lab 6. Guárdala.

> **Una alarma sin acción asociada es ruido.** Al mes nadie las mira, y cuando de verdad pasa algo,
> el correo se pierde entre las otras cuarenta.

Mira un ejemplo de la diferencia que hace traducir a negocio:

| Alarma técnica | Qué significa para el negocio |
|----------------|-------------------------------|
| `Errors > 5` en Lambda | Hay clientes parados en el mostrador sin poder transar |
| Mensajes en la DLQ | Hay corresponsales a los que no les llegó su comisión |
| Latencia p99 alta | Hay fila en los puntos, y los dispositivos empiezan a reintentar |

---

## Parte 5: Documentar la arquitectura (4 min)

> **Prompt 6:**
> Genera `docs/ARQUITECTURA.md` **leyendo `infra/cloudformation/corresponsales.yaml`**, no desde
> supuestos. Incluye:
> - Diagrama de la arquitectura en ASCII
> - Tabla de recursos: nombre lógico, tipo, propósito en términos de negocio
> - Cómo se resuelve la idempotencia y por qué importa para un punto corresponsal
> - Tabla de alarmas con su significado de negocio y la acción esperada
> - Decisiones de diseño con su justificación, incluyendo las excepciones de seguridad documentadas
> - Qué falta para llevar esto a producción
>
> En español, directo, sin relleno.

### 5.1 Lee la última sección

"Qué falta para llevar esto a producción" es la sección que casi nadie escribe y la que más se
agradece tres meses después. Es el inventario de deuda con el que arrancaría el equipo.

---

## Verificación final

```bash
npm test
ls -R infra/
```

Y en el chat:

> Valida `infra/cloudformation/corresponsales.yaml` con las dos verificaciones y confírmame que pasa
> ambas.

```
infra/cloudformation/
└── corresponsales.yaml       ✓ sintaxis OK · seguridad OK
docs/
└── ARQUITECTURA.md           ✓ generado desde la plantilla
```

### Commit

```bash
git add infra/ docs/ARQUITECTURA.md
git commit -m "feat: infraestructura CloudFormation del servicio de corresponsales

- API Gateway, Lambda, DynamoDB con idempotencia, SQS+DLQ, SSM y CloudWatch
- Alarmas de errores, latencia, throttling y DLQ con notificacion SNS
- Rol IAM con permisos minimos
- Plantilla validada en sintaxis y cumplimiento de seguridad
- Documentacion de arquitectura generada desde la plantilla"
```

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| El servidor MCP de IaC no responde | Reconéctalo desde el panel MCP Server. La validación es el núcleo del lab |
| La plantilla no tiene los tags del steering | Revisa el `fileMatchPattern` en `.kiro/steering/estandares-iac.md` |
| La revisión de seguridad reporta decenas de violaciones | Normal: una regla revisa varias subpropiedades. Pídele que las agrupe por recurso |
| Se cicla corrigiendo el mismo hallazgo | Dale contexto de negocio y pídele documentar la excepción con un comentario |
| La plantilla quedó enorme y cuesta leerla | Pídele agrupar por componente con comentarios de sección |
| El prompt principal tarda mucho | Son cientos de líneas de YAML. Es normal. Aprovecha para leer la Parte 2.3 |
| Vas retrasado | Salta la Parte 5 y haz commit. Lo importante es tener la plantilla validada |
| Se te acabaron los créditos | Copia `soluciones/iac/corresponsales.yaml` a `infra/cloudformation/` y pide validarla |

---

## Para llevar

```
┌──────────────────────────────────────────────────────────────────┐
│  ✓ El handler adapta; la lógica de negocio no se duplica         │
│  ✓ Idempotencia = consultar + escribir con condición             │
│  ✓ El steering aplicó seguridad sin que lo pidieras              │
│  ✓ Kiro se corrige con la salida de un validador, no con opinión │
│  ✓ Distinguir hallazgo crítico de ruido es trabajo humano        │
│  ✓ Las alarmas se definen junto con la infraestructura           │
│  ✓ La documentación se genera desde el artefacto real            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Para después

### Revisar el rol IAM a fondo

Con la plantilla en verde, hazle una pregunta que ninguna herramienta responde:

> Revisa el rol IAM de la Lambda y dime, acción por acción, por qué la necesita. Si alguna es más
> amplia de lo necesario, acótala.

La revisión de seguridad verifica que no haya `Action: "*"`. No verifica que un permiso
`dynamodb:Scan` no tenga razón de existir cuando el handler solo hace `GetItem` y `PutItem`.

```
   cfn-lint     →  es válida
   cfn-guard    →  no es evidentemente insegura
   tu criterio  →  es correcta para este caso
```

Las tres capas hacen falta. Las dos primeras son automáticas; la tercera es tuya, y ahora tienes
tiempo para hacerla porque no lo gastaste escribiendo YAML.

### Tests del handler con mocks del SDK

> Genera tests del handler `src/handlers/registrarTransaccion.js` usando mocks del cliente de DynamoDB
> y de SQS. Cubre: transacción aprobada, rechazo por regla de negocio, y reintento con una referencia
> ya existente.

Los tests que ya existen en `tests/registrarTransaccion.test.js` cubren solo las funciones puras, que
es lo que se puede probar sin montar infraestructura. Los del flujo completo necesitan mocks y son un
buen ejercicio para hacer con calma.

### Estimar el costo

Con el servidor MCP de precios habilitado:

> ¿Cuánto costaría al mes esta arquitectura con 50.000 transacciones diarias en us-east-1? Desglosa
> por servicio.

Una arquitectura correcta puede ser inviable económicamente, y esa conversación es mejor tenerla
antes de construirla.

### La ruta Terraform

Si tu equipo trabaja con Terraform, el ciclo es idéntico y cambian las herramientas.

> Genera el equivalente de esta arquitectura como módulo de Terraform en
> `infra/terraform/modules/corresponsales/`, con `main.tf`, `variables.tf`, `outputs.tf` y `README.md`.
> Usa Terraform 1.5+ y el proveedor de AWS 5.x. Todas las variables con `description` y `validation`.

```bash
terraform fmt -check -recursive infra/terraform/
terraform -chdir=infra/terraform/modules/corresponsales init -backend=false
terraform -chdir=infra/terraform/modules/corresponsales validate
```

Para la capa de seguridad, el equivalente de `cfn-guard` es `tfsec` o `checkov`. El patrón
generar → validar → corregir → revalidar no cambia.

Y un ejercicio que enseña más de lo que parece:

> Compara el módulo Terraform con la plantilla CloudFormation: líneas de código, legibilidad, y qué
> expresa mejor cada uno.

### El paso previo al despliegue: change set

CloudFormation permite una vista previa antes de crear recursos. Valida cosas que solo se ven en el
contexto de la cuenta: conflictos de nombres con recursos existentes y restricciones en operaciones
de borrado.

```
   cfn-lint  →  cfn-guard  →  change set  →  deploy
   (local)      (local)       (en la cuenta)
```

Es la última red antes de tocar recursos reales.

---

## Siguiente

[Lab 6: El pipeline que valida siempre →](../lab6-pipeline/README.md)
