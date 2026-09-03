# Arquitectura: servicio de transacciones de corresponsales

Referencia del Lab 5. Escrito a partir de `soluciones/iac/corresponsales.yaml`.

> **Material didáctico.** Esta arquitectura no está desplegada ni revisada por el área de arquitectura
> de la entidad. Pasa validación local de sintaxis y cumplimiento, que es distinto de estar aprobada
> para producción.

---

## Diagrama

```
                          ┌──────────────────────┐
   Punto                  │   API Gateway REST   │
   corresponsal ─────────▶│  POST /transacciones │
   (dispositivo)          │  API key + usage plan│
                          └───────────┬──────────┘
                                      │ integración proxy
                                      ▼
                          ┌──────────────────────┐
                          │ Lambda               │
                          │ registrar-transaccion│
                          │ Node.js 22 · arm64   │
                          └───────────┬──────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
   ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
   │ DynamoDB           │  │ SQS                │  │ SSM Parameter      │
   │ Transacciones      │  │ Liquidaciones      │  │ Store              │
   │ PK: referencia     │  │        │           │  │ /tarifas           │
   │     Idempotencia   │  │        ▼           │  │                    │
   │ GSI: porCorresponsal│  │      DLQ          │  │                    │
   └─────────┬──────────┘  └────────┬───────────┘  └────────────────────┘
             │                      │
             └──────────┬───────────┘
                        ▼
             ┌──────────────────────┐        ┌──────────────────┐
             │ CloudWatch           │───────▶│ SNS              │
             │ Logs + 6 alarmas     │        │ Notificaciones   │
             └──────────────────────┘        └──────────────────┘

   Todo el almacenamiento cifrado con una clave KMS del cliente.
```

---

## Recursos

| Nombre lógico | Tipo | Propósito de negocio |
|---------------|------|----------------------|
| `ApiCorresponsales` | API Gateway REST | Punto de entrada estable para los dispositivos de los puntos |
| `MetodoRegistrarTransaccion` | API Gateway Method | `POST /transacciones`, con API key requerida |
| `LlaveApi` + `PlanUsoApi` | API Key + Usage Plan | Autenticación del dispositivo y límite de consumo por punto |
| `FuncionRegistrarTransaccion` | Lambda | Ejecuta la validación y el cálculo de comisión |
| `RolFuncion` | IAM Role | Permisos mínimos: solo las acciones que el handler usa, solo sobre recursos de este stack |
| `TablaTransacciones` | DynamoDB | Guarda la transacción **y garantiza idempotencia** |
| `ColaLiquidaciones` | SQS | Desacopla la liquidación de comisiones de la autorización |
| `ColaLiquidacionesDLQ` | SQS | Retiene las liquidaciones que no se pudieron procesar |
| `ParametroTarifas` | SSM Parameter | Permite cambiar tarifas sin desplegar código |
| `ClaveCifrado` | KMS Key | Cifrado en reposo de tabla, colas, tópico y logs |
| `GrupoLogsFuncion`, `GrupoLogsApi` | CloudWatch Logs | Trazabilidad, con retención de al menos 30 días |
| `TopicoAlarmas` | SNS | Canal de notificación de las alarmas |
| 6 alarmas | CloudWatch Alarm | Ver la tabla más abajo |

---

## La idempotencia, que es la decisión central

La clave de partición de la tabla es `referenciaIdempotencia`, no un ID generado. Eso no es un detalle
de implementación: es la respuesta a una condición real de operación.

**El problema.** Un punto corresponsal en zona rural envía una transacción, pierde señal antes de
recibir la respuesta, y reintenta. Si el servicio trata el reintento como una transacción nueva, el
cliente termina con dos retiros y el corresponsal con dos comisiones. En una red con conectividad
intermitente, esto no es un caso raro: es el comportamiento normal.

**La solución, en dos pasos.** Ambos son necesarios:

```
   1. Consultar por la referencia antes de procesar
      → si ya existe, se devuelve la transacción guardada con estado 200 y marca de reintento
      → resuelve el caso común: reintento secuencial

   2. Escribir con ConditionExpression: attribute_not_exists(referenciaIdempotencia)
      → si otra petición ganó la carrera, la escritura falla y se devuelve la ya guardada
      → resuelve el caso concurrente: dos peticiones simultáneas
```

Solo el paso 1 deja una ventana entre la consulta y la escritura. La condición del paso 2 es lo que la
cierra. Es un error frecuente implementar solo el primero y creer que el problema está resuelto.

El código está en `src/handlers/registrarTransaccion.js`.

---

## Flujo de una transacción

```
 1. El punto envía POST /transacciones con API key, incluyendo referenciaIdempotencia
 2. API Gateway valida la llave y el límite de consumo, e invoca la Lambda
 3. El handler valida la forma de la solicitud (referencia presente, monto entero positivo)
 4. Consulta DynamoDB por la referencia
       └─ si existe → devuelve la transacción guardada, 200, reintento: true
 5. Llama a registrarTransaccion del dominio, que evalúa tipo, horario, límite y cupo
       └─ si rechaza → 422 con el motivo
 6. Escribe en DynamoDB con condición de no sobrescritura
 7. Publica un mensaje en SQS para liquidar la comisión al corresponsal
 8. Devuelve 201 con el comprobante
```

Códigos de respuesta: `201` aprobada, `200` reintento ya procesado, `400` solicitud mal formada,
`422` rechazada por regla de negocio, `500` error inesperado.

---

## Alarmas y qué hacer con ellas

Cada alarma tiene su procedimiento en `RUNBOOK.md`. Una alarma sin procedimiento es ruido.

