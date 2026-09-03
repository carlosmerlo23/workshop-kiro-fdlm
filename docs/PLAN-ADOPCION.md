# Plan de adopción

Qué hacer después del workshop para que las cuatro horas no se queden en cuatro horas.

Está ordenado por lo que se puede hacer sin pedir permiso, lo que requiere acuerdo del equipo, y lo
que requiere una decisión de la organización.

---

## Esta semana: sin pedirle permiso a nadie

Cada uno de estos es de una persona y una tarde.

### 1. Un steering file en un repositorio real

**Por qué primero:** es lo que más rinde por hora invertida, y el efecto se nota desde el siguiente
prompt.

Toma un repositorio que mantengas y escribe `.kiro/steering/producto.md` con el contexto de negocio
que Kiro no puede deducir del código: qué resuelve el sistema, las reglas invariantes, los términos
del dominio, lo que nunca hay que hacer.

Media hora de trabajo. Cambia todas las interacciones siguientes.

### 2. Un hook de comando

Un `PostFileSave` que corra el linter o los tests del proyecto. Cuesta cero créditos y elimina una
clase entera de "se me olvidó".

### 3. Documentar el módulo que nadie entiende

Todo equipo tiene uno. Genera su `ONBOARDING.md` con Kiro y déjalo en el repositorio.

Si el documento le sirve a alguien más en la próxima semana, ya justificó el ejercicio.

### 4. Los servidores MCP de AWS

Configura `aws-docs` y `aws-iac` en el proyecto donde trabajes con infraestructura. Es un archivo de
15 líneas y cambia la calidad de todo lo que generes en YAML.

---

## Este mes: requiere acuerdo del equipo

### 5. Steering files versionados y revisados como código

El paso de "yo tengo mi steering" a "el equipo tiene su steering". Implica:

- Los steering files viven en el repositorio, no en la máquina de cada uno
- Se revisan en pull request, como cualquier cambio
- Hay un responsable de mantenerlos cuando cambien las convenciones

**Señal de que funcionó:** dos personas distintas le piden lo mismo a Kiro y obtienen resultados
consistentes.

### 6. Validación de IaC en un pipeline real

Elige un servicio, agrega `cfn-lint` a su pipeline, y deja el paso de seguridad en modo advertencia al
principio.

**Importante:** empieza advirtiendo, no bloqueando. Un pipeline que bloquea desde el día uno con
decenas de hallazgos heredados se desactiva en una semana. Bloquea cuando el número de hallazgos sea
manejable.

### 7. Un runbook para un servicio que no lo tiene

Genéralo con Kiro desde los artefactos reales del servicio, y después pásale el prompt de la prueba:
*"¿alguien que no conoce este servicio podría seguirlo a las 2 de la mañana sin llamar a nadie?"*

**La prueba de verdad:** que la próxima persona de turno lo use en un incidente real.

### 8. Definir qué merece guardarraíl

Reúnan al equipo 30 minutos y hagan la lista de archivos donde un cambio accidental cuesta caro.
Candidatos habituales:

- Tablas de tarifas, tasas y comisiones
- Reglas de límites y cupos
- Políticas de IAM
- Plantillas de infraestructura de producción
- Configuración de retención de datos
- Migraciones de base de datos

Después, un hook `PreToolUse` para cada uno. El del workshop sirve como plantilla.

### 9. Acordar el criterio de uso

La conversación que casi nadie tiene y que evita problemas después. Tres preguntas:

- ¿Qué se puede generar con IA y aceptar con la verificación habitual?
- ¿Qué requiere revisión humana explícita antes de integrarse?
- ¿Qué no se genera con IA en este equipo?

No hay una respuesta correcta, pero hay una respuesta del equipo. Escríbanla en el steering.

---

## Este trimestre: requiere decisión de la organización

### 10. Modelo de licenciamiento

Con el dato del workshop: cuatro horas de trabajo intensivo consumen entre 30 y 46 créditos. Eso da
una referencia realista para dimensionar.

Preguntas a resolver:

- ¿Cuántas personas van a usar Kiro de forma habitual?
- ¿Qué plan corresponde a su intensidad de uso?
- ¿Se administra por individuo o de forma centralizada?
- ¿Hay presupuesto para el excedente por consumo?

