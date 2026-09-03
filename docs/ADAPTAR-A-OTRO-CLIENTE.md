# Adaptar este workshop a otro cliente

Este material está instanciado para Fundación delamujer, pero la estructura es genérica. Adaptarlo a
otro cliente toma entre 4 y 8 horas de trabajo, según cuánto quieras personalizar el dominio.

---

## Qué cambia y qué no

```
┌─────────────────────────────────────────────────────────────────────┐
│  NO CAMBIA (el 80% del material)                                    │
│  ├── La estructura de las dos sesiones y sus tiempos                │
│  ├── Los temas: onboarding, steering, hooks, MCP, IaC, pipeline     │
│  ├── El ciclo generar → validar → corregir → revalidar              │
│  ├── Los momentos clave y la pedagogía de cada lab                  │
│  └── Toda la documentación transversal (créditos, glosario, etc.)   │
│                                                                     │
│  CAMBIA (el 20%)                                                    │
│  ├── El nombre del cliente y el contexto de la entidad              │
│  ├── El caso de negocio y el código base                            │
│  ├── Los defectos plantados                                         │
│  └── La arquitectura AWS objetivo                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Ruta rápida: solo cambiar el cliente (1 hora)

Si el caso de negocio de corresponsalía bancaria sirve —cualquier entidad financiera, cooperativa o
fintech lo va a reconocer— basta con reemplazar el nombre.

### Variables a reemplazar

| Buscar | Reemplazar por | Dónde aparece |
|--------|----------------|---------------|
| `Fundación delamujer` | Nombre del cliente | Todo el material |
| `FundacionDelamujer` | Nombre sin espacios | Tag `Entidad` en la plantilla y en el steering de IaC |
| `corresponsales` | Prefijo del proyecto | `NombreProyecto` en la plantilla, nombres de recursos |
| `workshop-kiro-fdlm` | Nombre del repositorio | README, comandos de clonado |
| `[POR DEFINIR]` | Fechas, horarios, contactos | README, cierre final |

```bash
# Reemplazo masivo, revisando el resultado después
grep -rl "Fundación delamujer" --include="*.md" . | xargs sed -i '' 's/Fundación delamujer/NUEVO CLIENTE/g'
grep -rl "FundacionDelamujer" --include="*.md" --include="*.yaml" . | xargs sed -i '' 's/FundacionDelamujer/NuevoCliente/g'
```

> Revisa el resultado. El reemplazo automático no distingue cuando el nombre está en una frase que
> también hay que reescribir, como "entidad microfinanciera colombiana enfocada en la inclusión
> financiera de mujeres microempresarias".

### Después del reemplazo

- [ ] Reescribir el párrafo "Por qué este caso" en [CASO-NEGOCIO.md](./CASO-NEGOCIO.md)
- [ ] Ajustar el steering de producto en `soluciones/steering/producto-corresponsales.md`
- [ ] Actualizar la sección "Casos de uso" si mencionas al cliente por nombre
- [ ] Llenar los `[POR DEFINIR]`
- [ ] Correr la verificación de la sección final de este documento

---

## Ruta completa: cambiar el caso de negocio (4 a 8 horas)

Si el cliente no es del sector financiero, o si quieres usar su dominio real.

### Criterios para elegir un buen caso

El caso de corresponsalía funciona por cinco razones. Úsalas como lista de verificación:

1. **Reconocible sin explicación técnica.** Todos en la sala entienden el negocio en un párrafo.
2. **Baja complejidad algorítmica.** Reglas de validación y aritmética simple. Nadie se atasca en la
   lógica y toda la atención queda en Kiro.
3. **Escala naturalmente a infraestructura.** Debe llevar de forma obvia a API + cómputo + datos +
   colas + alarmas.
4. **Tiene un problema distribuido genuino.** En este caso, la idempotencia. Es lo que conecta las dos
   sesiones y lo que hace que la arquitectura tenga sentido en lugar de ser un catálogo de servicios.
5. **Permite defectos plantados con impacto de negocio narrable.** "El cliente no puede retirar su
   plata" pega más que "el test falla".

Si tu caso no cumple el punto 4, la Sesión 2 pierde su columna vertebral. Vale la pena buscar otro.

### Ejemplos por sector

| Sector | Caso posible | Problema distribuido |
|--------|--------------|----------------------|
| Seguros | Cotización y emisión de pólizas | Idempotencia en la emisión: no emitir dos pólizas por un reintento |
| Retail | Reserva de inventario | Concurrencia: dos clientes compran la última unidad |
| Salud | Agendamiento de citas | Doble reserva del mismo cupo |
| Logística | Registro de eventos de envío | Orden y duplicados de eventos |
| Educación | Inscripción a cursos con cupo | Sobrecupo por peticiones simultáneas |
| Servicios públicos | Recaudo y aplicación de pagos | Aplicar el mismo pago dos veces |

Todos comparten la misma forma: reglas de validación, un cálculo simple, y un problema de idempotencia
o concurrencia que se resuelve en la capa de datos.

### Qué hay que reescribir

En orden de dependencia:

**1. El código base** (`src/`, 2–3 horas)

```
src/<dominio>/
├── configuracion.js    Tabla de tarifas/reglas. Configuración pura, sin lógica
├── calculos.js         Los cálculos del dominio
├── validaciones.js     Cada función devuelve { valido, motivo? }
└── operaciones.js      Orquesta las validaciones en orden y produce el resultado
```

Mantén el patrón: configuración pura separada, validaciones que devuelven un objeto uniforme, y una
función que las orquesta en orden. Es lo que hace que el Lab 1 funcione: Kiro puede describir el flujo
con precisión y el participante puede verificarlo en 30 segundos.

**2. Los defectos plantados** (30 min)

Necesitas cuatro, con estos perfiles:

| Perfil | Para qué sirve | Ejemplo en este material |
|--------|----------------|--------------------------|
| Error de borde de un carácter | El momento estrella del Lab 1 | `>` en lugar de `>=` |
| Falta de validación de entrada | Discusión sobre dónde valida cada capa | Monto negativo aceptado |
| Supuesto que se rompe en distribuido | **El puente a la Sesión 2** | Identificador basado en la hora del sistema |
| Precisión numérica sutil | Muestra que hay que mirar de cerca | Decimales en una moneda sin centavos |

El tercero no es opcional: es lo que justifica la arquitectura de la Sesión 2.

**3. El handler** (`src/handlers/`, 1 hora)

Adapta `registrarTransaccion.js`. Conserva las dos ideas que el Lab 5 enseña: el handler adapta pero no
decide, y la idempotencia son dos pasos (consultar, y escribir con condición).

**4. La plantilla de infraestructura** (`soluciones/iac/`, 1–2 horas)

Puedes generarla con Kiro usando el mismo prompt del Lab 5, cambiando los recursos. **Válidala con
`cfn-lint` antes de entregarla:** el material pierde credibilidad si la solución de referencia no pasa
la validación que el propio workshop exige.

```bash
uvx cfn-lint soluciones/iac/<plantilla>.yaml
uvx cfn-lint --include-checks I -- soluciones/iac/<plantilla>.yaml
```

**5. Los documentos de referencia** (`soluciones/docs/`, 1 hora)

Genéralos con Kiro a partir del código y la plantilla nuevos, con los mismos prompts de los labs. Es
el mejor uso posible del workshop: preparar el material del workshop con la herramienta del workshop.

**6. Los enunciados de los labs** (1 hora)

Solo los prompts y los ejemplos concretos. La estructura pedagógica no se toca.

**7. El reto del Lab 7** (30 min)

Necesita: una funcionalidad nueva con tres entregables, que toque el archivo protegido por el
guardarraíl, y que requiera un cambio en la infraestructura (típicamente un índice para una consulta
nueva).

---

## Adaptar por perfil de audiencia

El material está calibrado para un público mixto de desarrollo e infraestructura que no conoce Kiro.
Si tu audiencia es distinta:

| Audiencia | Ajuste |
|-----------|--------|
| **Solo desarrollo** | Amplía los labs 1 y 2, recorta el Lab 6 a la parte del runbook. La Sesión 2 puede enfocarse en tests y refactorización asistida en lugar de IaC |
| **Solo infraestructura** | Recorta el Lab 1 a la mitad y usa ese tiempo en el Lab 5. Agrega la ruta Terraform de la sección Para después |
| **Ya usan asistentes de IA** | Salta la teoría de Vibe/Spec, arranca directo en el Lab 2 y usa el tiempo liberado en las secciones Para después. El Lab 5 completo, con la revisión del rol IAM |
| **Perfil de liderazgo técnico** | Convierte los labs en demos y amplía las discusiones: qué bloquea el pipeline, cómo se audita lo generado, plan de adopción. El Lab 7 pasa a ser una conversación de diseño |
| **Grupo grande (más de 15)** | Parejas obligatorias, reduce a un solo entregable en el Lab 7, y suma un asistente de soporte para desbloquear |

---

## Adaptar la duración

| Duración | Cómo |
|----------|------|
| **1 sesión de 2h** | Labs 1, 2 y 5. Es el recorrido mínimo con sentido: entender, dar contexto, generar infraestructura validada |
| **2 sesiones de 2h** | Lo que está en este repositorio |
| **2 sesiones de 4h** | Incorpora las secciones **Para después** a la ruta guiada, agrega una demo real de sesión Spec como ejercicio, y despliega la plantilla en una cuenta sandbox |
| **3 sesiones de 2h** | Sesión 1 igual; Sesión 2 solo el Lab 5 con la revisión IAM y el costeo; Sesión 3 pipeline, despliegue real y runbook |

> Con 4 horas o más por sesión, el despliegue real en una cuenta sandbox es viable y agrega mucho: ver
> la API responder es distinto a ver la plantilla validar. Requiere cuenta AWS y presupuesto, pero son
> centavos con este volumen.

---

## Datos que hay que verificar en cada edición

Cambian con frecuencia. Confírmalos antes de cada workshop.

| Dato | Dónde verificar | Dónde actualizarlo |
|------|-----------------|--------------------|
| Precios y cuotas de créditos de Kiro | <https://kiro.dev/pricing/> | `GESTION-CREDITOS.md` |
| Modelos disponibles por plan | <https://kiro.dev/pricing/> | `GESTION-CREDITOS.md`, `01-kiro-esencial.md` |
| Créditos de bienvenida y su vigencia | Documentación de Kiro | `GESTION-CREDITOS.md`, `PREPARACION.md` |
| Nombres de los servidores MCP de AWS | <https://awslabs.github.io/mcp/> | `lab4-mcp/README.md`, `soluciones/mcp/mcp.json` |
| Runtime de Lambda vigente | `cfn-lint` te avisa si está obsoleto | Plantilla y todo el material |
| Versiones de las actions de GitHub | Repositorios de las actions | `soluciones/workflows/` |
| Escenario de licenciamiento con AWS | Equipo de cuenta de AWS | `FACILITADOR.md` |

> El runtime de Lambda es el que más rápido se vence: `nodejs20.x` quedó obsoleto en abril de 2026 y
> hubo que actualizar todo el material a Node.js 22. `cfn-lint` lo detecta solo, así que la validación
> de la plantilla es la forma más barata de enterarse.

---

## Verificación antes de entregar

Corre esto sobre el material adaptado. Si algo falla, el cliente lo va a encontrar.

```bash
# El proyecto base funciona
npm install
npm test
npm run lint
node src/index.js

