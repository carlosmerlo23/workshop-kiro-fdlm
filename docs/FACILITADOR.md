# Guía del facilitador

**No repartir a los participantes.** Contiene las respuestas de los ejercicios y los planes de
contingencia.

---

## 1. Cómo está dimensionado el workshop

El material fue medido, no estimado a ojo. El supuesto de cálculo:

```
   Un prompt sustancial en sesión guiada = 3 a 4 minutos
   ├── leer el enunciado del paso          30-60 s
   ├── esperar la generación               30 s a 3 min
   └── revisar y verificar el resultado    1-2 min
```

Con ese supuesto, cada lab tiene un número de prompts que cabe en su bloque:

| Lab | Prompts | Bloque | Holgura |
|-----|:-------:|:------:|---------|
| Lab 1 | 4 | 22 min | ~6 min |
| Lab 2 | 3 (+2 preguntas) | 20 min | ~5 min |
| Lab 3 | 2 (+1 prueba) | 18 min | ~7 min |
| Lab 4 | 2 (+2 consultas) | 18 min | ~5 min |
| Lab 5 | 6 (+2 iteraciones) | 34 min | ~4 min |
| Lab 6 | 3 (+1 verificación) | 20 min | ~5 min |
| Lab 7 | libre | 22 min | 4 min de entrega |

**El Lab 5 es el de menor holgura y el de mayor valor.** Si hay que sacrificar tiempo en algún lado,
sácalo del Lab 4 o del cierre de la Sesión 1, nunca del Lab 5.

Cada lab tiene una sección **Para después** con lo que se recortó. Si un grupo va muy rápido, esa
sección es la extensión natural; no improvises contenido.

---

## 2. Configurar el reloj real

La agenda está en minutos relativos. Llena esta tabla con las horas reales y compártela con el grupo.

### Sesión 1 — hora de inicio: `______`

| Min | Hora real | Bloque |
|-----|-----------|--------|
| 00 | | Bienvenida y check de entorno |
| 08 | | Kiro esencial + demo |
| 20 | | Lab 1: Entender código que no escribiste |
| 42 | | Lab 2: Steering files |
| 62 | | Break |
| 70 | | Lab 3: Hooks |
| 88 | | Lab 4: MCP |
| 106 | | Cierre |
| 120 | | Fin |

### Sesión 2 — hora de inicio: `______`

| Min | Hora real | Bloque |
|-----|-----------|--------|
| 00 | | Recap |
| 06 | | De código a despliegue + demo |
| 18 | | Lab 5: Infraestructura |
| 52 | | Break |
| 60 | | Lab 6: Pipeline y runbook |
| 80 | | Lab 7: Reto por equipos |
| 102 | | Resultados y cierre |
| 120 | | Fin |

> **Anuncia el reloj al inicio y respétalo en voz alta.** "Nos quedan 5 minutos del Lab 2" mantiene
> al grupo sincronizado mejor que cualquier cosa.

---

## 3. Los defectos plantados en el código

El código de `src/corresponsales/` tiene cuatro problemas puestos a propósito. Esta es la lista, con
su reproducción exacta.

### Defecto 1 — Comparación de cupo (el del Lab 1)

**Dónde:** `src/corresponsales/limites.js`, función `validarCupo`.
**Qué:** usa `corresponsal.cupoDisponible > monto` cuando debería ser `>=`. Un retiro por un monto
exactamente igual al cupo disponible se rechaza.

```bash
node -e "
const { validarCupo } = require('./src/corresponsales/limites');
console.log(validarCupo({ cupoDisponible: 500000 }, 'RETIRO', 500000));
"
# → { valido: false, motivo: 'CUPO_INSUFICIENTE' }
```

También es visible en `node src/index.js`: el segundo ejemplo es un retiro de $500.000 en un punto con
$500.000 de cupo.

**Cómo narrarlo:** el cliente llega a retirar sus $500.000, el corresponsal los tiene en el cajón, y
el sistema dice que no. Un carácter, con impacto directo en la red. Es el momento que más engancha del
Lab 1.

**Corrección:** cambiar `>` por `>=`.

### Defecto 2 — Sin validación de entrada

**Dónde:** `src/corresponsales/transacciones.js`, `registrarTransaccion`.
**Qué:** no valida que el monto sea positivo ni numérico. Acepta montos negativos y genera comisión
sobre ellos.

