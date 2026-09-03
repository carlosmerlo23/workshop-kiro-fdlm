# Estándares de desarrollo

## Stack

- Node.js 22 LTS, CommonJS. Sin TypeScript por ahora.
- Jest para tests. ESLint para linting.
- AWS SDK v3 cuando haya que hablar con servicios de AWS.

## Estructura de carpetas

| Carpeta | Contenido |
|---------|-----------|
| `src/` | Código de dominio y handlers |
| `tests/` | Tests, nombrados `<modulo>.test.js` |
| `docs/` | Documentación |
| `infra/` | Infraestructura como código |
| `.github/workflows/` | Pipelines |

## Reglas de código

- Comentarios y JSDoc en español. Identificadores en español, consistentes con el código existente.
- Todo cambio de comportamiento llega con su test.
- En funciones que validan límites, montos o cupos, los **tests de casos de borde son obligatorios**:
  valor exacto en el límite, uno por encima y uno por debajo.
- Cálculos monetarios en enteros de pesos colombianos, redondeando al peso.
- Manejo de errores explícito. No dejes errores silenciosos ni `catch` vacíos.
- La lógica de negocio no se duplica en los handlers: los handlers adaptan, el dominio decide.

## Verificación

Antes de commitear, el código debe pasar:

```bash
npm run lint
npm test
```

## Commits

Conventional Commits con descripción en español. Ejemplo:

```
feat: agregar validacion de cupo por corresponsal
fix: corregir comparacion de cupo en el limite exacto
docs: documentar el flujo de idempotencia
```

## Comportamiento esperado del agente

- Al terminar un cambio, indica qué comando debo correr para verificarlo.
- Si un cambio toca reglas de negocio o montos, dilo explícitamente antes de aplicarlo.
- Si detectas un defecto mientras haces otra tarea, repórtalo pero no lo corrijas sin avisar.
