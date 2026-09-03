# Cheatsheet de Kiro

Una página para tener abierta durante los labs.

---

## Contexto explícito en el chat

Escribe `#` en el chat para inyectar contexto. Es la forma más efectiva de mejorar una respuesta
sin gastar créditos en idas y vueltas.

| Referencia | Qué inyecta |
|------------|-------------|
| `#File` | Un archivo específico |
| `#Folder` | Una carpeta completa |
| `#Problems` | Los errores y advertencias del archivo actual |
| `#Terminal` | La salida de la terminal integrada |
| `#Git Diff` | Los cambios sin commitear |

También puedes arrastrar imágenes y documentos (PDF, DOCX) al chat.

---

## Vibe vs Spec

| | Vibe | Spec |
|-|------|------|
| Formato | Conversación libre | Requisitos → diseño → tareas |
| Cuándo | Preguntas, exploración, cambios de 1 a 3 archivos | Features complejas, multi-archivo, con decisiones que hay que documentar |
| Costo en créditos | Menor | Mayor |
| En este workshop | Todos los labs | Demo del facilitador |

---

## Steering files

Ubicación: `.kiro/steering/*.md`

### Modos de inclusión

```markdown
---
inclusion: always
---
```
Por defecto. Se aplica en todas las interacciones.

```markdown
---
inclusion: fileMatch
fileMatchPattern: '*.yaml'
---
```
Se aplica cuando un archivo que coincide entra en contexto.

```markdown
---
inclusion: manual
---
```
Solo cuando lo invocas con `#` en el chat.

```markdown
---
inclusion: auto
name: estandares-iac
description: Estándares de infraestructura como código para AWS
---
```
Se activa cuando tu pedido coincide con la descripción.

### Referenciar otros archivos

```markdown
#[[file:openapi.yaml]]
```
Incluye el contenido de otro archivo dentro del steering. Útil para especificaciones,
esquemas y contratos de API.

### Qué poner y qué no

| Sí | No |
|----|-----|
| Stack, versiones, convenciones de nombres | Instrucciones para una tarea puntual |
| Idioma de respuesta y de comentarios | Secretos, credenciales, tokens |
| Estructura de carpetas del proyecto | Datos reales de clientes |
| Reglas de negocio estables | Preferencias que cambian cada semana |
| Comandos de build y test del proyecto | Novelas: sé conciso, es contexto que se paga |

---

## Hooks

Ubicación: `.kiro/hooks/<id>.json`

### Estructura

```json
{
  "version": "v1",
  "hooks": [{
    "name": "Nombre legible",
    "trigger": "PostFileSave",
    "matcher": "\\.(js|json)$",
    "action": {
      "type": "command",
      "command": "npx eslint --fix"
    }
  }]
}
```

### Triggers disponibles

| Trigger | Cuándo se dispara |
|---------|-------------------|
| `SessionStart` | Al iniciar una sesión |
| `UserPromptSubmit` | Al enviar un mensaje al agente |
| `PreToolUse` | Antes de ejecutar una herramienta |
| `PostToolUse` | Después de ejecutar una herramienta |
| `PostFileCreate` | Al crear un archivo |
| `PostFileSave` | Al guardar un archivo |
| `PostFileDelete` | Al borrar un archivo |
| `PreTaskExec` | Antes de marcar una tarea de spec como en progreso |
| `PostTaskExec` | Después de marcar una tarea de spec como completada |
| `Stop` | Al terminar una ejecución del agente |

### Tipos de acción

```json
"action": { "type": "command", "command": "npm test" }
```
Ejecuta un comando de shell. **No consume créditos.** Recibe contexto de sesión por stdin.

```json
"action": { "type": "agent", "prompt": "Revisa que..." }
```
Inyecta un prompt al agente. **Consume créditos cada vez que se dispara.**

### Códigos de salida en hooks de comando

