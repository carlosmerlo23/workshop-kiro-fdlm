> **Ruta guiada (22 min):** Partes 1, 2 y 3. Son 4 prompts. Es lo que hacemos en vivo.
> **[Para después](#para-después):** el resto queda como guía para cuando vuelvas al repo.

---

# Lab 1: Entender código que no escribiste

**Sesión 1 · Minuto 20–42 · 22 minutos**

---

## Objetivo

Usar Kiro para volverte productivo en un módulo que nunca habías visto: entenderlo, documentarlo y
encontrarle un defecto real.

## Por qué este lab primero

Es el caso de uso donde Kiro paga más rápido, y no le pasa solo a la gente nueva: le pasa a
cualquiera que toque un módulo que no mantiene. Días de leer código y preguntar por los pasillos,
que no producen nada.

El código de `src/corresponsales/` está en ese estado a propósito: funciona, no tiene documentación,
la cobertura de tests es casi nula y tiene defectos reales.

---

## Lo que vas a lograr

- [ ] Entender el módulo sin leerlo línea por línea
- [ ] `docs/ONBOARDING.md` con lo necesario para que alguien nuevo arranque
- [ ] Un defecto real encontrado, reproducido y corregido con su test

---

## Antes de empezar

```bash
git checkout -b workshop/<tu-nombre>
npm test
node src/index.js
```

Mira la salida de `node src/index.js`. Son cuatro transacciones: dos aprobadas y dos rechazadas.
**Guarda esa imagen mental**, la usamos en la Parte 3.

---

## Parte 1: Entender el módulo (6 min)

No pidas cambios todavía. Primero entiende.

> **Prompt 1:**
> Analiza la carpeta `src/corresponsales/` y explícame:
> 1. Qué hace el módulo en términos de negocio
> 2. Qué responsabilidad tiene cada archivo
> 3. El flujo completo de `registrarTransaccion`, indicando en qué orden se ejecutan las validaciones
>
> Sé conciso. No modifiques nada todavía.

### Ahora verifica

Abre `src/corresponsales/transacciones.js` y confirma que el orden de validaciones que describió
Kiro es el real. Toma 30 segundos.

> **Por qué importa:** si Kiro se equivoca en el mapa, todo lo que construyas sobre ese mapa hereda
> el error. Este es el hábito central del workshop, y por eso lo practicamos en el primer prompt.

Fíjate en algo: Kiro leyó cuatro archivos sin que le dijeras cuáles y su respuesta se apoya en el
código real. Eso es lo que a ti te habría tomado veinte minutos de lectura.

---

## Parte 2: Documentar lo que entendiste (6 min)

> **Prompt 2:**
> Haz dos cosas:
>
> 1. Crea `docs/ONBOARDING.md` para alguien que entra hoy a mantener `src/corresponsales/`. Incluye:
>    qué problema de negocio resuelve, diagrama del flujo de `registrarTransaccion` en ASCII, tabla
>    de archivos con su responsabilidad, tabla de tipos de transacción con tarifa y límite leída del
>    código, y cómo correr los tests.
> 2. Agrega comentarios JSDoc en español a las funciones exportadas de
>    `src/corresponsales/comisiones.js` y `src/corresponsales/limites.js`, con `@param`, `@returns`
>    y `@throws` donde aplique. No cambies la lógica.
>
> Escribe todo en español, directo, sin relleno.

### Verifica que no cambió el comportamiento

```bash
npm test
npm run lint
```

Ambos deben seguir en verde. Si Kiro "aprovechó" para arreglar algo mientras documentaba, míralo con
`git diff` y decide tú si lo aceptas.

> Pedir una cosa y confirmar que solo pasó eso es un hábito que se paga solo.

---

## Parte 3: Encontrar un defecto real (8 min)

La parte más valiosa del lab.

### 3.1 Revisión dirigida

> **Prompt 3:**
> Haz una revisión crítica de `src/corresponsales/limites.js` y
> `src/corresponsales/transacciones.js` buscando:
> - Errores en comparaciones de límites y casos de borde
> - Validaciones de entrada que faltan
>
> Para cada hallazgo dime: archivo y línea, por qué es un problema, un ejemplo concreto que lo
> reproduzca, y el impacto para un corresponsal o un cliente. Ordénalos por severidad.
> **No corrijas nada todavía.**

### 3.2 Reproduce antes de creer

Vuelve a la salida de `node src/index.js`. Una de las dos transacciones rechazadas dice
`CUPO_INSUFICIENTE`: es un retiro de $500.000 en un punto que tiene exactamente $500.000 de cupo.

**¿Debería rechazarse?** El corresponsal tiene el efectivo justo. La plata está ahí.

```bash
node -e "
const { validarCupo } = require('./src/corresponsales/limites');
console.log(validarCupo({ cupoDisponible: 500000 }, 'RETIRO', 500000));
"
```

Ahí está: una comparación `>` donde debía ir `>=`. Un carácter.

> **Esto es lo que un cliente ve:** llega al punto a retirar sus $500.000, el corresponsal los tiene
> en el cajón, y el sistema le dice que no. El corresponsal pierde la comisión, el cliente pierde el
> viaje, y nadie sabe por qué. Un defecto de un carácter con impacto directo en la red.

### 3.3 Corrige, con el test primero

> **Prompt 4:**
> Corrige ese defecto, pero en este orden:
> 1. Primero escribe en `tests/limites.test.js` un test que falle demostrando el problema: un retiro
>    por un monto exactamente igual al cupo disponible debe ser válido. Muéstrame que falla.
> 2. Después haz la corrección mínima necesaria. No refactorices nada más.
> 3. Agrega también los tests de borde: un peso por debajo del cupo y un peso por encima.

```bash
npm test
```

> **El ciclo test-que-falla → corrección → test-que-pasa** es lo que hace confiable el trabajo con un
> agente. Sin el test que falla primero, no tienes evidencia de que corrigió algo real.

---

## Verificación final

```bash
npm test              # todo en verde, incluidos los tests nuevos
npm run lint          # sin errores
git status            # revisa qué se creó y modificó
```

```
docs/ONBOARDING.md          ✓ generado
src/corresponsales/
├── comisiones.js           ✓ con JSDoc
└── limites.js              ✓ con JSDoc + defecto corregido
tests/limites.test.js       ✓ nuevo, con casos de borde
```

### Commit

```bash
git add -A
git commit -m "docs: onboarding del modulo corresponsales y correccion de validacion de cupo"
```

---

## Review en grupo (2 min)

1. **¿Cuántos defectos encontró tu Kiro?** Van a variar. Comparen los prompts: quien pidió
   categorías concretas encontró más que quien pidió "revisa el código".
2. **¿Alguien encontró algo que Kiro no?** Suele pasar, y ese es el punto.
3. **¿Cuánto habría tomado esto sin Kiro?** Sean honestos.

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Kiro describe el flujo en el orden equivocado | Reformula con `#File src/corresponsales/transacciones.js` para acotar el contexto |
| No encuentra ningún defecto | El prompt fue muy abierto. Pide categorías concretas: casos de borde, validación de entradas |
| Modificó código cuando solo pediste documentar | `git diff` para ver el alcance; `git checkout -- <archivo>` para revertir |
| El test generado pasa de entrada | No está probando el borde. Pídele el caso exacto: monto **igual** al cupo |
| Se te acabaron los créditos | Avisa al facilitador. Sigue en pareja y consulta `soluciones/docs/` |

---

## Para llevar

```
┌──────────────────────────────────────────────────────────────────┐
│  ✓ Entender primero, cambiar después                             │
│  ✓ Verificar el mapa antes de construir sobre él                 │
│  ✓ Pedir una cosa a la vez y confirmar que solo pasó eso         │
│  ✓ Test que falla → corrección → test que pasa                   │
│  ✓ Los casos de borde son donde viven los defectos               │
└──────────────────────────────────────────────────────────────────┘
```

---

## Para después

Fuera de la ruta guiada, pero vale la pena. Quedan tres defectos más en el código.

### Documentar la deuda técnica

> Haz una revisión crítica de `src/corresponsales/` completo, buscando además: supuestos que se
> rompen si el servicio corre en varias instancias en paralelo, y problemas de precisión en cálculos
> monetarios en pesos colombianos. Crea `docs/DEUDA-TECNICA.md` con cada hallazgo: título, severidad,
> archivo y línea, cómo reproducirlo, impacto de negocio y corrección propuesta.

Pistas de lo que queda por encontrar:

- ¿Qué pasa si llega un `PAGO_CREDITO` de $850.500? Mira los decimales de la comisión, en un país
  donde no existen los centavos.
- ¿Qué pasa si el punto envía dos veces la misma transacción? Mira `generarConsecutivo`.
  **Ese es el que resolvemos en la Sesión 2.**

### Medir la cobertura

```bash
npm run test:coverage
```

> Genera tests para las funciones de `src/corresponsales/` que sigan sin cobertura. Para cada una:
> el caso válido, el inválido, y los valores exactamente en el límite por arriba y por abajo.

La diferencia de cobertura antes y después es la métrica honesta del trabajo.

---

## Siguiente

[Lab 2: Steering files — el ADN del equipo →](../lab2-steering/README.md)
