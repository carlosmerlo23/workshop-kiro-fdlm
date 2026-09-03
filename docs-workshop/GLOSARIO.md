# Glosario sin miedo

Toda palabra técnica que aparece en el workshop, explicada en lenguaje simple. Si lees algo que no
entiendes, búscalo aquí. Y si no está, pregúntale al facilitador: probablemente falta agregarlo.

---

## Palabras básicas (empieza por aquí)

Estas son las que más asustan al principio y las más fáciles de entender.

| Palabra | En palabras simples | Una analogía |
|---------|---------------------|--------------|
| **Terminal** (o consola) | Una ventana donde le escribes instrucciones al computador en texto, en vez de usar el mouse | Como enviarle una nota escrita al computador en lugar de señalarle las cosas |
| **Comando** | Una instrucción que escribes en la terminal | Una orden concreta: "descarga esto", "revisa aquello" |
| **Código** | Las instrucciones escritas que hacen funcionar un programa | La receta que sigue el computador para preparar el plato |
| **Repositorio** (o "repo") | Una carpeta especial con todo el material de un proyecto, que guarda su historia de cambios | Un archivador que recuerda cada versión de cada documento |
| **Clonar** | Descargar una copia de un repositorio a tu computador | Sacar una fotocopia de todo el archivador para trabajar con ella |
| **GitHub** | Un sitio web donde se guardan y comparten repositorios | Como Google Drive, pero para proyectos de software |
| **Git** | La herramienta que lleva el control de las versiones de un proyecto | El asistente que anota quién cambió qué y cuándo |
| **La nube** | Computadores de alguien más (en este caso, de AWS) que usas por internet | Como guardar fotos en internet en vez de en tu celular |
| **AWS** | Amazon Web Services: la nube de Amazon, una de las más usadas del mundo | El proveedor de "los computadores de internet" |
| **Instalar** | Poner un programa en tu computador para poder usarlo | Como bajar una app al celular |
| **IA generativa** | Inteligencia artificial que crea cosas nuevas (texto, código) a partir de lo que le pides | Un asistente muy rápido que entiende instrucciones en lenguaje normal |
| **Prompt** | El mensaje o instrucción que le escribes a la IA | La pregunta o el pedido que le haces al asistente |
| **Verificar** | Comprobar que algo quedó bien hecho | Revisar la tarea antes de entregarla |

---

## Palabras del mundo del software

Aparecen en las sesiones. No necesitas dominarlas, solo reconocerlas.

| Palabra | En palabras simples |
|---------|---------------------|
| **Desarrollo** | El trabajo de construir software escribiendo código |
| **Infraestructura** | Los computadores, redes y servicios (normalmente en la nube) donde vive y funciona un programa |
| **Producción** | El entorno "de verdad", el que usan los clientes reales. Distinto de las pruebas |
| **Desplegar** | Poner un programa a funcionar en su entorno real, en la nube |
| **Monitoreo** | Vigilar que un servicio esté funcionando bien, y avisar si algo falla |
| **Pipeline** | Una línea de montaje automática: cada vez que hay un cambio, se revisa y se publica solo |
| **CI/CD** | El nombre técnico de esa línea de montaje automática (integración y entrega continuas) |
| **Test** (o prueba) | Un pequeño programa que revisa que otro programa funcione correctamente |
| **Bug** (o defecto) | Un error en el código que hace que algo funcione mal |
| **Documentación** | Los textos que explican cómo funciona un sistema y cómo usarlo |
| **Runbook** | Un manual de "qué hacer si algo falla", paso a paso, para el equipo de operaciones |
| **Time-to-market (GTM)** | El tiempo que pasa desde que se tiene una idea hasta que llega al cliente. Menos es mejor |

---

## Términos de Kiro

