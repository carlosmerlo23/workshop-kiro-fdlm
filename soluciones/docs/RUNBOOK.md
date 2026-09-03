# Runbook: servicio de transacciones de corresponsales

Referencia del Lab 6. Procedimientos operativos para atender incidentes del servicio.

> **Material didáctico.** Los nombres de recursos, umbrales y rutas de escalamiento son de ejemplo.
> Un runbook real se valida ejecutándolo en un simulacro, no escribiéndolo.

---

## El servicio en un párrafo

Autoriza las transacciones que los clientes realizan en la red de corresponsales: depósitos, retiros,
pagos de crédito, recaudos y consultas de saldo. Los dispositivos de los puntos llaman a
`POST /transacciones` en API Gateway, que invoca una Lambda; la Lambda valida contra las reglas de
negocio, registra en DynamoDB y publica un mensaje en SQS para liquidar la comisión del corresponsal.

**Si el servicio se cae:** ningún punto de la red puede transar. El cliente que está frente al
mostrador no puede retirar ni consignar, el corresponsal no genera comisión, y la entidad pierde
cobertura efectiva en las zonas donde no hay oficina. Es un incidente de cara al cliente.

---

## Convención de nombres

Todos los recursos siguen `{proyecto}-{ambiente}-{recurso}`. En producción:

```
   Lambda      corresponsales-prod-registrar-transaccion
   Tabla       corresponsales-prod-transacciones
   Cola        corresponsales-prod-liquidaciones
   DLQ         corresponsales-prod-liquidaciones-dlq
   Log group   /aws/lambda/corresponsales-prod-registrar-transaccion
   Log API     /aws/apigateway/corresponsales-prod-api
   Parámetro   /corresponsales/prod/tarifas
```

---

## Tabla de alarmas

