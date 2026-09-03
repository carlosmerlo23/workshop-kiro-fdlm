# Bienvenida y objetivos

**Sesión 1 · Minuto 00–08 · 8 minutos**

---

## Bienvenida

Bienvenidos al Workshop de Kiro para Fundación delamujer.

En las próximas dos sesiones vamos a trabajar con Kiro, el entorno de desarrollo agéntico de AWS,
sobre un caso propio de la entidad: el servicio de transacciones de la **red de corresponsales**.

No vamos a ver una demo de autocompletado. Vamos a resolver dos problemas concretos:

```
┌────────────────────────────────────────────────────────────────────┐
│  SESIÓN 1   Entrar a código que no conozco, hacer que la IA        │
│             respete los estándares del equipo, automatizar         │
│             la calidad y conectarla a fuentes confiables.          │
│                                                                    │
│  SESIÓN 2   Convertir ese código en artefactos de despliegue:      │
│             infraestructura AWS, pipeline y documentación          │
│             operativa, validados antes de desplegar.               │
└────────────────────────────────────────────────────────────────────┘
```

---

## Qué vas a lograr hoy

Al final de esta sesión, cada participante habrá:

- [ ] Entendido y documentado un módulo de código que no escribió, usando Kiro
- [ ] Encontrado al menos un defecto real en el código base
- [ ] Creado steering files que codifican los estándares y el contexto del equipo
- [ ] Configurado hooks que ejecutan validaciones de forma automática
- [ ] Conectado Kiro a servidores MCP de AWS

Y algo menos visible pero más importante: habrá desarrollado criterio sobre **cuándo la respuesta
de Kiro es buena y cuándo hay que verificarla**.

---

## Reglas del workshop

1. **Pregunta cuando quieras.** Interrumpir es mejor que quedarse atrás.
2. **Verifica siempre.** Kiro genera rápido y a veces se equivoca. Cada lab termina con una
   verificación ejecutable.
3. **El prompt es el entregable.** Guarda los prompts que te funcionaron. Valen más que el código.
4. **Comparte lo que descubras.** Si encontraste una forma mejor de pedirlo, dilo en voz alta.
5. **Nada de datos reales.** El caso usa datos ficticios. No pongas información de clientes reales
   en los prompts.
6. **Cuida los créditos.** Cada prompt consume cuota. Piensa antes de escribir.

---

## Dinámica de cada lab

```
┌──────────────────────────────────────────────────────────────┐
│  CONTEXTO  →   TU TURNO   →   REVIEW                         │
│   2-3 min      12-14 min       3-4 min                       │
└──────────────────────────────────────────────────────────────┘
```

Cada lab tiene entre 2 y 5 prompts, con el texto exacto escrito. No tienes que inventar cómo pedirlo:
la primera vez lo copias, y para el tercer lab ya lo estarás escribiendo a tu manera.

Cada lab está partido en dos:

- **Ruta guiada:** lo que hacemos en vivo. Está medido para el bloque de tiempo.
- **Para después:** extensiones que quedan en el documento para cuando vuelvas al repo solo.

Si te atrasas, la ruta guiada es lo que no se salta.

---

## Check de entorno (3 min)

En la terminal integrada de Kiro (`Ctrl+` `` ` ``), dentro de la carpeta del repositorio:

```bash
node --version      # v20 o superior
git --version       # 2.30 o superior
uv --version        # cualquiera, pero debe responder
npm test            # 2 tests en verde
```

### Y en el chat de Kiro

> Responde en una línea: ¿en qué carpeta estoy trabajando?

Si Kiro responde con la ruta del repositorio, tu entorno está listo.

### Levanta la mano si

- Algún comando no responde
- Kiro no contesta en el chat
- Tienes **menos de 45 créditos** disponibles

Resolvemos ahora, no a mitad del Lab 5.

---

## Tu rama de trabajo

```bash
git checkout -b workshop/<tu-nombre>
```

Todo lo que generes va ahí. Al final de cada lab hacemos commit; así queda un registro de tu
avance y puedes comparar con `soluciones/`.

---

## Ice-breaker (1 min)

Escríbelo en el chat mientras corren las verificaciones, en una frase:

> **¿Cuál es la tarea de tu trabajo que más tiempo te quita y menos te aporta?**

Guarda tu respuesta. En el cierre de la Sesión 2 vamos a volver a ella para evaluar si Kiro tiene
algo que decir al respecto.

---

## Siguiente

[Kiro esencial: Vibe, Spec, autonomía y créditos →](./01-kiro-esencial.md)
