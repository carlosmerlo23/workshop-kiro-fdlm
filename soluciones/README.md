# Soluciones de referencia

Esta carpeta contiene el resultado esperado de cada laboratorio.

## Cómo usarla

**Intenta el lab antes de abrir esto.** El valor del workshop está en escribir el prompt, no en
copiar el archivo. Si copias, te llevas el artefacto pero no la habilidad.

Dicho eso, hay tres momentos legítimos para venir acá:

1. **Te quedaste sin créditos.** Copia lo que necesites y sigue participando del razonamiento y del
   review. Aprender del artefacto de otro sigue siendo aprender.
2. **Te atrasaste y el grupo avanzó.** Copia y ponte al día. Vale más seguir el hilo del workshop que
   quedarte peleando con un prompt.
3. **Terminaste y quieres comparar.** El más interesante de los tres. Las diferencias entre tu
   resultado y este son el material del review.

## Qué hay acá

| Carpeta | Contenido | Lab |
|---------|-----------|-----|
| `steering/` | Los tres steering files | Lab 2 |
| `hooks/` | Hooks y el script del guardarraíl | Lab 3 |
| `mcp/` | Configuración de servidores MCP | Lab 4 |
| `iac/` | Plantilla CloudFormation completa | Lab 5 |
| `docs/` | Onboarding, arquitectura y runbook | Labs 1, 5 y 6 |
| `workflows/` | Los tres workflows de GitHub Actions | Lab 6 |

## Rutas de destino

Si vas a copiar, estas son las rutas donde va cada archivo:

```bash
# Lab 2 — steering
mkdir -p .kiro/steering
cp soluciones/steering/*.md .kiro/steering/

# Lab 3 — hooks
mkdir -p .kiro/hooks
cp soluciones/hooks/*.json soluciones/hooks/*.sh .kiro/hooks/
chmod +x .kiro/hooks/proteger-tarifas.sh

# Lab 4 — MCP
mkdir -p .kiro/settings
cp soluciones/mcp/mcp.json .kiro/settings/

# Lab 5 — infraestructura
mkdir -p infra/cloudformation
cp soluciones/iac/corresponsales.yaml infra/cloudformation/

# Lab 6 — workflows
mkdir -p .github/workflows
cp soluciones/workflows/*.yml .github/workflows/

# Documentación (labs 1, 5 y 6)
cp soluciones/docs/*.md docs/
```

## Estado de verificación

Lo que se comprobó de estos artefactos:

| Artefacto | Verificación |
|-----------|--------------|
| `iac/corresponsales.yaml` | `cfn-lint` sin errores, advertencias ni informativos |
| `hooks/proteger-tarifas.sh` | Probado con un cambio a `tarifas.js` y con un cambio a otro archivo |
| `hooks/*.json` y `mcp/mcp.json` | JSON válido |
| `workflows/*.yml` | YAML válido |
| Proyecto base (`src/`, `tests/`) | `npm test` y `npm run lint` en verde |

Lo que **no** se comprobó, y conviene saberlo:

- Los workflows **no se han ejecutado en GitHub Actions.** La sintaxis es válida y la lógica está
  revisada, pero un workflow solo se verifica de verdad corriéndolo.
- La plantilla **no se ha desplegado en AWS.** Pasa la validación local, que es distinto de haber
  creado los recursos. El propio workshop insiste en esa diferencia.
- El servidor MCP `aws-pricing` viene con `disabled: true` porque requiere credenciales de AWS.

## Nota sobre los datos

Todo dato en estos archivos es ficticio: corresponsales, documentos de identidad, tarifas y límites.
No corresponden a información real de clientes ni a las tarifas vigentes de la entidad.