```bash
node -e "
const { registrarTransaccion } = require('./src/corresponsales/transacciones');
console.log(registrarTransaccion(
  { tipo: 'DEPOSITO', monto: -500000 },
  { codigo: 'CB-TEST', cupoDisponible: 0 },
  new Date(2026, 0, 15, 10)
));
"
# → APROBADA, con monto -500000
```

Hoy la validación de forma vive en el handler (`validarSolicitud`), lo que funciona pero deja el
dominio expuesto si se lo llama desde otro punto de entrada. Es un buen tema de discusión: **¿dónde
debe vivir la validación?**

### Defecto 3 — Consecutivo no idempotente (el puente entre sesiones)

**Dónde:** `src/corresponsales/transacciones.js`, `generarConsecutivo`.
**Qué:** usa `Date.now()`. Dos reintentos del mismo punto producen dos consecutivos distintos, así que
la transacción se duplica.

```bash
node -e "
const { generarConsecutivo } = require('./src/corresponsales/transacciones');
console.log(generarConsecutivo('CB-TEST'));
console.log(generarConsecutivo('CB-TEST'));
"
# → dos valores distintos para la misma operación
```

**Este es el defecto más importante del workshop**, porque no se resuelve en el código: se resuelve en
la arquitectura, con una clave de idempotencia en DynamoDB. Es lo que conecta la Sesión 1 con la
Sesión 2, y es la justificación de por qué la tabla tiene esa clave de partición.

Si el grupo no lo encuentra en el Lab 1, no importa: se cubre en el Lab 5 de todas formas. Pero si
alguien lo encuentra, dale espacio: es el hallazgo más valioso de la sala.

### Defecto 4 — Comisión con decimales en pesos

**Dónde:** `src/corresponsales/comisiones.js`, `calcularComision`.
**Qué:** `PAGO_CREDITO` tiene componente porcentual (0,15%), y no se redondea. En un país sin
centavos, eso produce valores imposibles.

```bash
node -e "
const { calcularComision } = require('./src/corresponsales/comisiones');
console.log(calcularComision('PAGO_CREDITO', 850500));
"
# → 2175.75
```

Es el más sutil de los cuatro. Solo aparece con montos que no son redondos, así que se le escapa a
quien prueba con $1.000.000.

### Cuál sale en qué lab

| Defecto | Dónde aparece |
|---------|---------------|
| 1. Cupo | **Lab 1, ruta guiada.** Se revela explícitamente en el enunciado |
| 2. Validación de entrada | Lab 1, sección Para después. Suele salir en la revisión del Prompt 3 |
| 3. Consecutivo | Lab 1 Para después, y se resuelve en **Lab 5** |
| 4. Decimales | Lab 1, sección Para después |

---

## 4. Preparación previa del facilitador

### Una semana antes

- [ ] Enviar [PREPARACION.md](../PREPARACION.md) a los participantes
- [ ] **Confirmar el escenario de licenciamiento con AWS** (ver sección 5)
- [ ] Recoger el estado de créditos de cada participante
- [ ] Publicar el repositorio en un lugar accesible para el cliente
- [ ] Llenar los `[POR DEFINIR]` del README: fechas, horario, contactos

### El día anterior

- [ ] Correr el workshop completo en tu máquina, de punta a punta. **No es opcional.** Es la única
      forma de saber cuánto tarda de verdad y de detectar si algo cambió en Kiro o en los servidores MCP
- [ ] Verificar que los servidores MCP arrancan (la primera descarga con `uvx` tarda)
- [ ] Tener una cuenta Kiro Pro propia con créditos de sobra para demostrar en vivo
- [ ] Preparar las parejas de trabajo para quien tenga créditos justos
- [ ] Tener el repositorio abierto en dos ventanas: una limpia para demostrar, otra con las soluciones

### 15 minutos antes

- [ ] Verificar la conexión y el compartir pantalla
- [ ] Abrir el reloj de la sesión donde el grupo lo vea
- [ ] Tener `soluciones/` a mano para desbloquear rápido

---

## 5. Licenciamiento: lo que hay que confirmar antes

Hay un supuesto que conviene aclarar con el cliente y con AWS antes de comprometer nada.

**AWS Skill Builder no otorga créditos de Kiro.** Skill Builder es la plataforma de formación de AWS,
con contenido digital gratuito y suscripciones de pago para laboratorios en la consola. No habilita
Kiro.

Los 50 créditos gratuitos vienen del **plan Free de Kiro**, al que se accede iniciando sesión en Kiro
con AWS Builder ID (o con Google/GitHub). El resultado para el participante es el mismo —50 créditos
gratis— pero el camino de activación es distinto, y decirlo bien evita que alguien espere el día del
workshop una activación que no va a llegar.