| Alarma | Significado de negocio | Severidad | Primer paso |
|--------|------------------------|-----------|-------------|
| `errores-funcion` | Clientes que no pueden transar | **Alta** | [Escenario 1](#escenario-1-la-lambda-está-lanzando-errores) |
| `errores-5xx-api` | La API responde con error a los puntos | **Alta** | [Escenario 1](#escenario-1-la-lambda-está-lanzando-errores) |
| `throttling-funcion` | Rechazos por capacidad, no por negocio | **Alta** | [Escenario 3](#escenario-3-throttling-o-latencia-alta) |
| `latencia-api` | Fila en los puntos, reintentos en curso | Media | [Escenario 3](#escenario-3-throttling-o-latencia-alta) |
| `duracion-funcion` | Antesala del timeout | Media | [Escenario 3](#escenario-3-throttling-o-latencia-alta) |
| `mensajes-en-dlq` | Comisiones sin liquidar | Media | [Escenario 2](#escenario-2-la-dlq-tiene-mensajes-acumulados) |

---

## Escenario 1: la Lambda está lanzando errores

**Síntoma:** alarma `errores-funcion` o `errores-5xx-api`. Los puntos reportan que no pueden transar.

### Diagnóstico

```bash
# 1. Ver el volumen y el tipo de error en los últimos 30 minutos
aws logs start-query \
  --log-group-name /aws/lambda/corresponsales-prod-registrar-transaccion \
  --start-time $(($(date +%s) - 1800)) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, mensaje, error, referencia
                  | filter nivel = "ERROR"
                  | sort @timestamp desc
                  | limit 50'
```

```bash
# 2. Agrupar los errores por mensaje para ver si es uno solo o varios
aws logs start-query \
  --log-group-name /aws/lambda/corresponsales-prod-registrar-transaccion \
  --start-time $(($(date +%s) - 1800)) \
  --end-time $(date +%s) \
  --query-string 'fields mensaje
                  | filter nivel = "ERROR"
                  | stats count() as total by mensaje
                  | sort total desc'
```

```bash
# 3. Confirmar si la tabla o la cola están rechazando operaciones
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB --metric-name ThrottledRequests \
  --dimensions Name=TableName,Value=corresponsales-prod-transacciones \
  --start-time "$(date -u -v-30M +%Y-%m-%dT%H:%M:%S)" \
  --end-time "$(date -u +%Y-%m-%dT%H:%M:%S)" \
  --period 300 --statistics Sum
```

### Causas frecuentes y acción

| Causa | Cómo se ve | Acción |
|-------|-----------|--------|
| Despliegue reciente defectuoso | Los errores arrancan justo tras un despliegue | [Rollback](#rollback) |
| Permisos IAM insuficientes | `AccessDenied` en los logs | Revisar el rol; suele venir de un cambio en la plantilla |
| Parámetro de tarifas mal formado | Error al parsear JSON | [Ver escenario 5](#escenario-5-cambiar-una-tarifa) y restaurar la versión anterior del parámetro |
| DynamoDB limitando | `ThrottledRequests` > 0 | La tabla es on-demand y escala sola, pero no instantáneamente ante un pico brusco. Escalar a AWS |
| Error no manejado en el código | Excepción con stack trace | Corregir y desplegar; mientras tanto, evaluar rollback |

### Escalamiento

Si en **15 minutos** no hay causa identificada, o si el volumen de error supera el 5% de las
transacciones, escalar al equipo de plataforma. Si es un incidente de cara al cliente que supera los
**30 minutos**, notificar a la gerencia de operaciones de la red.

---

## Escenario 2: la DLQ tiene mensajes acumulados

**Síntoma:** alarma `mensajes-en-dlq`.

**Importante:** esto **no afecta al cliente**. Las transacciones se autorizaron correctamente. Lo que
falló es la liquidación de la comisión al corresponsal. Es plata que no le llegó, así que es urgente,
pero no es una caída del servicio.

### Diagnóstico

```bash
# Cuántos mensajes hay
aws sqs get-queue-attributes \
  --queue-url <URL-DLQ> \
  --attribute-names ApproximateNumberOfMessages

# Inspeccionar uno sin consumirlo definitivamente
aws sqs receive-message \
  --queue-url <URL-DLQ> \
  --max-number-of-messages 1 \
  --visibility-timeout 0
```

### Acción

1. **Identifica el patrón.** ¿Todos los mensajes fallidos son del mismo corresponsal? ¿Del mismo tipo
   de transacción? ¿De la misma ventana de tiempo? Eso apunta a la causa.
2. **Corrige la causa** en el consumidor antes de reprocesar. Devolver los mensajes a la cola sin
   arreglar nada solo los trae de vuelta a la DLQ.
3. **Reprocesa** con un redrive desde la consola de SQS o con la API.
4. **Verifica** que la comisión quedó liquidada consultando la tabla por el corresponsal afectado:

```bash
aws dynamodb query \
  --table-name corresponsales-prod-transacciones \
  --index-name porCorresponsal \
  --key-condition-expression "codigoCorresponsal = :c" \
  --expression-attribute-values '{":c":{"S":"CB-BUC-0142"}}'
```

5. **Comunica.** Si hubo comisiones sin liquidar por más de un ciclo, el área de red de corresponsales
   debe saberlo antes de que el corresponsal llame a preguntar.

---

## Escenario 3: throttling o latencia alta

**Síntoma:** alarma `throttling-funcion`, `latencia-api` o `duracion-funcion`.

Los tres apuntan al mismo problema con distinta gravedad: el servicio no está absorbiendo la carga.
Y tienen un efecto secundario importante: **cuando la latencia sube, los dispositivos empiezan a
reintentar**, lo que aumenta la carga y agrava el problema.

### Diagnóstico

```bash
# Concurrencia real vs. reservada
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda --metric-name ConcurrentExecutions \
  --dimensions Name=FunctionName,Value=corresponsales-prod-registrar-transaccion \
  --start-time "$(date -u -v-1H +%Y-%m-%dT%H:%M:%S)" \
  --end-time "$(date -u +%Y-%m-%dT%H:%M:%S)" \
  --period 60 --statistics Maximum
```

```bash
# Distribución de latencia: ¿es generalizado o son casos puntuales?
aws logs start-query \
  --log-group-name /aws/apigateway/corresponsales-prod-api \
  --start-time $(($(date +%s) - 3600)) \
  --end-time $(date +%s) \
  --query-string 'fields latencia
                  | stats count() as total, avg(latencia) as promedio,
                          pct(latencia, 50) as p50, pct(latencia, 99) as p99'
```

### Acción

| Situación | Acción |
|-----------|--------|
| Concurrencia en el techo reservado | Subir `ReservedConcurrentExecutions` en la plantilla y desplegar |
| Latencia alta pero concurrencia baja | El cuello está aguas abajo: revisar DynamoDB y SQS |
| Arranques en frío frecuentes | Evaluar concurrencia provisionada para el horario de mayor tráfico |
| Pico legítimo de tráfico | Verificar que el usage plan no esté limitando puntos legítimos |
| Un solo punto genera el volumen | Puede ser un dispositivo en bucle de reintento. Revisar por `apiKeyId` en los logs de acceso |

---

## Escenario 4: un corresponsal reporta una transacción duplicada

**Síntoma:** un punto reporta que una transacción se registró dos veces, o un cliente reclama un doble
cobro.

Este es el escenario que la idempotencia debería prevenir. Si ocurre, hay algo que investigar de fondo.

### Diagnóstico

```bash
# 1. Buscar todas las transacciones del corresponsal en la ventana reportada
aws dynamodb query \
  --table-name corresponsales-prod-transacciones \
  --index-name porCorresponsal \
  --key-condition-expression "codigoCorresponsal = :c AND fecha BETWEEN :desde AND :hasta" \
  --expression-attribute-values '{
    ":c":{"S":"CB-BUC-0142"},
    ":desde":{"S":"2026-08-28T00:00:00.000Z"},
    ":hasta":{"S":"2026-08-28T23:59:59.999Z"}
  }'
```

```bash
# 2. Ver si hubo reintentos detectados en la ventana
aws logs start-query \
  --log-group-name /aws/lambda/corresponsales-prod-registrar-transaccion \
  --start-time $(($(date +%s) - 7200)) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, mensaje, referencia
                  | filter mensaje like /Reintento/ or mensaje like /concurrente/
                  | sort @timestamp desc'
```

### Interpretación

| Hallazgo | Qué significa |
|----------|---------------|
| Dos registros con **la misma** `referenciaIdempotencia` | No debería poder ocurrir. Escalar de inmediato: hay un defecto en la condición de escritura |
| Dos registros con **distinta** referencia y datos idénticos | **El dispositivo generó dos referencias distintas para la misma operación.** El problema está en el cliente, no en el servicio |
| Un registro y logs de reintento | La idempotencia funcionó. Lo que ve el corresponsal es probablemente un problema de su comprobante impreso |

El segundo caso es el más frecuente y el más incómodo: el servicio hizo lo correcto, pero el
dispositivo del punto no reutilizó la referencia al reintentar. Requiere coordinación con el proveedor
del dispositivo.

### Acción

1. Documentar el caso con la referencia y el consecutivo.
2. Si hay doble afectación real al cliente, escalar al área de operaciones para la reversión. **La
   reversión de una transacción no se hace desde este servicio.**
3. Si el patrón se repite con el mismo tipo de dispositivo, abrir un caso con el proveedor.

---

## Escenario 5: un corresponsal reporta que un retiro válido fue rechazado

**Síntoma:** el punto tiene el efectivo y el sistema rechaza el retiro.

### Diagnóstico

```bash
aws logs start-query \
  --log-group-name /aws/lambda/corresponsales-prod-registrar-transaccion \
  --start-time $(($(date +%s) - 3600)) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, motivo, referencia
                  | filter mensaje like /rechazada/
                  | stats count() as total by motivo
                  | sort total desc'
```

### Interpretación por motivo

| Motivo | Qué verificar |
|--------|---------------|
| `CUPO_INSUFICIENTE` | ¿El cupo que envía el dispositivo coincide con el efectivo real del punto? Comparar con lo que reporta el corresponsal |
| `LIMITE_EXCEDIDO` | Confrontar el monto contra el límite del tipo en `/corresponsales/prod/tarifas` |
| `FUERA_DE_HORARIO` | La red opera 6:00–21:00. Verificar la zona horaria del registro: un desfase de zona produce rechazos legítimos en apariencia |
| `TIPO_NO_SOPORTADO` | El dispositivo está enviando un tipo que el servicio no conoce. Suele ser una versión desactualizada del cliente |

> **Nota histórica.** Hubo un defecto en `validarCupo` que rechazaba retiros por un monto
> **exactamente igual** al cupo disponible (usaba `>` en lugar de `>=`). Está corregido, pero si
> aparece un rechazo de este tipo, verificar primero que la versión desplegada incluya la corrección.

### Acción

1. Si el rechazo fue correcto, explicar el motivo al corresponsal con el dato concreto.
2. Si el rechazo fue incorrecto, escalar con la referencia y el motivo. **No modificar la tabla de
   tarifas para desbloquear un caso puntual.**

---

## Escenario 5b: cambiar una tarifa

No es un incidente, es una operación planeada. Está acá porque es la que más se pide.

```bash
# 1. Guardar el valor actual antes de cambiar nada
aws ssm get-parameter --name /corresponsales/prod/tarifas \
  --query 'Parameter.Value' --output text > tarifas-respaldo-$(date +%Y%m%d).json

# 2. Aplicar el nuevo valor
aws ssm put-parameter --name /corresponsales/prod/tarifas \
  --value file://tarifas-nuevas.json --overwrite

# 3. Verificar que quedó bien escrito
aws ssm get-parameter --name /corresponsales/prod/tarifas \
  --query 'Parameter.Value' --output text | python3 -m json.tool
```

**No requiere desplegar código.** Ese es el punto de tener las tarifas en Parameter Store.

Requisitos previos: aprobación del área de producto y verificación de que el JSON es válido. Un
parámetro mal formado tumba el servicio, así que el paso 3 no es opcional.

---

## Rollback

### Criterio

Se hace rollback si se cumple alguna:

- Más del 5% de las transacciones falla y la causa apunta a un despliegue reciente.
- El servicio está caído y no hay causa identificada en 15 minutos.
- Se detecta un error de cálculo de comisión o de validación de límites, sin importar el volumen.

El último criterio no admite discusión: un error de cálculo monetario se revierte de inmediato,
aunque afecte pocas transacciones.

### Procedimiento

```bash
# Ver el historial del stack
aws cloudformation describe-stack-events \
  --stack-name corresponsales-prod \
  --max-items 20

# Si el despliegue anterior fue con change set, revertir al template previo
aws cloudformation deploy \
  --stack-name corresponsales-prod \
  --template-file <plantilla-version-anterior.yaml> \
  --parameter-overrides file://parametros-prod.json \
  --no-execute-changeset   # revisar el change set antes de ejecutar
```

Después del rollback: verificar que las alarmas vuelven a estado OK y que la DLQ no siguió creciendo.

> **Cuidado:** la tabla, las colas y la clave KMS tienen `DeletionPolicy: Retain`. No se pierden en un
> rollback, pero un cambio que modifique la clave de partición de la tabla **no es reversible** con un
> simple rollback. Los cambios de esquema requieren plan propio.

---

## Escalamiento

| Situación | A quién | En cuánto tiempo |
|-----------|---------|------------------|
| Servicio caído sin causa identificada | Equipo de plataforma | 15 min |
| Incidente de cara al cliente | Gerencia de operaciones de la red | 30 min |
| Posible error de cálculo monetario | Producto + plataforma, en paralelo | Inmediato |
| Comisiones sin liquidar por más de un ciclo | Área de red de corresponsales | Mismo día |
| Duplicados con la misma referencia de idempotencia | Plataforma, prioridad alta | Inmediato |

Contactos y canales: `[POR DEFINIR]`

---

## Verificación posterior al incidente

Antes de cerrar cualquier incidente:

- [ ] Todas las alarmas en estado OK
- [ ] La DLQ dejó de crecer
- [ ] Las transacciones afectadas están identificadas y documentadas
- [ ] Si hubo afectación al cliente, el área de operaciones está notificada
- [ ] La causa raíz está escrita, aunque sea en un párrafo
- [ ] Si el runbook no alcanzó, este documento se actualizó

El último punto es el que mantiene vivo un runbook. Si tuviste que improvisar, ese paso pertenece acá.
