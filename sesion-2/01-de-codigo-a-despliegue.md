# De código a despliegue: qué artefactos hacen falta

**Sesión 2 · Minuto 06–18 · 12 minutos (teoría + demo del facilitador)**

---

## 1. El inventario de artefactos

Cuando alguien dice "hay que poner esto en producción", en realidad está pidiendo entre siete y diez
artefactos distintos. Casi ninguno es código de negocio.

| # | Artefacto | Pregunta que responde | Quién lo escribe hoy |
|---|-----------|----------------------|---------------------|
| 1 | Handler / adaptador | ¿Cómo se invoca la lógica desde la plataforma? | Desarrollo |
| 2 | Plantilla de IaC | ¿Qué recursos existen y cómo se configuran? | Infraestructura |
| 3 | Configuración por ambiente | ¿Qué cambia entre dev, qa y prod? | Ambos |
| 4 | Pipeline de CI | ¿Cómo se valida cada cambio? | DevOps |
| 5 | Pipeline de CD | ¿Cómo llega el cambio al ambiente? | DevOps |
| 6 | Observabilidad | ¿Cómo sé que está vivo y sano? | Operaciones |
| 7 | Runbook | ¿Qué hago cuando falle a las 2 a.m.? | Operaciones |
| 8 | Documentación de arquitectura | ¿Por qué está hecho así? | Arquitectura |
| 9 | Controles de seguridad | ¿Cumple con lo que exige la entidad? | Seguridad |

Dos observaciones que suelen incomodar:

- **Los artefactos 6, 7, 8 y 9 son los que más se posponen** y los que más cuestan cuando faltan.
  Nadie descubre que no hay runbook hasta que hay un incidente.
- **Casi todos son texto estructurado y repetitivo.** YAML, JSON, Markdown. Con patrones conocidos y
  documentación pública. Es exactamente el perfil de trabajo donde un agente rinde más.

---

## 2. Dónde entra Kiro en el ciclo

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CICLO DE ENTREGA                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PLANEAR    →  Spec sessions: requisitos y diseño documentados          │
│  CODIFICAR  →  Lógica de negocio y handlers (Sesión 1)                 │
│  IaC        →  Plantillas generadas con documentación oficial vía MCP   │
│  VALIDAR    →  cfn-lint y cfn-guard antes de cualquier despliegue       │
│  CI/CD      →  Pipelines generados, no copiados de otro proyecto        │
│  OBSERVAR   →  Alarmas y logs definidos junto con la infraestructura    │
│  OPERAR     →  Runbook generado desde el código real                    │
│  DOCUMENTAR →  Arquitectura escrita a partir de la plantilla            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

Un matiz importante: Kiro no reemplaza al equipo de infraestructura. Cambia en qué se les va el
tiempo. Pasan de escribir YAML a revisar decisiones de arquitectura, que es donde su criterio vale.

---

## 3. El ciclo que hace confiable el resultado

Esto es lo más importante de la sesión. Un agente que genera IaC sin validar es un riesgo. Con
validación es un acelerador.

```
   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ GENERAR  │───▶│ VALIDAR  │───▶│ CORREGIR │───▶│REVALIDAR │
   └──────────┘    └──────────┘    └──────────┘    └──────────┘
        │               │                                │
        │               │  cfn-lint  → ¿es válida?       │
        │               │  cfn-guard → ¿es segura?       │
        │               └────────────────────────────────┘
        │                       ciclo hasta pasar
        └── documentación oficial vía MCP, no memoria
```

La clave está en que **la corrección no se apoya en la opinión del agente, se apoya en la salida de
un validador**. Kiro lee el error de `cfn-lint`, entiende qué propiedad está mal y la corrige. Eso es
verificable y auditable.

### Las dos validaciones son distintas

| | `cfn-lint` | `cfn-guard` |
|-|-----------|-------------|
| Pregunta | ¿Es una plantilla válida? | ¿Cumple las políticas? |
| Detecta | Tipos de recurso inexistentes, propiedades mal escritas, referencias rotas | Cifrado ausente, acceso público, permisos excesivos |
| Si falla | CloudFormation rechazaría el stack | El stack se crearía, pero insegura |
| Cuándo | Siempre | Siempre, y con más razón en una entidad financiera |

La segunda es la que evita el hallazgo de auditoría. Un bucket sin cifrado despliega perfecto; el
problema aparece seis meses después en una revisión.

### Validación antes del despliegue: el change set

CloudFormation permite un paso más antes de crear recursos: el **change set**. Es una vista previa de
lo que cambiaría, y valida automáticamente cosas que solo se ven en el contexto de la cuenta:
sintaxis de propiedades, conflictos de nombres con recursos existentes, y restricciones en
operaciones de borrado.

```
   cfn-lint  →  cfn-guard  →  change set  →  deploy
   (local)      (local)       (en la cuenta)
```

No lo vamos a ejecutar hoy porque no desplegamos, pero conviene saber que existe: es la última red
antes de tocar recursos reales.

---

## 4. Lo que el steering ya está haciendo por ti

En el Lab 2 creaste `.kiro/steering/estandares-iac.md` con inclusión condicional para archivos
`.yaml`, `.yml` y `.tf`. En el momento en que abras la primera plantilla del Lab 5, esas reglas
entran en contexto solas:

