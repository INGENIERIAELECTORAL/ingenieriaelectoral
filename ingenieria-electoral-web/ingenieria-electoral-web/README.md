# Ingeniería Electoral Consultores · Sitio web

Sitio estático en HTML, CSS y JavaScript, sin frameworks ni proceso de compilación. Funciona abriendo `index.html` en el navegador y está preparado para publicarse con GitHub Pages.

## Estructura

```
index.html                  Inicio: portada, evolución, servicios, sistemas, quiénes somos,
                            historia, equipo, editoriales, participaciones, prensa, FAQ, contacto
sistemas.html               Demostración interactiva de los dos sistemas y tabla de funciones
soluciones/index.html       Resumen de soluciones, servicios, implementación y resguardo
soluciones/mineria-de-datos.html
soluciones/operacion-territorial.html
soluciones/defensa-del-voto.html
assets/css/                 fonts.css (Outfit local), site.css (sitio), software.css (demostración)
assets/js/                  site.js (navegación, línea del tiempo, biografías, carrusel, FAQ)
                            software.js (demostración con datos sintéticos)
assets/fonts/               Outfit 400–800 (TTF) y licencia OFL
assets/img/                 logotipos, fotografías WebP, pantallas SVG de los sistemas
favicon.svg                 Check en rombo derivado del logotipo
.nojekyll                   Evita el procesado Jekyll en GitHub Pages
```

Todas las rutas son relativas: el sitio funciona en local (`file://`), en la raíz de un dominio y dentro de un subdirectorio como `usuario.github.io/repositorio/`.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub (por ejemplo `ingenieria-electoral-web`) y sube el contenido de esta carpeta a la rama `main`, con `index.html` en la raíz.
2. En el repositorio, abre **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**; selecciona la rama `main` y la carpeta `/ (root)`. Guarda.
4. En uno o dos minutos la web quedará disponible en `https://<usuario>.github.io/<repositorio>/`. La URL aparece en la misma pantalla de Pages.
5. Para un dominio propio, añade el dominio en **Custom domain** y crea en tu proveedor DNS un registro `CNAME` hacia `<usuario>.github.io`. GitHub generará el archivo `CNAME` en el repositorio.

Desde la línea de comandos:

```bash
git init
git add .
git commit -m "Sitio web Ingeniería Electoral Consultores"
git branch -M main
git remote add origin https://github.com/<usuario>/<repositorio>.git
git push -u origin main
```

## Revisión local

Basta con abrir `index.html`. Si prefieres un servidor local:

```bash
python3 -m http.server 8000
```

y visitar `http://localhost:8000/`.

## Notas

- Las pantallas de los sistemas son reproducciones editoriales con datos sintéticos. La demostración de `sistemas.html` es local: no envía información a ningún servicio y se reinicia al recargar.
- El sitio respeta `prefers-reduced-motion`, permite navegación por teclado en menús, pestañas, línea del tiempo, carrusel y diálogos, y no usa recursos externos: fuentes, imágenes y scripts se sirven desde el propio repositorio.