### Qué confirmar con AWS

- [ ] ¿Hay licencias Kiro Pro disponibles para los participantes?
- [ ] ¿Cuántas, y cubren a todo el grupo?
- [ ] ¿Con qué identidad se asocian (Builder ID, correo corporativo, Identity Center)?
- [ ] ¿Estarán activas **antes** de la Sesión 1?
- [ ] ¿Cubren solo el workshop o un período de evaluación posterior?
- [ ] ¿Quién es el contacto para incidencias de licenciamiento durante la sesión?

Detalle completo y planes de contingencia en [GESTION-CREDITOS.md](./GESTION-CREDITOS.md).

---

## 6. Plan B por bloque

Lo que puede fallar y qué hacer, sin perder la sesión.

| Situación | Plan B |
|-----------|--------|
| **Nadie logró instalar `uv`** | Salta el Lab 4 como ejercicio y hazlo como demo desde tu máquina. Para el Lab 5, los participantes generan la plantilla y **tú** la validas en vivo con tu MCP. Se pierde el "hazlo tú" pero no el aprendizaje |
| **Los servidores MCP no arrancan** | Igual que el anterior. Ten tus servidores probados el día antes |
| **Kiro está lento o caído** | Cambia a modo demo: tú generas, el grupo discute el resultado. Los labs siguen teniendo valor como conversación de diseño |
| **Muchos sin créditos** | Parejas inmediatas. Si es masivo, convierte los labs 3 y 4 en demo y concentra los créditos disponibles en el Lab 5 |
| **El grupo va muy retrasado en la Sesión 1** | Recorta el Lab 4 a la Parte 1 (configurar MCP) y explica las partes 2 y 3. Lo importante es que los servidores queden activos para la Sesión 2 |
| **El grupo va retrasado en el Lab 5** | Salta la Parte 5 (documentar arquitectura). Lo que no se puede saltar es la Parte 3, el ciclo de validación |
| **El grupo va retrasado en la Sesión 2** | Recorta el Lab 7 a un solo entregable, o conviértelo en una discusión de 10 minutos sobre cómo lo abordarían |
| **El grupo va muy rápido** | Secciones **Para después**. La más rentable de la Sesión 1 es el steering de un repo propio (Lab 2); de la Sesión 2, la revisión del rol IAM acción por acción (Lab 5) |
| **Kiro genera algo mal y nadie lo nota** | **Aprovéchalo.** Es la mejor lección del workshop. Señálalo y vuelve al hábito de verificar |
| **Alguien cuestiona la seguridad de MCP** | Es una pregunta legítima y esperable en una entidad financiera. La respuesta está en el Lab 4, Parte 3: corren local, usan tus credenciales, validar plantillas no requiere credenciales, nunca producción |
| **Un participante trae un caso real de su trabajo** | Oro. Si hay tiempo, úsalo en vez del ejemplo. Si no, agéndalo para después del workshop |

---

## 7. Momentos clave: dónde parar y subrayar

Siete momentos que enganchan. Si el reloj aprieta, protégelos.

| # | Momento | Lab | Por qué funciona |
|---|---------|-----|------------------|
| 1 | Kiro explica el repo en 30 segundos | Lab 1, P1 | Contraste inmediato con lo que a ellos les costaría |
| 2 | El bug del cupo | Lab 1, P3 | Un carácter, impacto de negocio evidente, entendible por cualquiera |
| 3 | La misma pregunta antes y después del steering | Lab 2, P4 | Demuestra el valor del contexto persistente sin explicarlo |
| 4 | El guardarraíl pide confirmación | Lab 3, P3 | Visual, y habla el idioma del riesgo financiero |
| 5 | Kiro cita documentación oficial con enlaces | Lab 4, P2 | Responde a la objeción de "¿y si se lo inventa?" |
| 6 | **El validador rechaza y Kiro se corrige** | Lab 5, P3 | El clímax del workshop. Dedícale tiempo |
| 7 | El pipeline pasa a verde en GitHub | Lab 6 | Cierre tangible, si hay repositorio remoto |

**Cómo aprovechar el momento 6:** cuando el validador reporte errores, no lo pases de largo. Detén al
grupo 30 segundos y di en voz alta: *"Kiro no adivinó que estaba mal. Se lo dijo una herramienta
determinista, y corrigió con esa información. Por eso el resultado es auditable."* Esa frase es el
argumento de venta del workshop entero.

---

## 8. Preguntas difíciles que van a hacer

