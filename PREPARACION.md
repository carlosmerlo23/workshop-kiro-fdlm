# Preparación previa al workshop

Completa esto **antes** del día de la Sesión 1. Toma entre 30 y 45 minutos.
Si algo falla, avísale al facilitador con anticipación: resolverlo en vivo cuesta tiempo del workshop.

> **¿Prefieres que te lleven de la mano, paso a paso, con instrucciones separadas para Windows y Mac?**
> Ve directo a la **[Guía de instalación](./docs/INSTALACION.md)**. Está escrita para que cualquier
> persona la siga, aunque nunca haya instalado nada de esto. Esta página es el resumen; la guía es el
> detalle.

---

## Resumen: qué necesitas

Esta tabla es el checklist rápido. Cada punto está explicado paso a paso en la
[Guía de instalación](./docs/INSTALACION.md).

| # | Requisito | Bloqueante | Tiempo |
|---|-----------|:----------:|--------|
| 1 | Kiro IDE instalado y con sesión iniciada | Sí | 10 min |
| 2 | Créditos de Kiro disponibles (mínimo 45) | Sí | 5 min |
| 3 | Git configurado y acceso a GitHub | Sí | 5 min |
| 4 | Node.js 20 o superior | Sí | 5 min |
| 5 | Python 3.10+ y `uv` (para MCP) | Sí (Labs 4 y 5) | 10 min |
| 6 | Cuenta AWS con credenciales locales | No (opcional) | 10 min |
| 7 | Repositorio del workshop clonado y probado | Sí | 5 min |

---

## 1. Kiro IDE

### Instalación