| Código | Efecto |
|--------|--------|
| `0` | Éxito. La salida estándar se reenvía en `SessionStart`, `UserPromptSubmit` y `PreToolUse` |
| `2` | Bloquea la acción en `PreToolUse`, `UserPromptSubmit` y `PreTaskExec`. Se reenvía `stderr` |
| otro | Falla en silencio, no bloquea |

### Matcher según el trigger

- `PreToolUse` / `PostToolUse`: se evalúa contra el **nombre de la herramienta**
- `PostFileCreate` / `PostFileSave` / `PostFileDelete`: se evalúa contra la **ruta del archivo**
- Los demás triggers ignoran el matcher

---

## MCP

Ubicación del archivo de configuración:

| Alcance | Ruta |
|---------|------|
| Proyecto | `.kiro/settings/mcp.json` |
| Usuario | `~/.kiro/settings/mcp.json` |

Precedencia: la configuración de usuario se mezcla con la del workspace, y la del workspace gana.

### Estructura

```json
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": { "FASTMCP_LOG_LEVEL": "ERROR" },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

- `disabled: true` desactiva el servidor sin borrar la configuración.
- `uvx` descarga y ejecuta el servidor al momento. No existe `uvx install`.
- Los servidores se reconectan al cambiar la configuración, o desde el panel de MCP Server de Kiro.
- Busca `MCP` en la paleta de comandos para ver los comandos disponibles.

### Servidores AWS usados en este workshop

| Servidor | Para qué |
|----------|----------|
| `awslabs.aws-documentation-mcp-server` | Buscar y leer documentación oficial de AWS |
| `awslabs.aws-iac-mcp-server` | Validar plantillas CloudFormation con `cfn-lint` y `cfn-guard`, diagnosticar despliegues |
| `awslabs.aws-pricing-mcp-server` | Consultar precios reales y estimar costos |

---

## Anatomía de un prompt que funciona

```
[QUÉ]      Genera una plantilla de CloudFormation
[DÓNDE]    en infra/cloudformation/corresponsales.yaml
[CON QUÉ]  con API Gateway REST, Lambda Node.js 22, DynamoDB con clave de idempotencia,
           SQS con DLQ y alarmas de CloudWatch para errores y latencia
[CÓMO]     Usa Parameters para nombre de proyecto y ambiente, Outputs con la URL de la API,
           cifrado en reposo en todos los recursos y roles IAM con permisos mínimos
[FORMATO]  YAML, comentarios en español, agrupa los recursos por componente
```

Cinco elementos: qué, dónde, con qué, cómo y en qué formato. Un prompt con los cinco casi nunca
necesita una segunda vuelta.

### Errores comunes

| Error | Corrección |
|-------|------------|
| "Arregla el código" | Decir qué está mal o pedir primero un diagnóstico |
| No decir la ruta del archivo | Siempre indicar dónde va el resultado |
| Pedir cinco cosas no relacionadas | Un prompt por objetivo |
| Repetir el estándar del equipo en cada prompt | Ponerlo en un steering file |
| Aceptar el resultado sin verificar | Correr `npm test`, `cfn-lint`, el linter |

---

## Verificación después de cada lab

```bash
npm test                      # tests
npm run lint                  # estilo
node src/index.js             # comportamiento observable
git diff                      # qué cambió realmente
```

Y en la Sesión 2:

```bash
# validación de la plantilla vía MCP, desde el chat de Kiro:
# "Valida infra/cloudformation/corresponsales.yaml"
```

---

## Recursos

| Recurso | Enlace |
|---------|--------|
| Documentación de Kiro | <https://kiro.dev/docs> |
| Precios de Kiro | <https://kiro.dev/pricing/> |
| Servidores MCP de AWS | <https://awslabs.github.io/mcp/> |
| Instalación de `uv` | <https://docs.astral.sh/uv/getting-started/installation/> |
| Referencia de CloudFormation | <https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/> |
| GitHub Actions | <https://docs.github.com/actions> |