| Término | Qué es |
|---------|--------|
| **Sesión Vibe** | Chat conversacional. Ideal para preguntas, exploración y generación puntual de código. Es el modo que usamos en todos los labs. |
| **Sesión Spec** | Flujo estructurado en tres etapas: requisitos → diseño → tareas. Kiro documenta el plan y luego ejecuta tarea por tarea. Para features complejas. Consume más créditos. |
| **Modo Autopilot** | Kiro aplica los cambios de forma autónoma. Puedes revisar, revertir o interrumpir en cualquier momento. Es el modo por defecto. |
| **Modo Supervisado** | Kiro pide aprobación después de cada turno con ediciones, presentando los cambios como bloques individuales para aceptar o rechazar. |
| **Steering file** | Archivo Markdown en `.kiro/steering/` con instrucciones persistentes que Kiro aplica en todas las interacciones del proyecto. Ahí viven los estándares del equipo. |
| **Inclusión de steering** | Cómo se activa un steering file: `always` (por defecto), `fileMatch` (cuando se abre cierto tipo de archivo), `manual` (al invocarlo con `#`), o `auto` (cuando el pedido coincide con su descripción). |
| **Hook** | Automatización en `.kiro/hooks/<id>.json` que se dispara ante un evento del IDE (guardar archivo, crear archivo, terminar una tarea, etc.). |
| **Hook de comando** | Hook cuya acción es ejecutar un comando de shell. **No consume créditos.** |
| **Hook de agente** | Hook cuya acción es inyectar un prompt al agente. **Consume créditos cada vez que se dispara.** |
| **Trigger** | El evento que dispara un hook: `PostFileSave`, `PostFileCreate`, `PreToolUse`, `PostToolUse`, `SessionStart`, `Stop`, `UserPromptSubmit`, `PreTaskExec`, `PostTaskExec`, `PostFileDelete`. |
| **Matcher** | Expresión regular que filtra cuándo aplica un hook. Sobre el nombre de la herramienta en `PreToolUse`/`PostToolUse`, sobre la ruta del archivo en los triggers de archivo. |
| **MCP** | Model Context Protocol. Estándar que permite conectar Kiro a servidores externos que le aportan herramientas y datos (documentación de AWS, validación de plantillas, precios, bases de datos). |
| **`mcp.json`** | Archivo de configuración de servidores MCP. A nivel de proyecto en `.kiro/settings/mcp.json`, a nivel de usuario en `~/.kiro/settings/mcp.json`. |
| **Contexto con `#`** | Forma de inyectar contexto explícito en el chat: `#File`, `#Folder`, `#Problems`, `#Terminal`, `#Git Diff`. |
| **Crédito** | Unidad de consumo de Kiro. Se cobra fraccionariamente, en incrementos de 0,01. Ver [GESTION-CREDITOS.md](./GESTION-CREDITOS.md). |
| **Agente `Auto`** | Agente por defecto que combina varios modelos y técnicas de optimización para balancear calidad, latencia y costo. |
| **AWS Builder ID** | Identidad gratuita de AWS. Sirve para iniciar sesión en Kiro y acceder al plan Free. |

---

## Términos del dominio: corresponsalía bancaria

| Término | Qué es |
|---------|--------|
| **Corresponsal bancario** | Comercio aliado habilitado para prestar servicios financieros en nombre de la entidad, a cambio de una comisión por transacción. También llamado punto corresponsal o corresponsal no bancario. |
| **Corresponsalía bancaria** | El modelo completo de extensión de servicios financieros a través de comercios aliados. |
| **Cupo disponible** | Efectivo que el corresponsal tiene en caja para atender retiros. Si no alcanza, el retiro se rechaza. |
| **Comisión** | Lo que gana el corresponsal por cada transacción. En el caso: fija, o fija más un porcentaje del monto. |
| **Liquidación** | Proceso periódico de pago acumulado de comisiones al corresponsal. |
| **Consecutivo** | Identificador único de la transacción que aparece en el comprobante. |
| **Comprobante** | Soporte que se imprime y entrega al cliente por cada transacción. Obligación operativa y regulatoria. |
| **Recaudo** | Pago de facturas y convenios (servicios públicos, obligaciones con terceros) en el punto. |
| **Pago de crédito** | Abono a la cuota de un microcrédito. |
| **Inclusión financiera** | Objetivo de acercar servicios financieros a poblaciones sin acceso a oficinas bancarias. Es la razón de existir de la red de corresponsales. |

---

## Términos de infraestructura y DevOps

| Término | Qué es |
|---------|--------|
| **IaC** | Infrastructure as Code. Definir la infraestructura en archivos versionados en lugar de crearla a mano en la consola. |
| **CloudFormation** | Servicio de IaC nativo de AWS. Plantillas en YAML o JSON. Es lo que generamos en el Lab 5. |
| **Stack** | Conjunto de recursos de AWS creados y administrados como una unidad por una plantilla de CloudFormation. |
| **`cfn-lint`** | Validador de sintaxis y esquema de plantillas CloudFormation. Verifica que los tipos de recurso y sus propiedades existan y sean válidos. |
| **`cfn-guard`** | Validador de políticas. Verifica que la plantilla cumpla reglas de seguridad y cumplimiento (cifrado, acceso público, etc.). |
| **Change set** | Vista previa de los cambios que CloudFormation aplicaría antes de ejecutarlos. Permite validar antes de desplegar. |
| **Idempotencia** | Propiedad por la cual repetir la misma operación produce el mismo resultado. Crítica cuando el cliente reintenta por conectividad intermitente. |
| **DLQ** | Dead Letter Queue. Cola donde caen los mensajes que no se pudieron procesar, para no perderlos. |
| **Least privilege** | Principio de otorgar solo los permisos estrictamente necesarios. |
| **CI / CD** | Integración continua (validar cada cambio automáticamente) y entrega continua (desplegar de forma automatizada y repetible). |
| **GitHub Actions** | Plataforma de CI/CD integrada en GitHub. Los workflows son archivos YAML en `.github/workflows/`. |
| **Runbook** | Documento operativo con los procedimientos para atender incidentes y tareas rutinarias de un servicio. |
| **Observabilidad** | Capacidad de entender el estado interno de un sistema desde sus salidas: logs, métricas y trazas. |

---

## Siguiente

- ¿Listo para instalar? [Guía de instalación paso a paso](./INSTALACION.md)
- ¿Ya usas Kiro? [Cheatsheet de Kiro](./CHEATSHEET-KIRO.md)
