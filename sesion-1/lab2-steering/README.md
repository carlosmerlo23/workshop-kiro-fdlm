> **Ruta guiada (20 min):** Partes 1 a 4. Son 3 prompts. Es lo que hacemos en vivo.
> **[Para después](#para-después):** el resto queda como guía para cuando vuelvas al repo.

---

# Lab 2: Steering files — el ADN del equipo

**Sesión 1 · Minuto 42–62 · 20 minutos**

---

## Objetivo

Dejar por escrito, una sola vez, el contexto de negocio y los estándares del equipo, para que Kiro
los aplique en todas las interacciones sin que nadie los repita en cada prompt.

## El problema que resuelven

En el Lab 1, cada prompt tuvo que decir "en español", "en `docs/`", "sin cambiar la lógica".
Multiplica eso por todos los prompts de un sprint y por todas las personas del equipo:

1. **Cuesta.** Contexto repetido es contexto que se paga cada vez.
2. **Sale distinto.** Cada persona lo pide a su manera, así que cada resultado es distinto. Es el
   mismo problema que resuelve un linter, un nivel más arriba.

```
        SIN STEERING                          CON STEERING
   ┌─────────────────────┐            ┌─────────────────────┐
   │ prompt + contexto   │            │ prompt              │
   │ prompt + contexto   │            │ prompt              │
   │ prompt + contexto   │            │ prompt              │
   └─────────────────────┘            └─────────────────────┘
   el mismo texto escrito              el contexto vive en
   y pagado tres veces                 .kiro/steering/
```

Un steering file es un archivo Markdown en `.kiro/steering/` que Kiro lee en cada interacción del
proyecto. Va versionado, así que **el estándar viaja con el código**.

---

## Lo que vas a lograr

- [ ] Tres steering files: contexto de negocio, estándares de desarrollo y estándares de infraestructura
- [ ] Evidencia comprobada de que Kiro los está aplicando
- [ ] Criterio sobre qué va y qué no va en un steering file

---

## Parte 1: La medición base (2 min)

Antes de crear nada, mide el comportamiento actual. Pregunta en el chat:

> ¿Qué versión de Node.js debo usar en este proyecto y en qué carpeta pongo un test nuevo?

**Anota la respuesta.** Kiro va a inferir del `package.json` y de la estructura, con más o menos
acierto y sin ninguna noción de por qué. Al final del lab repetimos la pregunta.

---

## Parte 2: Contexto de negocio (7 min)

Este es el steering que más valor aporta y el que casi nadie escribe. Kiro puede leer el código; no
puede leer el negocio.

### 2.1 Crear la carpeta

**macOS / Linux / Git Bash:**
```bash
mkdir -p .kiro/steering
```

**Windows (PowerShell / CMD):**
```powershell
mkdir .kiro\steering
```

### 2.2 Generar el steering de producto

> **Prompt 1:**
> Crea `.kiro/steering/producto-corresponsales.md` con el contexto de negocio de este proyecto:
>
> - Fundación delamujer es una entidad microfinanciera colombiana enfocada en la inclusión
>   financiera de mujeres microempresarias
> - Este servicio autoriza transacciones en la red de corresponsales: comercios aliados que prestan
>   servicios financieros en nombre de la entidad y reciben una comisión por transacción
> - Tipos soportados: DEPOSITO, RETIRO, PAGO_CREDITO, RECAUDO, CONSULTA_SALDO
> - Reglas invariantes del negocio:
>   - Toda transacción aprobada genera un comprobante con consecutivo único
>   - Los montos son en pesos colombianos y **siempre son enteros**: no existen centavos
>   - Un RETIRO entrega efectivo del comercio, por eso valida el cupo disponible del corresponsal
>   - La red opera entre las 6:00 y las 21:00
>   - Los puntos tienen conectividad intermitente, así que **el reintento es el caso normal**:
>     toda operación debe ser idempotente
> - Los motivos de rechazo son códigos estables que consumen sistemas externos: no se renombran
> - Nunca uses datos reales de clientes en ejemplos, tests o documentación
>
> Formato de reglas, conciso. No escribas prosa institucional.

### 2.3 Léelo con dos criterios

- **¿Es accionable?** Cada línea debería poder cambiar una decisión de Kiro. "Somos una entidad
  comprometida con la excelencia" no cambia nada. "Los montos son enteros" sí.
- **¿Es corto?** Es contexto que se envía siempre. Si tiene tres páginas, pagas tres páginas en cada
  prompt del proyecto.

---

## Parte 3: Estándares técnicos (7 min)

> **Prompt 2:**
> Crea dos steering files más:
>
> **1. `.kiro/steering/estandares-desarrollo.md`** con inclusión por defecto:
> - Stack: Node.js 22 LTS, CommonJS, sin TypeScript
> - Tests con Jest, en `tests/`, nombrados `<modulo>.test.js`
> - Todo cambio de comportamiento llega con su test. En funciones que validan límites o montos, los
>   tests de casos de borde son obligatorios
> - Linting con ESLint: el código debe pasar `npm run lint` antes de commitear
> - Comentarios y JSDoc en español
> - Estructura: `src/`, `tests/`, `docs/`, `infra/`
> - Cálculos monetarios en enteros de pesos, redondeando al peso
> - Al terminar un cambio, indícame qué comando debo correr para verificarlo
>
> **2. `.kiro/steering/estandares-iac.md`** con inclusión condicional `fileMatch` para los patrones
> `*.yaml`, `*.yml` y `*.tf`:
> - CloudFormation en YAML
> - Todo recurso lleva los tags: `Proyecto`, `Ambiente`, `Entidad`, `AdministradoPor`
> - Nombres: `{proyecto}-{ambiente}-{recurso}`
> - Cifrado en reposo obligatorio en todo recurso que almacene datos
> - Roles IAM con permisos mínimos: nunca `Action: "*"` ni `Resource: "*"`
> - Toda plantilla con `Parameters` para proyecto y ambiente, y `Outputs`
> - Ambientes válidos: dev, qa, prod. Región por defecto: us-east-1
> - Retención de logs de CloudWatch: mínimo 30 días
> - Comentarios en español

### 3.1 Dos detalles que vale mirar

**La última regla del primer archivo** —"indícame qué comando debo correr"— no cambia el código que
genera, cambia **cómo trabaja contigo**. A partir de ahora Kiro te devuelve el comando de
verificación sin que lo pidas. Esa categoría de regla es la que casi nadie usa y la que convierte a
Kiro en colaborador en lugar de generador.

**El front-matter del segundo archivo.** Ábrelo y confirma que arriba tiene:

```markdown
---
inclusion: fileMatch
fileMatchPattern: '*.yaml|*.yml|*.tf'
---
```

Si Kiro lo omitió, agrégalo a mano. Son dos líneas, y son las que evitan que ese archivo se cargue
en todos los prompts del proyecto.

> **Ojo:** `inclusion: fileMatch` y `inclusion: auto` son sintaxis válida, no errores. Si alguien
> más adelante "corrige" ese bloque, rompe la activación condicional.

> **Este archivo es el que va a trabajar solo en la Sesión 2.** Cuando generes la plantilla de
> CloudFormation, esas reglas de seguridad se aplican sin que las menciones.

---

## Parte 4: Comprobar que funciona (4 min)

### 4.1 Repite la pregunta base

> ¿Qué versión de Node.js debo usar en este proyecto y en qué carpeta pongo un test nuevo?

Compara con la respuesta de la Parte 1. Ahora responde con precisión y sin titubear.

### 4.2 La prueba que importa

> **Prompt 3:**
> Agrega una función `calcularComisionConIVA(tipo, monto)` a `src/corresponsales/comisiones.js` que
> aplique 19% de IVA sobre la comisión.

Eso es todo lo que dice el prompt. Sin decirle nada más, Kiro debería:

- [ ] Escribir el JSDoc en español
- [ ] Redondear a pesos enteros, sin centavos
- [ ] Ofrecer o generar los tests
- [ ] Decirte el comando de verificación

**Si hizo esas cuatro cosas, el steering está funcionando.** Ese es el entregable del lab, más que
los archivos.

```bash
npm test
```

> Si la función te parece innecesaria, revierte con
> `git checkout -- src/corresponsales/comisiones.js`. El objetivo era la prueba, no la función.

---

## Qué va y qué no va en un steering file

| Sí | No |
|----|-----|
| Stack, versiones, convenciones de nombres | Instrucciones de una tarea puntual |
| Reglas de negocio estables | **Secretos, credenciales, tokens** |
| Estructura de carpetas | Datos reales de clientes |
| Idioma de código y comentarios | Preferencias que cambian cada semana |
| Comandos de build, test y lint | Lo que Kiro deduce leyendo el código |
| Reglas de comportamiento del agente | Prosa institucional |

Regla práctica: **si lo vas a repetir en más de tres prompts, va en un steering file.**

> **Sobre secretos:** un steering file se commitea y se comparte. No pongas credenciales ni endpoints
> internos ahí. Si Kiro necesita saber que existe una variable de entorno, nómbrala; no la valorices.

---

## Verificación final

```bash
ls -la .kiro/steering/
npm test
npm run lint
```

```
.kiro/steering/
├── producto-corresponsales.md    ✓ siempre activo
├── estandares-desarrollo.md      ✓ siempre activo
└── estandares-iac.md             ✓ solo con archivos .yaml, .yml, .tf
```

### Commit

```bash
git add .kiro/steering/
git commit -m "feat: steering files de producto, desarrollo e infraestructura"
```

> **Fíjate en lo que acabas de hacer:** commiteaste el criterio del equipo como código. Quien clone
> el repositorio hereda el estándar sin que nadie se lo explique.

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Kiro no parece aplicar el steering | Verifica la ruta exacta: `.kiro/steering/` en la raíz del proyecto abierto en Kiro |
| El steering de IaC se activa siempre | Falta el front-matter `inclusion: fileMatch` o el patrón está mal escrito |
| Las respuestas se volvieron muy largas | Steering demasiado extenso. Recórtalo: se paga en cada prompt |
| Dos steering files se contradicen | Consolídalos. Kiro no tiene forma de saber cuál gana |
| Kiro ignora una regla | Hazla imperativa y verificable: "usa Node.js 22" en vez de "preferimos versiones modernas" |
| Se te acabaron los créditos | Copia los tres archivos desde `soluciones/steering/` a `.kiro/steering/` |

---

## Para llevar

```
┌──────────────────────────────────────────────────────────────────┐
│  ✓ Lo que repites en cada prompt, va en un steering file         │
│  ✓ El contexto de negocio es el que Kiro no puede deducir solo   │
│  ✓ Reglas accionables, no prosa institucional                    │
│  ✓ Corto: cada línea se envía en todos los prompts               │
│  ✓ Inclusión condicional para contexto que no aplica siempre     │
│  ✓ Sin secretos: el archivo se commitea y se comparte            │
│  ✓ Versionado = el estándar del equipo viaja con el código       │
└──────────────────────────────────────────────────────────────────┘
```

---

## Para después

### Los otros modos de inclusión

```markdown
---
inclusion: manual          # solo cuando lo invocas con # en el chat
---

---
inclusion: auto            # cuando tu pedido coincide con la descripción
name: estandares-iac
description: Estándares de infraestructura como código para AWS
---
```

### Referenciar otros archivos

```markdown
#[[file:openapi.yaml]]
```

Incluye el contenido de otro archivo dentro del steering. Es la forma de que un contrato de API, un
esquema o una especificación influyan en todo lo que se genere, sin copiarlos a mano.

### Recortar un steering inflado

> Reduce `producto-corresponsales.md` a la mitad. Conserva solo las reglas que cambian una decisión
> técnica. Elimina prosa institucional y cualquier cosa que Kiro pueda deducir leyendo el código.

### Llevarlo a un repositorio real

El ejercicio que más rinde después del workshop: tomar un repositorio propio y escribirle el steering
de contexto de negocio. Es media hora de trabajo que cambia todas las interacciones siguientes.

---

## Siguiente

[Lab 3: Hooks — calidad automática sin fricción →](../lab3-hooks/README.md)