Datos actualizados en [GESTION-CREDITOS.md](./GESTION-CREDITOS.md).

### 11. Reglas de cumplimiento propias

El conjunto genérico de reglas de seguridad de AWS es un buen punto de partida, pero no conoce las
políticas de la entidad. Escribir reglas propias de `cfn-guard` convierte una validación genérica en
una validación que sirve de verdad, y es lo que permite pasar de advertir a bloquear.

Es un proyecto conjunto de seguridad e infraestructura, no de una persona.

### 12. Postura de seguridad sobre MCP

Va a salir en la primera revisión de seguridad, así que mejor tenerla antes:

- ¿Qué servidores MCP se aprueban para uso interno?
- ¿Con qué permisos de AWS?
- ¿Se permiten servidores de terceros o solo los de AWS Labs?
- ¿Cómo se documenta y aprueba un servidor nuevo?

Los hechos técnicos para esa conversación están en el Lab 4: corren localmente, usan las credenciales
del desarrollador, la validación de plantillas no requiere credenciales, y `autoApprove` controla qué
se ejecuta sin confirmación.

### 13. Medir el impacto

Sin medición, la conversación de renovación es una discusión de opiniones. Cuatro métricas que se
pueden capturar sin instrumentar nada:

| Métrica | Cómo medirla | Antes | Después |
|---------|--------------|-------|---------|
| Tiempo de onboarding a un módulo nuevo | Preguntar al desarrollador que entra | | |
| Cobertura de tests | El reporte del pipeline | | |
| Servicios con runbook | Contarlos | | |
| Tiempo de generar los artefactos de despliegue de un servicio nuevo | Medirlo la próxima vez | | |

La cuarta es la más contundente para una conversación con dirección.

### 14. Sesiones Spec en el flujo formal

Este workshop usó Vibe en todos los labs por costo de créditos, y Spec solo como demo. Con licencias
Pro, vale evaluar Spec para features grandes.

El argumento no es que genere más código: es que **el requisito y el diseño quedan escritos y
versionados junto al código**. Para una entidad financiera vigilada, poder mostrar por qué el sistema
hace lo que hace no es un lujo.

---

## Los cinco hábitos que sostienen todo esto

Sin ellos, las herramientas no cambian nada.

**1. Verificar siempre.** Cada cambio termina con un comando que lo comprueba. Es la diferencia entre
acelerar y acumular deuda más rápido.

**2. Test que falla primero.** Cuando corrijas un defecto, escribe primero el test que lo demuestra.
Sin eso no tienes evidencia de que corregiste algo real.

**3. Pedir una cosa a la vez.** Y confirmar que solo pasó eso. `git diff` es tu amigo.

**4. Lo que se repite, se escribe una vez.** Si lo dices en más de tres prompts, va en un steering
file. Si depende de que alguien se acuerde, va en un hook.

**5. La herramienta valida, no el modelo.** Cuando puedas apoyar una corrección en la salida de un
validador determinista en lugar del criterio del agente, hazlo. Es lo que hace auditable el resultado.

---

## Cómo saber si la adopción funcionó

A los tres meses, cuatro señales:

```
   ✓ Los steering files se actualizan cuando cambian las convenciones,
     sin que nadie lo pida

   ✓ Hay al menos un pipeline que bloquea por una regla de seguridad
     de la entidad, no genérica

   ✓ Alguien usó un runbook generado con IA en un incidente real,
     y le sirvió

   ✓ Cuando entra alguien nuevo, su primera semana es notablemente
     más productiva que antes
```

Si ninguna se cumple, el workshop fue una demo interesante. Si se cumplen dos, cambió la forma de
trabajar.

---

## Seguimiento

| Momento | Qué revisar | Responsable |
|---------|-------------|-------------|
| 2 semanas | Los compromisos individuales del cierre | `[POR DEFINIR]` |
| 1 mes | Steering files en repositorios reales, primer pipeline con validación | `[POR DEFINIR]` |
| 3 meses | Las cuatro señales de arriba, y la decisión de licenciamiento | `[POR DEFINIR]` |

Contacto para dudas post-workshop: `[POR DEFINIR]`
