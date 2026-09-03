# Caso de negocio: Red de Corresponsales

Contexto que usamos como hilo conductor de las dos sesiones. Léelo antes del Lab 1: los prompts
funcionan mucho mejor cuando entiendes el dominio que le estás describiendo a Kiro.

---

## Por qué este caso

Fundación delamujer es una entidad microfinanciera colombiana enfocada en la inclusión financiera de
mujeres microempresarias, con presencia fuerte en zonas donde no hay oficinas cerca. La
**corresponsalía bancaria** es justamente el mecanismo que resuelve ese problema: comercios aliados
—una papelería, una miscelánea, una ferretería— habilitados para prestar servicios financieros en
nombre de la entidad, a cambio de una comisión por transacción.

Para el workshop es un caso ideal por tres razones:

1. **Es reconocible.** Todos en la sala entienden el negocio sin explicación técnica.
2. **Es de baja complejidad.** Son reglas de validación y aritmética simple. Nadie se atasca en la
   lógica de negocio y toda la atención queda en Kiro.
3. **Escala naturalmente a infraestructura.** Un servicio transaccional con límites, comisiones y
   comprobantes lleva de forma directa a API + cómputo + base de datos + colas + alarmas, que es
   exactamente lo que necesitamos en la Sesión 2.

> **Alcance:** este es un **ejercicio didáctico**, no un diseño de producto ni una asesoría regulatoria.
> Las tarifas, límites y reglas son inventados para el workshop. Cualquier implementación real debe
> validarse contra la normativa vigente (en Colombia, el régimen de corresponsales del Decreto 2555
> de 2010 y sus modificaciones) y contra las políticas internas de la entidad.

---

## Cómo funciona la corresponsalía, en corto

```
   ┌──────────┐        ┌───────────────────┐        ┌──────────────────────┐
   │ Cliente  │───────▶│   Corresponsal    │───────▶│  Fundación delamujer │
   │  final   │  llega │ (comercio aliado) │  API   │   (core financiero)  │
   └──────────┘  al    └───────────────────┘        └──────────────────────┘
                 punto           │                             │
                                 │ recibe comisión             │ autoriza o rechaza
                                 ▼                             ▼
                        Ingreso adicional          Cobertura sin abrir oficina
```

El cliente no se desplaza a una oficina. El comercio gana una comisión por cada transacción. La
entidad amplía cobertura sin costo de sucursal. El software que autoriza cada operación es lo que
vamos a construir y desplegar.

---

## Servicios que ofrece un punto corresponsal

Estos son los cinco tipos de transacción que maneja nuestro servicio. Están codificados en
[`src/corresponsales/tarifas.js`](../src/corresponsales/tarifas.js).

| Tipo | Qué hace | Comisión al corresponsal | Límite por transacción | Requiere cupo |
|------|----------|--------------------------|------------------------|:-------------:|
| `DEPOSITO` | El cliente consigna efectivo a su cuenta | $1.200 fijos | $3.000.000 | No |
| `RETIRO` | El cliente retira efectivo del punto | $1.500 fijos | $2.000.000 | **Sí** |
| `PAGO_CREDITO` | Abono a una cuota de microcrédito | $900 + 0,15% del monto | $5.000.000 | No |
| `RECAUDO` | Pago de facturas y convenios | $700 fijos | $1.000.000 | No |
| `CONSULTA_SALDO` | Consulta de saldo de cuenta | $300 fijos | Sin límite | No |

### Reglas de negocio

1. **Límite por transacción.** Cada tipo tiene un monto máximo. Si se excede, la transacción se
   rechaza con `LIMITE_EXCEDIDO`.
2. **Cupo de efectivo.** Un `RETIRO` entrega efectivo del cajón del comercio. Si el corresponsal no
   tiene suficiente efectivo disponible, se rechaza con `CUPO_INSUFICIENTE`.
3. **Horario de operación.** La red opera de 6:00 a 21:00. Fuera de ese rango se rechaza con
   `FUERA_DE_HORARIO`.
4. **Comprobante obligatorio.** Toda transacción aprobada genera un comprobante con consecutivo
   único que se entrega al cliente. Es una exigencia operativa y regulatoria.
5. **Liquidación de comisiones.** Las comisiones se acumulan y se liquidan periódicamente al
   corresponsal. Por eso existe `calcularLiquidacion`.

### Estados de una transacción

```
APROBADA    → pasó todas las validaciones, tiene consecutivo y comprobante
RECHAZADA   → falló una validación; el motivo indica cuál
```

