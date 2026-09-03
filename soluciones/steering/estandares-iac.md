---
inclusion: fileMatch
fileMatchPattern: '*.yaml|*.yml|*.tf'
---

# Estándares de infraestructura como código

## Herramienta

CloudFormation en YAML. Terraform solo si hay una razón explícita y documentada.

## Nomenclatura

- Nombres de recursos: `{proyecto}-{ambiente}-{recurso}`, en minúsculas con guiones.
- Nombres lógicos de recursos en la plantilla: en español, descriptivos
  (`TablaTransacciones`, no `DDBTable1`).

## Tags obligatorios

Todo recurso que los soporte lleva:

| Tag | Valor |
|-----|-------|
| `Proyecto` | Nombre del proyecto |
| `Ambiente` | `dev`, `qa` o `prod` |
| `Entidad` | `FundacionDeLaMujer` |
| `AdministradoPor` | `CloudFormation` |

## Seguridad

- Cifrado en reposo obligatorio en todo recurso que almacene datos.
- Preferir clave administrada por el cliente (KMS) sobre clave administrada por el servicio.
- Roles IAM con permisos mínimos: **nunca `Action: "*"` ni `Resource: "*"`** en políticas de recurso.
- Sin acceso público en buckets S3 ni en bases de datos.
- Nada de secretos ni credenciales en la plantilla. Usar SSM Parameter Store o Secrets Manager.

## Estructura de la plantilla

- `Parameters` para nombre de proyecto y ambiente como mínimo. Umbrales y valores que cambian por
  ambiente van en `Parameters`, no en duro.
- `Outputs` con los identificadores que otros stacks puedan necesitar.
- Recursos agrupados por componente, con comentarios de sección.
- Recursos con estado (tablas, colas, claves, log groups) llevan `DeletionPolicy` y
  `UpdateReplacePolicy` explícitos.

## Operación

- Ambientes válidos: `dev`, `qa`, `prod`.
- Región por defecto: `us-east-1`.
- Retención de logs de CloudWatch: mínimo 30 días.
- Toda alarma debe tener una acción asociada y un procedimiento en el runbook. Una alarma sin
  procedimiento es ruido.

## Validación

Toda plantilla debe pasar `cfn-lint` sin errores y la revisión de cumplimiento de `cfn-guard`. Las
violaciones que se decida no aplicar quedan documentadas con un comentario en la plantilla
explicando la razón.

## Idioma

Comentarios en español.
