# Imágenes de referencia

Esta carpeta guarda las capturas de pantalla que acompañan las guías. El material funciona sin ellas
—los textos son autosuficientes— pero las imágenes ayudan mucho a quien nunca instaló estas
herramientas.

## Por qué están como marcadores

Las capturas de pantalla de Kiro, AWS y las terminales cambian con cada versión, y dependen del
sistema operativo de cada persona. Por eso el material las deja señaladas como **marcadores de
posición** en lugar de incluir imágenes que quedarían desactualizadas.

En las guías verás bloques como este:

```markdown
> ![Descripción de la imagen](../assets/instalacion-04-login-kiro.png)
> *(Imagen de referencia: ... La agrega el facilitador.)*
```

Mientras el archivo `.png` no exista, GitHub muestra el texto alternativo (la descripción entre
corchetes). No se rompe nada.

## Capturas sugeridas

Si vas a preparar el material para una edición, estas son las capturas que más ayudan. Tómalas una
vez y guárdalas aquí con el nombre indicado.

| Archivo | Qué capturar |
|---------|--------------|
| `instalacion-01-powershell.png` | Menú de inicio de Windows con PowerShell |
| `instalacion-02-terminal-mac.png` | Spotlight de Mac buscando "Terminal" |
| `instalacion-03-descarga-kiro.png` | Botón de descarga en kiro.dev |
| `instalacion-04-login-kiro.png` | Pantalla de inicio de sesión de Kiro |
| `instalacion-05-git-version.png` | Terminal mostrando `git --version` |
| `instalacion-06-nodejs.png` | Página de nodejs.org señalando el botón LTS |
| `instalacion-07-npm-test.png` | Terminal con los tests en verde (`npm test`) |

## Recomendaciones

- Formato **PNG**, ancho de 1000 a 1400 píxeles (legible sin ser pesado).
- Oculta cualquier dato personal antes de capturar: correos, nombres de usuario reales, tokens.
- Nombres de archivo en minúsculas, con guiones, como en la tabla de arriba.
- Si tomas capturas de Kiro o de la consola de AWS, verifica que no aparezcan datos de clientes.
