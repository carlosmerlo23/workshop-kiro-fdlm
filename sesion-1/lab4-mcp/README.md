> **Ruta guiada (18 min):** Partes 1 a 3. Son 2 prompts. Es lo que hacemos en vivo.
> **[Para después](#para-después):** el resto queda como guía para cuando vuelvas al repo.

---

# Lab 4: MCP — Kiro conectado a AWS

**Sesión 1 · Minuto 88–106 · 18 minutos**

---

## Objetivo

Conectar Kiro a servidores MCP de AWS para que consulte documentación oficial y pueda validar
plantillas de infraestructura, en lugar de responder desde lo que recuerda.

## El problema que resuelven

Un modelo tiene fecha de corte de conocimiento. Los servicios de AWS cambian cada semana. El
resultado es predecible: propiedades que ya no existen, sintaxis obsoleta, límites desactualizados.
Y lo peor no es el error: es que suena igual de convincente que un dato correcto.

```
      SIN MCP                                CON MCP
   ┌──────────┐                    ┌──────────┐      ┌────────────────────┐
   │   Kiro   │                    │   Kiro   │─────▶│ Documentación AWS  │
   │ responde │                    │ consulta │      │ (oficial, actual)  │
   │ desde su │                    │ y luego  │      ├────────────────────┤
   │ memoria  │                    │ responde │─────▶│ cfn-lint/cfn-guard │
   └──────────┘                    └──────────┘      │ (validación real)  │
                                                     └────────────────────┘
```

Para la Sesión 2 esto no es un adorno: es la diferencia entre una plantilla de CloudFormation que
**parece** correcta y una que **está** validada.

---

## Lo que vas a lograr

- [ ] Dos servidores MCP de AWS activos en el proyecto
- [ ] Una consulta resuelta con documentación oficial y enlaces verificables
- [ ] Todo listo para el Lab 5

---

## Prerrequisito

```bash
uvx --version
```

Debe responder. Si no, revisa el punto 5 de [PREPARACION.md](../../PREPARACION.md). Sin `uv` este lab
no corre.

---

## Parte 1: Configurar los servidores (7 min)

### 1.1 Crear la carpeta

**macOS / Linux / Git Bash:**
```bash
mkdir -p .kiro/settings
```

**Windows (PowerShell / CMD):**
```powershell
mkdir .kiro\settings
```

### 1.2 Pedirle la configuración a Kiro

> **Prompt 1:**
> Crea `.kiro/settings/mcp.json` con dos servidores MCP de AWS ejecutados vía `uvx`:
>
> 1. `awslabs.aws-documentation-mcp-server@latest`, con el nombre `aws-docs`
> 2. `awslabs.aws-iac-mcp-server@latest`, con el nombre `aws-iac`
>
> Para ambos: `FASTMCP_LOG_LEVEL` en `ERROR`, `disabled` en `false` y `autoApprove` como lista vacía.

### 1.3 Resultado esperado

```json
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": { "FASTMCP_LOG_LEVEL": "ERROR" },
      "disabled": false,
      "autoApprove": []
    },
    "aws-iac": {
      "command": "uvx",
      "args": ["awslabs.aws-iac-mcp-server@latest"],
      "env": { "FASTMCP_LOG_LEVEL": "ERROR" },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### 1.4 Confirmar la conexión

Los servidores se reconectan al guardar la configuración. Si no aparecen, abre el panel
**MCP Server** en el explorador de Kiro y reconéctalos, o busca `MCP` en la paleta de comandos.

Comprueba en el chat:

> Lista las herramientas MCP que tienes disponibles ahora mismo.

Debe enumerar herramientas de los dos servidores.

> **La primera vez tarda:** `uvx` descarga el paquete en ese momento. Si hiciste la prueba previa de
> [PREPARACION.md](../../PREPARACION.md), ya está en caché y arranca en segundos. Si no la hiciste,
> aprovecha estos minutos, no te desesperes.

---

## Parte 2: Documentación oficial en vez de memoria (8 min)

### 2.1 Una pregunta con respuesta verificable

> **Prompt 2:**
> Consultando la documentación oficial de AWS, dime qué propiedades son obligatorias para crear una
> tabla de DynamoDB con CloudFormation, y cómo se configura el cifrado en reposo con una clave
> administrada por el cliente. Cita las páginas de documentación que usaste.

### 2.2 Qué observar

Tres cosas, en orden de importancia:

1. **Kiro invoca una herramienta MCP antes de responder.** Se ve en la conversación.
2. **La respuesta trae enlaces a documentación oficial.** Ábrelos. Están ahí para eso.
3. **Si preguntas por una propiedad que no existe, el servidor no la inventa.**

### 2.3 El punto de fondo

Puede que la respuesta de memoria hubiera sido igual de buena: el modelo sabe bastante de
CloudFormation. Lo relevante es otro:

```
   Sin MCP  →  tienes que confiar
   Con MCP  →  puedes verificar
```

En una entidad financiera, esa diferencia es la que decide si el artefacto se puede auditar.

### 2.4 Una consulta que vas a usar mañana

> Consultando la documentación oficial, dame los tipos de recurso de CloudFormation que necesito para
> exponer una API REST con API Gateway que invoque una función Lambda, incluyendo el permiso de
> invocación. Solo los tipos de recurso y para qué sirve cada uno, en tabla.

Guarda esa respuesta. En el Lab 5 la vas a reconocer.

---

## Parte 3: Lo que acabas de habilitar (3 min)

El segundo servidor, `aws-iac`, no lo usamos todavía. Vale saber qué trae, porque es el protagonista
de la Sesión 2:

| Herramienta | Qué hace |
|-------------|----------|
| `cfn-lint` | ¿Esta plantilla es **válida**? Tipos de recurso, propiedades, referencias |
| `cfn-guard` | ¿Esta plantilla es **segura**? Cifrado, acceso público, permisos excesivos |

Son dos preguntas distintas y las dos hacen falta. Un bucket sin cifrado despliega perfecto: el
problema aparece seis meses después, en una auditoría.

En el Lab 5 el ciclo va a ser este:

```
   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ GENERAR  │───▶│ VALIDAR  │───▶│ CORREGIR │───▶│REVALIDAR │
   └──────────┘    └──────────┘    └──────────┘    └──────────┘
                        │                                │
                        └────── hasta que pase ──────────┘
```

Con una particularidad que es la más importante del workshop: **Kiro no corrige por criterio propio,
corrige leyendo la salida del validador.** Eso es verificable y auditable.

### Antes de cerrar: seguridad

En una entidad financiera esta es la primera pregunta que va a hacer el área de seguridad, así que
conviene tener la respuesta:

- **Los servidores MCP corren localmente**, en tu máquina, comunicándose por entrada y salida
  estándar. No abren puertos de red.
- **Usan tus credenciales de AWS**, y los datos que devuelven las llamadas se comparten con el
  proveedor del modelo. Es el mismo modelo de confianza que ya aceptas al usar el asistente, pero
  conviene decidirlo de forma consciente.
- **Para validar plantillas no se necesita ninguna credencial.** Para diagnosticar despliegues, basta
  con permisos de solo lectura sobre CloudFormation y CloudTrail.
- **Nunca credenciales de producción** en la configuración MCP de una estación de trabajo.
- **`autoApprove` vacío** hasta que conozcas bien el servidor: ahí se listan las herramientas que se
  ejecutan sin pedirte confirmación.

---

## Verificación final

```bash
cat .kiro/settings/mcp.json
```

```
.kiro/settings/
└── mcp.json        ✓ aws-docs + aws-iac activos
```

### Commit

```bash
git add .kiro/settings/mcp.json
git commit -m "feat: configuracion MCP con documentacion y validacion IaC de AWS"
```

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Los servidores no aparecen | Reconéctalos desde el panel MCP Server, o busca `MCP` en la paleta de comandos |
| `uvx: command not found` | `uv` no está instalado o no está en el PATH. Reabre la terminal; si persiste, reinstala |
| El servidor tarda mucho en arrancar | Primera descarga del paquete. La segunda vez es inmediata |
| Falla tras un proxy corporativo | Agrega `HTTP_PROXY` y `HTTPS_PROXY` al bloque `env` del servidor |
| Kiro responde sin usar el servidor | Pídelo explícitamente: "consultando la documentación oficial de AWS, ..." |
| Un servidor que esperabas no está | Puede estar definido en `~/.kiro/settings/mcp.json` o en otra carpeta del workspace |
| Se te acabaron los créditos | Copia el archivo desde `soluciones/mcp/mcp.json` a `.kiro/settings/` |

---

## Para llevar

```
┌──────────────────────────────────────────────────────────────────┐
│  ✓ MCP cambia "recuerdo que" por "consulté y esto dice"          │
│  ✓ cfn-lint valida sintaxis; cfn-guard valida seguridad          │
│  ✓ Los servidores corren local; usan tus credenciales: decídelo  │
│  ✓ autoApprove vacío hasta que conozcas el servidor              │
└──────────────────────────────────────────────────────────────────┘
```

---

## Para después

### Alcance: proyecto o usuario

| Alcance | Ruta | Cuándo |
|---------|------|--------|
| Proyecto | `.kiro/settings/mcp.json` | Servidores del proyecto. Se versiona con el repositorio |
| Usuario | `~/.kiro/settings/mcp.json` | Servidores que usas en todos tus proyectos |

Las configuraciones se mezclan y **la del workspace tiene precedencia**.

### El servidor de precios

```json
"aws-pricing": {
  "command": "uvx",
  "args": ["awslabs.aws-pricing-mcp-server@latest"],
  "env": {
    "AWS_PROFILE": "workshop-kiro",
    "FASTMCP_LOG_LEVEL": "ERROR"
  },
  "disabled": false,
  "autoApprove": []
}
```

Permite preguntar *"¿cuánto costaría al mes esta arquitectura con 50.000 transacciones diarias?"* y
obtener una estimación con precios reales. Requiere credenciales de AWS configuradas localmente.

Es más útil de lo que parece: una arquitectura correcta puede ser inviable económicamente, y esa
conversación es mejor tenerla antes de construirla.

### Qué más existe

El catálogo está en <https://awslabs.github.io/mcp/>. Hay servidores para bases de datos, servicios
específicos, diagramas de arquitectura y más. Muchos tienen instalación de un clic para Kiro.

### Probar el ciclo de validación por tu cuenta

Si quieres adelantarte al Lab 5, este ejercicio muestra el ciclo completo en tres prompts:

> 1. Crea `infra/cloudformation/prueba.yaml` con un bucket S3 **mal hecho a propósito**: sin cifrado,
>    sin bloqueo de acceso público, y con una propiedad mal escrita como `VersioningConfigurationn`.
> 2. Valida esa plantilla con el servidor MCP de IaC y muéstrame los errores con su línea.
> 3. Revisa además el cumplimiento de seguridad, corrige todos los hallazgos y vuelve a validar hasta
>    que pase las dos verificaciones.

Después bórrala: `rm infra/cloudformation/prueba.yaml`

---

## Siguiente

[Cierre de la Sesión 1 →](../99-cierre-sesion-1.md)