Motivos de rechazo posibles: `TIPO_NO_SOPORTADO`, `LIMITE_EXCEDIDO`, `CUPO_INSUFICIENTE`,
`FUERA_DE_HORARIO`.

---

## El código base

```
src/corresponsales/
├── tarifas.js         Tabla de tarifas, límites y horario. Configuración pura.
├── comisiones.js      calcularComision, calcularLiquidacion, formatearCOP
├── limites.js         validarTipo, validarMonto, validarCupo, validarHorario
└── transacciones.js   registrarTransaccion (orquesta todo) y formatearComprobante
```

Flujo de `registrarTransaccion`:

```
payload + corresponsal
        │
        ├─▶ validarTipo      ──── falla ──▶ RECHAZADA: TIPO_NO_SOPORTADO
        ├─▶ validarHorario   ──── falla ──▶ RECHAZADA: FUERA_DE_HORARIO
        ├─▶ validarMonto     ──── falla ──▶ RECHAZADA: LIMITE_EXCEDIDO
        ├─▶ validarCupo      ──── falla ──▶ RECHAZADA: CUPO_INSUFICIENTE
        │
        ├─▶ calcularComision
        ├─▶ generarConsecutivo
        └─▶ APROBADA + comprobante
```

### Estado del código: intencionalmente imperfecto

El código funciona, pero se parece a lo que uno encuentra en la vida real:

- Sin documentación ni JSDoc.
- Cobertura de tests casi nula (dos casos, sobre una sola función).
- Sin validación de entradas en el punto de entrada.
- Al menos un bug de lógica en una validación de borde.
- Una decisión de diseño que no aguanta un entorno distribuido.

Esto no es descuido: es el material del **Lab 1**. Vas a usar Kiro para encontrar todo eso.
No hay una lista de respuestas en este documento a propósito.

---

## A dónde llega en la Sesión 2

El mismo servicio, desplegado en AWS. Esta es la arquitectura objetivo que Kiro va a generar como
plantilla de infraestructura:

```
                    ┌─────────────────┐
   Punto            │  API Gateway    │   POST /transacciones
   corresponsal ───▶│  (REST, API key)│───────────┐
                    └─────────────────┘           │
                                                  ▼
                                        ┌──────────────────────┐
                                        │ Lambda               │
                                        │ registrar-transaccion│
                                        └──────────┬───────────┘
                                                   │
                        ┌──────────────────────────┼──────────────────────┐
                        ▼                          ▼                      ▼
              ┌──────────────────┐      ┌──────────────────┐   ┌──────────────────┐
              │ DynamoDB         │      │ SQS              │   │ SSM Parameter    │
              │ Transacciones    │      │ Liquidaciones    │   │ Store (tarifas)  │
              │ (idempotencia)   │      │      + DLQ       │   │                  │
              └──────────────────┘      └──────────────────┘   └──────────────────┘
                        │                          │
                        └──────────┬───────────────┘
                                   ▼
                        ┌──────────────────────┐
                        │ CloudWatch           │
                        │ Logs + Alarmas       │
                        └──────────────────────┘
```

### Qué resuelve cada pieza

| Componente | Por qué está |
|------------|--------------|
| API Gateway | Punto de entrada para los dispositivos de los puntos corresponsales |
| Lambda | Ejecuta la lógica de validación y comisión que ya escribimos |
| DynamoDB | Guarda las transacciones y garantiza **idempotencia**: si el punto reintenta por mala señal, no se duplica la transacción |
| SQS + DLQ | Desacopla la liquidación de comisiones de la autorización. Si falla, el mensaje no se pierde |
| SSM Parameter Store | Las tarifas cambian sin necesidad de redesplegar código |
| CloudWatch | Alarmas de errores, latencia y mensajes en DLQ. Sin esto no hay operación |

> La idempotencia no es un detalle académico. En zonas rurales con conectividad intermitente, el
> reintento es el caso normal, no la excepción. Es también el punto donde el código base actual falla.

---

## Nota sobre datos

Todo dato que aparece en el código, los ejemplos y los labs es ficticio:

- Corresponsales (`CB-BUC-0142`, "Papelería La Esperanza") son inventados.
- Los documentos de identidad son números de ejemplo, no corresponden a personas reales.
- Las tarifas y límites son didácticos, no son los vigentes de la entidad.

No introduzcas datos reales de clientes en los prompts durante el workshop.

---

## Siguiente

[Sesión 1 — Bienvenida](../sesion-1/00-bienvenida.md)
