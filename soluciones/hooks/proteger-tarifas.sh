#!/usr/bin/env bash
#
# Guardarrail sobre la tabla de tarifas de la red de corresponsales.
#
# Los hooks de comando reciben por entrada estandar un JSON con el contexto de
# la sesion, incluida la ruta del archivo que la herramienta va a escribir.
# Aqui solo buscamos una coincidencia de texto: no se evalua ni se ejecuta nada
# del contenido recibido, para no abrir una via de inyeccion.
#
# Salida:
#   - Si el cambio afecta tarifas.js, se imprime una decision de permiso "ask"
#     y Kiro pide confirmacion al usuario antes de continuar.
#   - En cualquier otro caso, se sale en silencio con codigo 0 y el cambio sigue.
#
# Codigos de salida relevantes en PreToolUse:
#   0  exito; la salida estandar se reenvia a Kiro
#   2  bloquea la accion; se reenvia stderr
#
# Ubicacion esperada: .kiro/hooks/proteger-tarifas.sh

set -uo pipefail

entrada="$(cat)"

if printf '%s' "$entrada" | grep -q 'corresponsales/tarifas\.js'; then
  cat <<'JSON'
{
  "hookSpecificOutput": {
    "permissionDecision": "ask",
    "permissionDecisionReason": "src/corresponsales/tarifas.js define las tarifas y los limites de toda la red de corresponsales. Un cambio aqui altera lo que se le cobra a cada punto del pais. Confirma que el cambio fue revisado por el area de producto."
  }
}
JSON
fi

exit 0