| Alarma | Qué significa para el negocio | Severidad |
|--------|-------------------------------|-----------|
| `errores-funcion` | Hay clientes parados en el mostrador que no pueden transar | Alta |
| `duracion-funcion` | Antesala del timeout. Si sigue subiendo, empiezan los reintentos | Media |
| `throttling-funcion` | Transacciones rechazadas por capacidad, no por regla de negocio | Alta |
| `mensajes-en-dlq` | Hay corresponsales a los que no les llegó su comisión | Media |
| `errores-5xx-api` | La API está devolviendo errores del servidor a los puntos | Alta |
| `latencia-api` | Hay fila en los puntos y los dispositivos empiezan a reintentar | Media |

Todos los umbrales son `Parameters` de la plantilla, para poder ajustarlos por ambiente sin cambiar
código.

---

## Parámetros por ambiente

| Parámetro | dev | prod (sugerido) |
|-----------|-----|-----------------|
| `Ambiente` | `dev` | `prod` |
| `RetencionLogsDias` | 30 | 365 |
| `UmbralErroresLambda` | 5 | 3 |
| `UmbralDuracionLambdaMs` | 8000 | 6000 |
| `UmbralLatenciaApiMs` | 3000 | 2000 |
| Concurrencia reservada | 10 | 100 |

La concurrencia se resuelve con la condición `EsProduccion` dentro de la plantilla.

---

## Decisiones de diseño

**Lambda en lugar de contenedores.** El volumen de una red de corresponsales varía mucho a lo largo
del día y cae a casi cero de noche. No tiene sentido pagar cómputo encendido en las horas muertas.

**DynamoDB en lugar de una base relacional.** El patrón de acceso es simple y conocido: buscar por
referencia de idempotencia, y listar por corresponsal. Un índice secundario global resuelve el segundo
caso. No hay consultas relacionales que justifiquen el costo operativo de una base relacional.

**SQS para la liquidación.** Calcular y registrar la comisión no debe bloquear la autorización que el
cliente está esperando. Si el procesamiento falla, el mensaje va a la DLQ y no se pierde.

**Tarifas en Parameter Store.** Las tarifas cambian por decisión de producto. Que un cambio de tarifa
requiera un despliegue de código es fricción innecesaria y una fuente de errores.

**Una sola clave KMS del cliente.** Cubre tabla, colas, tópico y logs. Simplifica la administración
frente a una clave por servicio, y `DeletionPolicy: Retain` evita que borrar el stack deje datos
cifrados ilegibles.

**`arm64` en la Lambda.** Mejor relación precio-rendimiento que x86 para este tipo de carga.

### Excepciones de seguridad aceptadas

Están documentadas como comentarios al inicio de la plantilla. En resumen:

| Hallazgo | Por qué no aplica |
|----------|-------------------|
| Sin WAF sobre API Gateway | El consumo es solo desde dispositivos registrados con API key y usage plan |
| Lambda fuera de VPC | No accede a recursos privados. Meterla en VPC agregaría NAT y arranque en frío sin beneficio real |
| Sin replicación multi-región | El servicio opera solo en Colombia y no hay requisito de continuidad multi-región para este dominio |
| Método sin autorizador Cognito o IAM | La autenticación del dispositivo se resuelve con API key. Un autorizador Lambda es el siguiente paso |

Que estén documentadas es el punto: una excepción explicada es una decisión; una excepción silenciosa
es un hallazgo de auditoría esperando a ocurrir.

---

## Qué falta para llevar esto a producción

La lista honesta. Es el inventario con el que arrancaría el equipo.

### Bloqueante

- [ ] **Autorizador propio en API Gateway.** La API key identifica el dispositivo, no autentica al
      operador del punto. Hace falta un autorizador Lambda o Cognito.
- [ ] **El consumidor de la cola de liquidaciones no existe.** El servicio publica los mensajes pero
      nadie los procesa. Sin eso, las comisiones no se liquidan.
- [ ] **Rol de CloudWatch a nivel de cuenta** (`AWS::ApiGateway::Account`) para que funcione el
      registro de acceso. Es un recurso singleton por cuenta y región, así que no se crea en esta
      plantilla: si dos stacks lo declaran, se pisan.
- [ ] **Pipeline de despliegue** con OIDC en lugar de llaves de acceso de larga vida, y aprobación
      manual para producción.
- [ ] **Prueba de carga** con el volumen real esperado de la red, para calibrar concurrencia y umbrales.

### Importante

- [ ] Reglas de `cfn-guard` propias de la entidad, más allá del conjunto genérico de AWS.
- [ ] Revisión del rol IAM acción por acción con el área de seguridad.
- [ ] Definición del período de retención de transacciones acorde a la normativa. Hoy el TTL de
      DynamoDB está en 400 días, elegido sin base regulatoria.
- [ ] Dashboard de CloudWatch para operación, además de las alarmas.
- [ ] Estimación de costo con volumen real. La arquitectura es correcta; su viabilidad económica no
      se ha verificado.
- [ ] Trazabilidad distribuida más allá de X-Ray habilitado: correlación de la referencia de
      idempotencia a lo largo de todo el flujo.

### Deseable

- [ ] Ambiente de pruebas con datos sintéticos de volumen realista.
- [ ] Alarma compuesta que distinga "el servicio está caído" de "un punto tiene problemas".
- [ ] Versionado y alias de la Lambda para despliegues graduales.
- [ ] Revisión de la estrategia de reintentos del dispositivo: hoy se asume que reintenta, pero no
      está especificado con qué frecuencia ni cuántas veces.
