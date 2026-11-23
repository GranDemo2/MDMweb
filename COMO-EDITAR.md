# Cómo editar tu web — Miguel De Mora · Filmmaker

Tu web es **tuya y fácil de tocar**: no hay código raro, solo bloques que puedes
copiar, borrar o cambiar. **Todo el contenido se ve sin JavaScript**; el
movimiento (la marca MDM de fondo, el resplandor azul que te sigue, el pulso
que viaja y el polvo de película) es una mejora que se añade sola cuando hay
JavaScript disponible. El **grano de vídeo ya no está**: quedó eliminado a
pedido.

## 0 · Páginas que tienes
| Archivo | Qué es |
|---|---|
| `index.html` | Portada: logo, "Filmmaker", menú de 3 enlaces y tus proyectos. |
| `contacto.html` | Tarjeta (email, teléfono, WhatsApp) + 2 códigos QR. |
| `studio.html` | Cabecera de estudio + tus servicios (filas alternas). |
| `sobre-mi.html` | Tu foto (cuando la tengas) + unas líneas sobre ti. |
| `legal.html` | Aviso legal: titular, NIF, domicilio, email, teléfono y alojamiento. |
| `styles.css` | Colores, medidas, tipografía y el aspecto del movimiento. |
| `app.js` | Añade el movimiento (ver sección 6). |
| `plantilla-pagina/` | Plantilla para futuras páginas. |

---

## Portada (`index.html`)

### Cambiar el GIF de un proyecto
1. Guarda tu GIF (o imagen) en **`assets/thumbs/`** con nombre corto y sin
   espacios, p. ej. `mi-reel.gif`.
2. Busca el bloque de ese proyecto (comentario `<!-- 1 -->`, `<!-- 2 -->` …).
3. Cambia el `src` del `<img>`:
   `<img src="assets/thumbs/mi-reel.gif" alt="Nombre de tu proyecto" />`
4. Cambia el texto del `<span class="cap">` por el título que quieras.

### Cambiar el enlace de un proyecto
En el mismo bloque, cambia el `href` del `<a class="tile">` por tu vídeo de
YouTube:
`<a class="tile" href="https://www.youtube.com/watch?v=TU_VIDEO" target="_blank" rel="noopener">`

> Consejo: deja el vídeo en YouTube y enlázalo; no subas el vídeo a la web.
> Así queda ligera.

### Añadir / quitar un proyecto
- **Añadir:** copia un bloque entero `<a class="tile">…</a>`, pégalo debajo
  del último, cambia `src`, `alt`, título (`cap`) y `href`. Ponle
  `<!-- 7 -->` para no perderte.
- **Quitar:** borra el bloque entero (de `<a class="tile"` hasta `</a>`).

### Tu canal de YouTube (pie de página)
En cada página, busca el botón `yt` del pie (`<footer>`) y cambia su `href`
por tu canal: `<a class="yt" href="https://www.youtube.com/@TuCanal" …>`.
(Apárcele en todas las páginas si quieres que sea el mismo en todas.)

---

## Contacto (`contacto.html`)

- **Email / Teléfono / WhatsApp:** en la tarjeta (`.card-back`), cada línea
  es un enlace: cambia el texto y el `href` (`mailto:…`, `tel:…`,
  `https://wa.me/34641208963`). Los valores actuales salen de tu tarjeta.
- **Códigos QR:** en la `.qr-panel`, cada `.qr` tiene una imagen
  (`assets/qr-linktree.png` y `assets/qr-whatsapp.png`) y un `href`.
  - **LinkTree:** verificado, abre tu perfil.
  - **WhatsApp:** la imagen es la que llevas en la tarjeta (no se pudo leer
    con máquina). **Escanéala una vez** para confirmar a dónde lleva; si no
    fuera `https://wa.me/34641208963`, cambia ese `href`.
- Para cambiar una imagen QR: sustituye el archivo en `assets/` (misma
  medida más o menos) o pon un `src` nuevo.

## Studio (`studio.html`)

- **Foto del estudio:** el `<img>` dentro de `.studio-head`. Pon tu foto en
  `assets/` y cambia el `src` (hoy es un marcador `studio.png`).
- **Servicios:** cada fila es una `.svc` con una foto (`.svc-photo`, hoy un
  recuadro punteado con un "+") y un texto (número, `h2`, descripción).
  - Para poner una **foto real**: añade un `<img>` dentro de `.svc-photo` y
    borra el `<span class="plus">`.
  - **Añadir un servicio:** copia una `.svc` y cambia número/título/texto.
  - **Quitar:** borra la `.svc` entera.
- Las filas **alternas** (foto izquierda/derecha) las hace solas `styles.css`.

## Sobre mí (`sobre-mi.html`)

- **Foto:** dentro de `.about-photo` hay hoy un recuadro punteado con un "+"
  (`.plus`). Cuando tengas la foto: añádele un `<img>` (guárdala en `assets/`)
  y borra el `<span class="plus">`.
- **Texto:** cambia el `h2` ("Hola, soy Miguel") y el párrafo. Borra la línea
  `<p class="soon">` cuando el texto sea definitivo.

---

## 5 · Colores, logo y tipografía
- **Colores:** en `styles.css`, cambia los valores de `:root` (fondo `--bg`,
  azul `--accent`, texto `--ink` …).