Vienen de un contexto de entidad financiera vigilada. Prepararlas vale más que cualquier slide.

**"¿Esto reemplaza a nuestros desarrolladores?"**
No, y el workshop lo muestra: cada lab tiene un punto donde hace falta criterio humano. Distinguir un
hallazgo crítico de ruido en `cfn-guard`, decidir si el caso pide DynamoDB, definir qué debe bloquear
un merge. Lo que cambia es en qué se les va el tiempo.

**"¿Nuestro código sale de la organización?"**
Los prompts y el contexto se procesan en el servicio. Es una decisión de arquitectura de seguridad que
la entidad debe tomar con información, no un detalle a resolver en un workshop. Remite a la
documentación de Kiro y a los términos del servicio, y ofrece conectarlos con el equipo de AWS.

**"¿Cómo audito lo que generó una IA?"**
Es la pregunta mejor formulada de las tres, y el workshop tiene respuesta: el artefacto queda
versionado en Git, con su validación en el pipeline y su evidencia de ejecución. La auditoría no es
sobre el modelo, es sobre el artefacto y el proceso que lo aprobó.

**"¿Y si genera un error de cálculo en una comisión?"**
Por eso el Lab 1 insiste en el ciclo test-que-falla-primero, por eso los tests de borde son
obligatorios en el steering, y por eso `tarifas.js` tiene un guardarraíl. La respuesta no es "no pasa",
es "así lo detectamos".

**"¿Cuánto nos va a costar?"**
Datos concretos en [GESTION-CREDITOS.md](./GESTION-CREDITOS.md). Y el dato del propio workshop: cuatro
horas de trabajo intensivo consumen entre 30 y 46 créditos, lo que da una referencia realista para
dimensionar un plan.

---

## 9. Rúbrica del Lab 7

Tres entregables, 10 puntos.

| Entregable | Puntos | Qué buscar |
|------------|:------:|------------|
| Tarifa y límite en `tarifas.js` | 3 | Respeta la estructura existente; confirmó el guardarraíl |
| Lógica del giro + tests de borde | 4 | **Reutiliza** `calcularComision`, `validarMonto`, `validarHorario`. Tests con monto exacto en el límite y cupo exacto |
| Consulta de pendientes en la plantilla | 3 | Índice secundario global bien diseñado; rol IAM actualizado; plantilla sigue validando |

### Criterio de corrección

- **Puntos completos:** funciona, verificado, coherente con lo existente, decisión justificada.
- **Mitad:** funciona pero incompleto, o resuelto de forma que no encaja con el diseño.
- **Cero:** no entregado, o en rojo (tests fallando o plantilla que no valida).

### Lo que hay que premiar más allá del puntaje

- **Reutilizó en vez de duplicar.** El indicador más fuerte de que entendieron.
- **Puede explicar por qué modeló el giro así.** Vale más que el código.
- **Encontró algo que nadie pidió.**
- **Documentó una limitación conocida.**

### Errores esperados

| Error | Qué decir |
|-------|-----------|
| Copiaron `calcularComision` a `giros.js` | Ahora hay dos verdades sobre las comisiones. ¿Cuál gana cuando cambien las tarifas? |
| Modelaron el giro con una sola función | ¿Cómo distinguen un giro enviado de uno cobrado? |
| Validaron el cupo en el punto de origen | El efectivo sale del punto de pago, no del de envío |
| Resolvieron la consulta con un `Scan` | Funciona con 100 giros. ¿Y con 100.000, todos los días? |
| Olvidaron actualizar el rol IAM | La plantilla valida, pero en ejecución el permiso falta |

---

## 10. Después del workshop

- [ ] Enviar la encuesta de feedback el mismo día
- [ ] Compartir el repositorio con todo lo generado durante las sesiones
- [ ] Recopilar los mejores prompts de los participantes y devolverlos como documento
- [ ] Consolidar los compromisos individuales del cierre y hacer seguimiento en dos semanas
- [ ] Registrar en este documento lo que no funcionó, para la próxima edición
- [ ] Si el cliente quiere avanzar, agendar la conversación de licenciamiento con AWS

### Notas de esta edición

Espacio para que el facilitador escriba lo que aprendió:

```
Fecha:
Participantes:
Qué se atrasó:
Qué sobró:
Qué preguntaron que no estaba previsto:
Qué cambiar para la próxima:
```

---

## 11. Adaptar el workshop a otro cliente

Ver [ADAPTAR-A-OTRO-CLIENTE.md](./ADAPTAR-A-OTRO-CLIENTE.md).
