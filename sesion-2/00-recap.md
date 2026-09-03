# Recap y objetivos de la Sesión 2

**Sesión 2 · Minuto 00–06 · 6 minutos**

---

## Dónde quedamos

En la Sesión 1 configuramos Kiro para que trabaje como parte del equipo:

| Lo que hicimos | Lo que quedó en el repositorio |
|----------------|-------------------------------|
| Onboarding asistido | `docs/ONBOARDING.md`, `docs/DEUDA-TECNICA.md`, JSDoc, tests de borde |
| Steering files | `.kiro/steering/` con producto, desarrollo e infraestructura |
| Hooks | `.kiro/hooks/` con lint, exigencia de tests y guardarraíl de tarifas |
| MCP | `.kiro/settings/mcp.json` con documentación y validación de AWS |

Hoy usamos todo eso. No lo volvemos a configurar: **el steering de IaC que creaste en el Lab 2 va a
aplicar solo cuando abras el primer archivo YAML, y el validador MCP del Lab 4 es lo que va a
revisar tu plantilla.**

---

## Check de arranque (3 min)

```bash
cd workshop-kiro-fdlm
git status                    # debes estar en tu rama workshop/<tu-nombre>
npm test                      # todo en verde
ls .kiro/steering/            # 3 steering files
ls .kiro/hooks/               # 3 hooks
cat .kiro/settings/mcp.json   # aws-docs y aws-iac
```

Y en el chat de Kiro:

> Lista las herramientas MCP que tienes disponibles.

Si los servidores no responden, reconéctalos desde el panel **MCP Server** antes de seguir. El Lab 5
depende de ellos.

### Créditos

```
Créditos disponibles: ______________
```

Si tienes menos de 20, avisa ahora. Esta sesión genera más que la anterior.

> **Si no estuviste en la Sesión 1** o perdiste tu trabajo: copia los artefactos de referencia desde
> `soluciones/steering/`, `soluciones/hooks/` y `soluciones/mcp/` a sus rutas en `.kiro/`. Toma dos
> minutos y te deja al día.

---

## El problema de hoy

Tenemos lógica de negocio validada. Eso no atiende a un solo corresponsal.

```
   HOY TENEMOS                            HOY FALTA
   ┌─────────────────────┐                ┌─────────────────────────────┐
   │ registrarTransaccion│                │ ¿Dónde corre?               │
   │ validaciones        │                │ ¿Cómo lo llama el punto?    │
   │ cálculo de comisión │  ──────────▶   │ ¿Dónde se guarda?           │
   │ comprobante         │                │ ¿Cómo se despliega?         │
   │                     │                │ ¿Cómo sé que está vivo?     │
   │ tests + docs        │                │ ¿Qué hago cuando falle?     │
   └─────────────────────┘                └─────────────────────────────┘
        4 archivos .js                       ninguno de estos existe
```

Esa columna de la derecha son los **artefactos de despliegue**, y es lo que separa un módulo que
funciona en una laptop de un servicio que atiende puntos corresponsales en todo el país.

Escribirlos a mano es lento y propenso a error: son cientos de líneas de YAML con propiedades que
hay que recordar con exactitud. Es precisamente el tipo de trabajo donde un agente con acceso a la
documentación oficial y a un validador cambia la ecuación.

---

## Qué vas a lograr hoy

- [ ] Una plantilla CloudFormation completa del servicio, que pasa `cfn-lint` y `cfn-guard`
- [ ] La lógica de negocio adaptada a un handler de Lambda, con idempotencia resuelta
- [ ] Un pipeline de CI/CD que valida código **e infraestructura** en cada cambio
- [ ] Documentación de arquitectura y runbook operativo generados desde el código real
- [ ] Un reto integrador resuelto en equipo

---

## Regla de la sesión: no desplegamos

```
┌────────────────────────────────────────────────────────────────────┐
│  NO vamos a crear recursos reales en AWS.                          │
│                                                                    │
│  Generamos, validamos y documentamos artefactos de despliegue.      │
│  Nadie necesita cuenta de AWS ni permisos de producción.            │
│  No hay riesgo de costos ni de tocar nada existente.               │
└────────────────────────────────────────────────────────────────────┘
```

Esto no es una limitación del ejercicio, es el punto: **la mayor parte del valor de la IA en DevOps
está antes del despliegue**, en generar el artefacto correcto y validarlo. El `deploy` es el paso
fácil; llegar a una plantilla correcta, segura y documentada es el trabajo real.

---

## La arquitectura objetivo

```
                    ┌─────────────────┐
   Punto            │  API Gateway    │   POST /transacciones
   corresponsal ───▶│  REST + API key │───────────┐
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

### Por qué cada pieza

| Componente | Decisión de negocio detrás |
|------------|---------------------------|
| API Gateway | Los dispositivos de los puntos necesitan un endpoint estable y autenticado |
| Lambda | Volumen variable a lo largo del día; no tiene sentido pagar servidores encendidos de noche |
| DynamoDB | Guarda la transacción **y garantiza idempotencia**: si el punto reintenta por mala señal, no se duplica |
| SQS + DLQ | La liquidación de comisiones no debe bloquear la autorización. Si falla, el mensaje no se pierde |
| SSM Parameter Store | Las tarifas cambian por decisión de producto, no por un despliegue de código |
| CloudWatch | Sin alarmas nadie se enteraría de que la red está caída hasta que llame un corresponsal |

> **La idempotencia es el punto que cierra la Sesión 1.** En el Lab 1 el consecutivo se generaba con
> la hora del sistema: dos reintentos producían dos transacciones distintas. En zonas rurales con
> conectividad intermitente, el reintento es el caso normal. Hoy lo resolvemos con una clave de
> idempotencia en DynamoDB.

---

## Agenda de la sesión

| Min | Bloque | Dur |
|-----|--------|-----|
| 00–06 | Recap y objetivos ← estás aquí | 6 |
| 06–18 | [De código a despliegue: qué artefactos hacen falta](./01-de-codigo-a-despliegue.md) | 12 |
| 18–52 | [Lab 5: Infraestructura generada y validada con Kiro](./lab5-iac/README.md) | 34 |
| 52–60 | Break | 8 |
| 60–80 | [Lab 6: El pipeline que valida siempre](./lab6-pipeline/README.md) | 20 |
| 80–102 | [Lab 7: Reto integrador por equipos](./lab7-reto/README.md) | 22 |
| 102–120 | [Resultados, plan de adopción y cierre](./99-cierre-final.md) | 18 |

El Lab 5 se lleva el bloque más grande a propósito: es donde está el valor de la sesión.

---

## Siguiente

[De código a despliegue: qué artefactos hacen falta →](./01-de-codigo-a-despliegue.md)