Descarga desde [kiro.dev](https://kiro.dev) e instala para tu sistema operativo.

### Inicio de sesión

Kiro permite iniciar sesión con **AWS Builder ID**, Google o GitHub. Para este workshop recomendamos
**AWS Builder ID**: es gratuito, no requiere tarjeta de crédito y es el mismo identificador que se
usa en otros servicios de aprendizaje de AWS.

Crear un AWS Builder ID: <https://profile.aws.amazon.com/>

### Verificación

Abre Kiro, inicia una sesión de chat y escribe:

> Hola, responde en una línea confirmando que estás activo.

Si responde, el punto 1 está listo.

---

## 2. Créditos de Kiro

Este es el punto que más problemas causa. Lee [docs/GESTION-CREDITOS.md](./docs/GESTION-CREDITOS.md)
completo, pero lo esencial:

- El plan **Free** incluye **50 créditos al mes**, que no se acumulan de un mes al siguiente.
- El workshop consume aproximadamente **35 a 45 créditos** en total.
- Si ya usaste créditos este mes, es probable que no te alcancen.

### Verifica tus créditos

En Kiro, abre el panel de suscripción / uso (dashboard de créditos) y anota:

```
Plan actual: ______________
Créditos usados este mes: ______________
Créditos disponibles: ______________
```

Reporta este dato al facilitador. Si tienes **menos de 45 créditos disponibles**, el facilitador
te asignará una pareja de trabajo o una licencia Pro si hay disponibles.

> **Nota sobre créditos de bienvenida:** cuando accedes a Kiro por primera vez recibes 500 créditos
> de bonificación válidos por 14 días. Si nunca has usado Kiro, **crea tu cuenta dentro de los 14 días
> previos al workshop** para tener ese margen disponible durante las sesiones. Si la creas antes, el
> bono puede haber expirado.

---

## 3. Git y GitHub

```bash
git --version          # debe responder 2.30 o superior
git config --global user.name           # debe tener tu nombre
git config --global user.email          # debe tener tu correo
```

Si falta configuración:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu.correo@fundaciondelamujer.com"
```

Necesitas además poder hacer `push` a un repositorio. En el Lab 6 se trabaja con GitHub Actions,
así que una cuenta de GitHub (personal o corporativa) es necesaria.

---

## 4. Node.js

```bash
node --version         # debe ser v20.x o superior
npm --version
```

Si no lo tienes, instala la versión LTS desde [nodejs.org](https://nodejs.org).

---

## 5. Python y `uv` (para los servidores MCP)

Los servidores MCP de AWS que se usan en los Labs 4 y 5 se ejecutan con `uvx`, que viene con `uv`.

```bash
python3 --version      # debe ser 3.10 o superior
```

### Instalar `uv`

**macOS / Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**macOS con Homebrew:**
```bash
brew install uv
```

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**Con pip (cualquier sistema):**
```bash
pip install uv
```

### Verificación

```bash
uv --version
uvx --version
```

Guía oficial de instalación: <https://docs.astral.sh/uv/getting-started/installation/>

> `uvx` descarga y ejecuta el servidor MCP en el momento; no hace falta instalar cada servidor por
> separado. La primera descarga puede tardar un par de minutos, así que conviene hacer la prueba
> del punto 5.1 antes del workshop y no en vivo.

### 5.1 Prueba anticipada (recomendada)

```bash
uvx awslabs.aws-documentation-mcp-server@latest --help
```

Si imprime la ayuda del comando (o arranca y queda esperando, en cuyo caso corta con `Ctrl+C`),
la descarga funcionó y en el Lab 4 el servidor arrancará en segundos.

---

## 6. Cuenta AWS (opcional)

**El workshop no despliega infraestructura real.** Generamos y validamos plantillas, no creamos
recursos. Por eso una cuenta AWS **no es obligatoria**.

Es útil tenerla si quieres:
- Usar el servidor MCP de precios para estimar el costo de la arquitectura.
- Usar la funcionalidad de diagnóstico de despliegues fallidos del servidor MCP de IaC.

Si tienes cuenta, configura un perfil local:

```bash
aws configure --profile workshop-kiro
aws sts get-caller-identity --profile workshop-kiro
```

> Usa una cuenta de desarrollo o sandbox. Nunca configures credenciales de producción para un workshop.

---

## 7. Clonar y probar el proyecto base

```bash
git clone https://github.com/carlosmerlo23/workshop-kiro-fdlm.git workshop-kiro-fdlm
cd workshop-kiro-fdlm
npm install
npm test
node src/index.js
```

### Salida esperada de `npm test`

```
PASS tests/comisiones.test.js
  calcularComision
    ✓ cobra la comision fija de un deposito
    ✓ falla con un tipo desconocido

Tests: 2 passed, 2 total
```

### Salida esperada de `node src/index.js`

Cuatro bloques: dos comprobantes aprobados y dos transacciones rechazadas
(`CUPO_INSUFICIENTE` y `LIMITE_EXCEDIDO`).

> Si te parece raro que una de esas dos se rechace, tomá nota. En el Lab 1 lo revisamos.

Finalmente, abre la carpeta en Kiro: **File → Open Folder → `workshop-kiro-fdlm`**.

---

## Checklist final

Marca todo antes del día del workshop:

- [ ] Kiro instalado, sesión iniciada y respondiendo en el chat
- [ ] Créditos disponibles verificados y reportados al facilitador
- [ ] `git --version`, `node --version` y `uv --version` responden
- [ ] `uvx awslabs.aws-documentation-mcp-server@latest --help` descargó sin errores
- [ ] Repositorio clonado, `npm install` y `npm test` en verde
- [ ] Carpeta abierta en Kiro
- [ ] (Opcional) Perfil AWS configurado y `aws sts get-caller-identity` funcionando

---

## Problemas frecuentes

| Problema | Causa probable | Solución |
|----------|----------------|----------|
| Kiro no responde en el chat | Sesión expirada | Cerrar y volver a iniciar sesión con Builder ID |
| Kiro responde "sin créditos" | Cuota mensual agotada | Ver [GESTION-CREDITOS.md](./docs/GESTION-CREDITOS.md); trabajar en pareja |
| `uvx: command not found` | `uv` no está en el PATH | Reabrir la terminal; si persiste, reinstalar `uv` |
| `npm install` falla por proxy corporativo | Red restringida | Configurar `npm config set proxy` con los datos de TI |
| `node: command not found` en la terminal de Kiro | Terminal abierta antes de instalar Node | Cerrar y reabrir la terminal integrada |
| Antivirus corporativo bloquea Kiro | Política de endpoint | Escalar a TI antes del workshop, no el mismo día |
| `mkdir -p` no funciona en Windows | Terminal es CMD o PowerShell | Cambiar la terminal integrada a Git Bash |

---

## Siguiente

Con el checklist completo, arrancamos en [Sesión 1 — Bienvenida](./sesion-1/00-bienvenida.md).