```
   Tags obligatorios          →  Kiro los agrega sin que se lo pidas
   Cifrado en reposo          →  lo incluye por defecto
   Sin Action: "*"            →  genera políticas acotadas
   Nombres {proyecto}-{amb}-  →  aplica la convención
   Retención de logs 30 días  →  la configura
```

Ese es el valor compuesto del workshop: el trabajo de la Sesión 1 reduce el trabajo de la Sesión 2.
Sin el steering, cada una de esas reglas tendría que ir en cada prompt, o aparecería como hallazgo de
`cfn-guard` más tarde.

---

## 5. CloudFormation, CDK o Terraform

Hoy usamos CloudFormation. Vale explicar por qué y cuándo elegir otra cosa.

| | CloudFormation | CDK | Terraform |
|-|----------------|-----|-----------|
| Formato | YAML / JSON declarativo | Código (TypeScript, Python, Java) | HCL declarativo |
| Curva | Media | Alta (requiere saber el lenguaje y CDK) | Media |
| Multi-nube | No | No | Sí |
| Validación local | `cfn-lint`, `cfn-guard` | `cdk synth` + `cdk-nag` | `terraform validate`, `tflint` |
| Estado | Administrado por AWS | Administrado por AWS | Archivo de estado propio |
| Con Kiro | Genera y valida en el mismo ciclo | Muy bien con el MCP de CDK | Bien, con validación distinta |

**Por qué CloudFormation en este workshop:** el ciclo de validación es inmediato y local, no requiere
instalar nada más allá del servidor MCP, y el artefacto resultante es legible por cualquier persona
del equipo sin conocer un lenguaje de programación adicional. Para aprender el ciclo
generar-validar-corregir es la ruta más corta.

**Si tu equipo ya usa Terraform**, el Lab 5 tiene una pista alternativa al final. El ciclo es el
mismo, cambian las herramientas de validación.

---

## 6. Demo del facilitador (5 min)

Sobre el repositorio, con los servidores MCP activos.

### 6.1 El punto de partida

Abrir `src/corresponsales/transacciones.js` y preguntar:

> Para desplegar esta lógica como una función Lambda detrás de API Gateway, ¿qué me falta y qué
> problemas tiene el código actual para funcionar en un entorno distribuido?

Debe mencionar el handler ausente y el consecutivo no idempotente. Es el puente entre las dos sesiones.

### 6.2 Generar con documentación oficial

> Consultando la documentación oficial de AWS vía MCP, genera un fragmento de CloudFormation con una
> tabla DynamoDB para transacciones que soporte idempotencia por clave de referencia, con cifrado en
> reposo y facturación bajo demanda.

Señalar mientras responde:
- Invoca el servidor MCP antes de generar.
- Aplica los tags y el cifrado del steering **sin que nadie los mencione en el prompt**.

### 6.3 El ciclo de validación en vivo

Introducir un error a mano en la plantilla generada —cambiar `BillingMode` por `BilingMode`— y pedir:

> Valida esta plantilla y corrige lo que encuentres.

Lo que hay que ver: Kiro no adivina que está mal. **El validador se lo dice**, y él corrige con esa
información. Es la diferencia entre confiar en un modelo y confiar en una herramienta.

### 6.4 Lo que hay que llevarse de la demo

```
┌──────────────────────────────────────────────────────────────────┐
│  ✓ Kiro consulta documentación oficial antes de generar IaC      │
│  ✓ El steering aplica reglas de seguridad sin pedirlo            │
│  ✓ El validador es la fuente de verdad, no el modelo             │
│  ✓ El ciclo generar → validar → corregir se repite hasta pasar   │
│  ✓ El artefacto queda auditable: hay evidencia de la validación  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. Dónde poner el límite

Con la misma honestidad que en la Sesión 1:

- **Las decisiones de arquitectura siguen siendo humanas.** Kiro escribe la plantilla de DynamoDB
  impecable; decidir si el caso pide DynamoDB o una base relacional es tu trabajo.
- **`cfn-guard` valida políticas conocidas, no las de tu entidad.** Las reglas específicas de
  Fundación delamujer hay que escribirlas. El steering es el primer paso.
- **Una plantilla que valida no es una plantilla probada.** Validar no es desplegar en un ambiente
  de pruebas y verificar que el servicio responde.
- **El costo hay que estimarlo aparte.** Una arquitectura correcta puede ser inviable
  económicamente. Para eso está el servidor MCP de precios.
- **Nada de credenciales de producción en la máquina de desarrollo.** Aplica con o sin agente, pero
  con agente hay más superficie.

---

## Resumen

```
┌─────────────────────────────────────────────────────────────────┐
│  PARA LLEVAR                                                    │
├─────────────────────────────────────────────────────────────────┤
│  ✓ "Poner en producción" son 9 artefactos, no solo código       │
│  ✓ Los que más se posponen (runbook, alarmas) son texto          │
│    estructurado: donde el agente rinde más                      │
│  ✓ Generar → validar → corregir → revalidar                     │
│  ✓ cfn-lint: ¿es válida? · cfn-guard: ¿es segura?               │
│  ✓ El steering de la Sesión 1 trabaja gratis en la Sesión 2     │
│  ✓ La arquitectura la decides tú; el YAML lo escribe Kiro       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Siguiente

[Lab 5: IaC generada y validada con Kiro →](./lab5-iac/README.md)
