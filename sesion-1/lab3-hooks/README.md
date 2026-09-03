> **Ruta guiada (18 min):** Partes 1 a 3. Son 2 prompts. Es lo que hacemos en vivo.
> **[Para después](#para-después):** el resto queda como guía para cuando vuelvas al repo.

---

# Lab 3: Hooks — calidad automática sin fricción

**Sesión 1 · Minuto 70–88 · 18 minutos**

---

## Objetivo

Automatizar dos cosas que hoy dependen de que alguien se acuerde: que el linter corra, y que nadie
toque la tabla de tarifas sin darse cuenta de lo que está tocando.

## El problema que resuelven

Un estándar que depende de la memoria de las personas se cumple a veces.

```
   Steering  →  "así hacemos las cosas"      (contexto persistente)
   Hooks     →  "esto se ejecuta, punto"     (automatización por evento)
```

---

## Lo que vas a lograr

- [ ] Un hook que corre el linter al guardar código, sin consumir créditos
- [ ] Un guardarraíl que exige confirmación antes de modificar la tabla de tarifas

---

## Parte 1: Anatomía de un hook (3 min)

Un hook es un archivo JSON en `.kiro/hooks/<id>.json`:

```json
{
  "version": "v1",
  "hooks": [{
    "name": "Nombre legible",
    "trigger": "PostFileSave",
    "matcher": "\\.js$",
    "action": {
      "type": "command",
      "command": "npm run lint"
    }
  }]
}
```

Cuatro decisiones: cuándo se dispara (`trigger`), sobre qué aplica (`matcher`, una expresión
regular), y qué hace (`action`).

### La decisión que más importa: comando o agente

| | Hook de comando | Hook de agente |
|-|-----------------|----------------|
| Qué hace | Ejecuta un comando de shell | Inyecta un prompt al agente |
| **Costo en créditos** | **Cero** | **Consume créditos cada disparo** |
| Determinista | Sí | No |
| Bueno para | Linters, tests, formateadores | Revisiones que requieren juicio |

> **La trampa más común:** un hook de agente en `PostFileSave` se dispara decenas de veces por hora
> y puede vaciar la cuota mensual en una tarde de trabajo normal. Si un comando puede hacerlo, que lo
> haga un comando.

### Cómo se crean

Se los pides a Kiro, que es lo que harías en tu día a día. También hay interfaz gráfica: sección
**Agent Hooks** del explorador, o `Open Kiro Hook UI` en la paleta de comandos.

---

## Parte 2: Linter al guardar (7 min)

### 2.1 Pedirlo

> **Prompt 1:**
> Crea un hook en `.kiro/hooks/lint-al-guardar.json` que cuando guarde un archivo `.js` en `src/` o
> `tests/` ejecute `npm run lint`. Debe ser de **tipo comando**, no de tipo agente, para que no
> consuma créditos.

### 2.2 Resultado esperado

```json
{
  "version": "v1",
  "hooks": [{
    "name": "Lint al guardar",
    "trigger": "PostFileSave",
    "matcher": "(src|tests)/.*\\.js$",
    "action": {
      "type": "command",
      "command": "npm run lint"
    }
  }]
}
```

### 2.3 Probarlo

Abre `src/corresponsales/comisiones.js`, agrega esta línea a propósito y guarda:

```javascript
const noSeUsa = 1;   // ESLint lo va a reportar
```

El hook se dispara y corre el linter. Ahora borra la línea y guarda de nuevo.

> **El matcher se evalúa contra la ruta del archivo** en los triggers de tipo archivo. En
> `PreToolUse` y `PostToolUse`, en cambio, se evalúa contra el **nombre de la herramienta**. Es la
> confusión más frecuente con los matchers.

---

## Parte 3: El guardarraíl (7 min)

Los triggers `Pre*` pueden **bloquear** una acción o **pedir confirmación** antes de que ocurra. Es
el mecanismo para proteger lo que no debería cambiarse por accidente.

Nuestro caso: `src/corresponsales/tarifas.js`. Es la tabla de tarifas y límites. Un cambio ahí altera
lo que se le cobra a cada corresponsal del país.

### 3.1 Copiar el script

Este hook necesita un script que lea el contexto de la sesión y devuelva la decisión. Te lo damos
hecho para no gastar el lab en shell:

```bash
mkdir -p .kiro/hooks
cp soluciones/hooks/proteger-tarifas.sh .kiro/hooks/
chmod +x .kiro/hooks/proteger-tarifas.sh
```

Ábrelo y mira lo esencial: si el cambio afecta `tarifas.js`, imprime esto y sale con código `0`.

```json
{
  "hookSpecificOutput": {
    "permissionDecision": "ask",
    "permissionDecisionReason": "tarifas.js define las tarifas y límites de la red..."
  }
}
```

Con `permissionDecision: "ask"`, Kiro le pregunta al usuario antes de continuar.

### 3.2 Crear el hook

> **Prompt 2:**
> Crea un hook en `.kiro/hooks/proteger-tarifas.json` con `trigger: PreToolUse`, un matcher que
> aplique a las herramientas de escritura de archivos, y una acción de tipo comando que ejecute
> `bash .kiro/hooks/proteger-tarifas.sh`.

### 3.3 Probarlo

> Cambia la comisión fija de DEPOSITO a 1500 en `src/corresponsales/tarifas.js`.

Debe aparecer la confirmación con la razón que explica qué es ese archivo.

**Rechaza el cambio.** La tarifa se queda como está.

```bash
git diff src/corresponsales/tarifas.js   # debe estar vacío
```

### 3.4 Por qué esto es lo que importa

Los guardarraíles no son burocracia: son lo que te permite trabajar en Autopilot sin miedo. Le das
autonomía al agente en el 95% del código precisamente porque el 5% sensible está protegido de forma
automática.

Candidatos naturales en una entidad financiera: tablas de tarifas y tasas, reglas de límites,
políticas IAM, plantillas de infraestructura de producción, configuración de retención de datos.

> Los códigos de salida de un hook de comando: `0` éxito y se reenvía la salida estándar;
> **`2` bloquea la acción** y se reenvía `stderr`; cualquier otro falla en silencio.
> Si un hook deniega el permiso explícitamente, no reintentes la operación.

---

## Verificación final

```bash
ls -la .kiro/hooks/
npm test
git diff src/corresponsales/tarifas.js   # vacío
```

```
.kiro/hooks/
├── lint-al-guardar.json      ✓ comando · PostFileSave · 0 créditos
├── proteger-tarifas.json     ✓ comando · PreToolUse · guardarraíl
└── proteger-tarifas.sh       ✓ script de decisión
```

### Commit

```bash
git add .kiro/hooks/
git commit -m "feat: hooks de lint al guardar y proteccion de la tabla de tarifas"
```

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| El hook no se dispara | Revisa el regex. Recuerda escapar el punto: `\\.js$`, no `.js$` |
| El matcher no coincide | En triggers de archivo se evalúa la **ruta**; en `PreToolUse`, el **nombre de la herramienta** |
| El hook de comando falla en silencio | Corre el comando a mano en la terminal para ver el error real |
| El guardarraíl no pide confirmación | Verifica que el script sea ejecutable y que salga con código `0` |
| El linter no encuentra `npm` | El hook hereda el entorno del IDE. Reabre Kiro si instalaste Node después |
| Se te acabaron los créditos | Copia los archivos desde `soluciones/hooks/` a `.kiro/hooks/` |

---

## Para llevar

```
┌──────────────────────────────────────────────────────────────────┐
│  ✓ Steering dice cómo; hooks garantizan que se ejecute           │
│  ✓ Si un comando puede hacerlo, que lo haga un comando: 0 créditos│
│  ✓ PreToolUse = guardarraíl sobre lo que no debe cambiarse solo  │
│  ✓ Los guardarraíles son lo que permite trabajar en Autopilot    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Para después

### Un hook de agente, donde sí hace falta juicio

Evaluar si un módulo nuevo necesita test, y de qué tipo, es algo que un comando no puede hacer.

> Crea un hook en `.kiro/hooks/exigir-test.json` que cuando se cree un archivo `.js` dentro de
> `src/corresponsales/` inyecte un prompt al agente indicando: que se creó un módulo nuevo, que debe
> existir el test correspondiente en `tests/<modulo>.test.js`, y que si el módulo valida montos o
> límites los tests de borde son obligatorios. De tipo agente, con `trigger: PostFileCreate`.

Probarlo:

```bash
touch src/corresponsales/liquidacion.js
# ... el hook reacciona ...
rm src/corresponsales/liquidacion.js
```

Ese hook está bien en `PostFileCreate`, que pasa pocas veces al día. El mismo hook en `PostFileSave`
sería un problema de cuota.

### Todos los triggers disponibles

| Trigger | Cuándo se dispara | Frecuencia | Tipo recomendado |
|---------|-------------------|------------|------------------|
| `SessionStart` | Al iniciar una sesión | Baja | Cualquiera |
| `UserPromptSubmit` | Al enviar un mensaje | Alta | Comando |
| `PreToolUse` | Antes de ejecutar una herramienta | Media-alta | Comando |
| `PostToolUse` | Después de ejecutar una herramienta | Media-alta | Comando |
| `PostFileCreate` | Al crear un archivo | Baja | Comando o agente |
| `PostFileSave` | Al guardar un archivo | Muy alta | **Solo comando** |
| `PostFileDelete` | Al borrar un archivo | Baja | Comando o agente |
| `PreTaskExec` | Antes de iniciar una tarea de spec | Baja | Cualquiera |
| `PostTaskExec` | Al completar una tarea de spec | Baja | Comando o agente |
| `Stop` | Al terminar una ejecución del agente | Media | Comando |

### Higiene de hooks

Para cada hook que tengas, tres preguntas: ¿cuántas veces al día se dispara?, ¿consume créditos?,
¿vale eso lo que aporta? Si se dispara cien veces al día y es de tipo agente, cámbialo a comando o
cámbiale el trigger.

Para silenciar un hook sin borrarlo, renombra el archivo a `.json.off`: queda documentado y no se
dispara.

### Cuidado con los ciclos

Un hook `PreToolUse` que exige usar una herramienta que a su vez dispara el mismo hook crea un bucle.
Si detectas el patrón, cambia el trigger o el matcher.

---

## Siguiente

[Lab 4: MCP — Kiro conectado a AWS →](../lab4-mcp/README.md)