# La plantilla de referencia valida
uvx cfn-lint soluciones/iac/*.yaml
# Con los informativos. Ojo: hace falta el `--` o el `-t`, o cfn-lint
# interpreta la ruta como parte de la lista de --include-checks.
uvx cfn-lint --include-checks I -- soluciones/iac/*.yaml

# Los JSON son válidos
for f in soluciones/hooks/*.json soluciones/mcp/*.json; do python3 -m json.tool "$f" > /dev/null && echo "OK $f"; done

# Los YAML de los workflows son válidos
for f in soluciones/workflows/*.yml; do python3 -c "import yaml,sys; yaml.safe_load(open('$f'))" && echo "OK $f"; done

# El script del guardarraíl responde en ambos casos
echo '{"path":"src/<dominio>/configuracion.js"}' | bash soluciones/hooks/proteger-tarifas.sh
echo '{"path":"src/otro.js"}' | bash soluciones/hooks/proteger-tarifas.sh   # sin salida
```

Y a mano:

- [ ] Los defectos plantados se reproducen con los comandos de `FACILITADOR.md`
- [ ] No quedan `[POR DEFINIR]` sin llenar, salvo los que dependen del cliente
- [ ] Los enlaces internos entre archivos funcionan
- [ ] Los encabezados `**Sesión N · Minuto X–Y**` son consistentes con la tabla de agenda del README
- [ ] El conteo de prompts de cada lab coincide con la columna del README
- [ ] Ningún ejemplo contiene datos reales de clientes

### Lo más importante

**Corre el workshop completo en tu máquina antes de entregarlo.** Es la única forma de saber cuánto
tarda de verdad, y de detectar si algo cambió en Kiro, en los servidores MCP o en los servicios de AWS
desde la última edición.

Un workshop que nadie ejecutó de punta a punta antes de la sesión se atasca en el primer lab.