- **Logo (grande, en portada y cabeceras):** `assets/mdm-logo.png`.
- **Monograma / favicon:** `assets/mdm-marca.png` (la "MDM").
- **Marca MDM de fondo (marca de agua):** la imagen `assets/mdm-marca.png`
  (la "MDM" única, una sola vez y en grande) que se ve enorme y tenue detrás
  de todo. En `styles.css`, `.mdm-mark img` controla su **tamaño** (`width`)
  y su **intensidad** (`opacity`: hoy `.09`; súbelo para que se vea más,
  bájalo para que sea más sutil).
- **Tipo de letra:** Montserrat. Cámbiala en la línea de `fonts.googleapis.com`
  de cada `*.html` y en `body { font-family: … }` de `styles.css`.
- **La palabra "Filmmaker" (portada):** cambia el `<span class="word">` de
  `index.html`. En las otras páginas, la palabra de la cabecera es la misma
  clase `.word` de `.subhead`.

## 6 · Estética y movimiento (estilo de filmmaker)
El movimiento está en **`app.js`** (lo que hace) y **`styles.css`** (cómo se
ve). Piezas:

- **Marca MDM de fondo:** fija, no se mueve (ver sección 5, `.mdm-mark`).
- **Resplandor que te sigue (cursor/dedo):** en `styles.css`, `.bg__follow`
  es el color/brillo. En `app.js`, la opacidad mínima es `.22` y sube con tu
  movimiento (máximo `.72`).
- **El pulso que viaja (aparece, brilla, se apaga y reaparece en otro punto):**
  `newPulseCycle()` decide **dónde** y **cuánto dura** cada parada (6,5 a
  10,5 s); `stepPulse()` decide **qué tan fuerte** (opacidad `0.10+env*0.5`).
  Sin JavaScript, `styles.css` lo hace seguir una ruta fija
  (`@keyframes pulse-drift`).
- **Polvo de película (partículas):** solo existe con JavaScript.
  - **Cae de arriba hacia abajo**, cada mota con **forma y velocidad
    distintas** y se mece a izquierda y derecha.
  - **Se enfoca al cruzar una franja diagonal:** cada mota va casi difusa
    hasta que cruza una banda diagonal que atraviesa la página (ahí se ve
    nítida) y vuelve a difuminarse al salir. La banda la fija `setBand()`,
    el enfoque de cada mota lo calcula `focusAt()`.
  - **Más sutil:** menos motas, más lentas y más tenues que antes.
  - **Reacciona al cursor:** mueve el cursor **hacia arriba** y el polvo se
    queda flotando (casi sin caer); **hacia abajo** y cae más rápido.
    Está en `drawDust()` (el `factor` calculado a partir de `cursorVy`).
  - Cuántas motas: `dustCount()` (base `área/22000`, entre 22 y 70, ×1,3).
    Tamaño y velocidad base: `newMota()`.
  - **Destello azul al hacer clic** en el menú (Contacto / Studio / Sobre mí):
    `spawnBurst()` y `drawBursts()`. Color azul de marca `#168bff`; sale en el
    punto del clic y luego navega a la página (tras ~0,5 s).
- **Cuánto "crecen" los GIFs al acercarse:** en `app.js`, el `0.03` (escala
  máxima) y `300` (alcance en píxeles).
- **Grano de vídeo:** **eliminado** (no hay `.grain` ni animación de grano).

> Si en tu sistema tienes **\"Reducir movimiento\"**, la web se pone quieta
> automáticamente (el pulso queda fijo, el polvo en una sola imagen y al hacer
> clic en el menú **no** hay destello: navega al instante). Es respetuosa por
> diseño.

## 7 · Abrir una página nueva
1. Copia la carpeta **`plantilla-pagina/`** y renómbrala, p. ej. **`trabajos/`**.
2. Cambia el `<title>`, la `<meta description>` y la palabra de la cabecera
   (`.word`).
3. Dentro de `<main>`, pon tu contenido (copia bloques `.svc`, `.about`,
   `.qr` u otros de las páginas actuales).
4. Si prefieres páginas sueltas (sin carpeta), copia una página actual
   (p. ej. `sobre-mi.html`), renómbrala y cambia el texto.

## 8 · Archivos que importan
| Archivo / carpeta | Qué es |
|---|---|
| `index.html` · `contacto.html` · `studio.html` · `sobre-mi.html` · `legal.html` | Las 5 páginas (el enlace "Aviso legal" está en el pie de todas). |
| `styles.css` | Colores, medidas, tipografía y aspecto del movimiento. |
| `app.js` | Marca de fondo, resplandor, pulso, polvo (con reacción al cursor), destello al clic. |
| `assets/mdm-logo.png` | Tu logo (portada y cabeceras). |
| `assets/mdm-marca.png` | Tu monograma (favicon) y la marca de agua de fondo. |
| `assets/mdm-patron-agua.png` | Ya no se usa (la marca de agua ahora es `mdm-marca.png`); puedes borrarlo. |
| `assets/qr-linktree.png` · `assets/qr-whatsapp.png` | Los 2 códigos QR de contacto. |
| `assets/studio.png` | Marcador de la cabecera de studio (sustitúyelo por tu foto). |
| `assets/thumbs/` | Aquí van tus GIFs / imágenes de proyectos. |
| `plantilla-pagina/` | Plantilla para futuras páginas. |
