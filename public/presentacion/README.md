# ConceptOS · presentación interactiva

Presentación del ecosistema de ConceptOS: los ocho módulos, con los cinco del MVP en cian y los tres proyectados en verde. Al abrir un módulo se despliegan sus funciones y se encienden sus conexiones en el mapa.

HTML, CSS y JavaScript sin compilación. **Three.js** para el espacio 3D del fondo y **GSAP** para las animaciones; las dos librerías están dentro de `vendor/`, así que funciona sin internet (solo las tipografías vienen de Google Fonts, y si no hay red caen a la fuente del sistema).

## Dónde vive y cómo se abre

Los archivos están en `public/presentacion/`, así que Vite los copia tal cual a `dist/presentacion/` y quedan publicados junto a la aplicación.

| Entorno | Dirección |
|---|---|
| Local | `npm run dev` → http://localhost:8443/presentacion |
| Desplegado | `/presentacion` del mismo dominio de la app |

**No se abre con doble clic:** usa módulos de JavaScript y el navegador los bloquea en `file://`. Hay que servirla, y para eso basta el servidor de la app.

**Sobre la ruta sin barra final:** cuando el servidor responde con la aplicación de React en `/presentacion` (pasa en desarrollo y en cualquier despliegue que mande todo al SPA), `src/main.tsx` redirige a `/presentacion/index.html` antes de montar nada. Por eso la ruta funciona en los dos entornos.

## Cómo se maneja

| Tecla | Qué hace |
|---|---|
| ← → ↑ ↓, barra espaciadora | Cambiar de sección |
| 1 a 8 | Abrir ese módulo en el mapa |
| Esc | Volver al resumen del ecosistema |
| F | Pantalla completa |

También funciona con la rueda del mouse, los puntos de la derecha y el toque en pantallas táctiles.

## Las cuatro secciones

1. **Portada.** Nombre, promesa y el conteo de módulos por hito.
2. **Ecosistema.** El mapa: núcleo al centro, los cinco del MVP en el anillo interior y los tres proyectados en la órbita exterior. Cada módulo es un orbe con su número y su nombre en una pastilla, siempre orientada hacia afuera del círculo para que ninguna tape a otra. Al hacer clic en uno, la ficha de la derecha muestra qué permite hacer y con qué se conecta, el mapa atenúa lo demás y un pulso recorre los hilos encendidos. Los filtros de arriba aíslan producción o proyectado.
3. **Hitos.** Los dos carriles, Hito 1 y Hito 2, con una línea por módulo. Cualquier tarjeta lleva al mapa con ese módulo abierto.
4. **Cierre.** El mensaje de plataforma única y los botones para volver.

En pantallas angostas el mapa se reemplaza por una lista de tarjetas con el mismo comportamiento.

## Qué editar

| Archivo | Para qué |
|---|---|
| `js/datos.js` | Módulos, funciones, textos de conexión y a qué otros módulos apunta cada uno. **Es el archivo del discurso.** |
| `index.html` | Textos de portada, hitos y cierre |
| `css/estilos.css` | Paleta (`:root`), tipografía y tamaños del mapa |
| `js/mapa.js` | Geometría de la constelación: `RADIO_INTERIOR`, `RADIO_EXTERIOR`, los ángulos y el lado hacia donde sale cada pastilla |
| `js/fondo.js` | Escena 3D y el encuadre de cámara de cada sección (`ENCUADRES`) |
| `js/presentacion.js` | Navegación, teclas y pantalla completa |

**Agregar un módulo** es añadir su entrada en `MODULOS` (`js/datos.js`) con su icono en `ICONOS`; el mapa recalcula posiciones y la lista se arma sola. Si entra un módulo nuevo al MVP, el anillo interior se reparte entre los que tengan `hito: 1`.

## Notas

- Los textos del MVP describen lo que la aplicación ya hace; los del Hito 2 son alcance proyectado y van rotulados como tal.
- El alcance de **Gestión Comercial** todavía está por definir: lo que aparece sale del documento de servicios, bajo el nombre acordado.
- Si el equipo del sistema pidió menos movimiento (`prefers-reduced-motion`), el fondo 3D se dibuja quieto y se apagan las animaciones.
- La geometría del mapa se recalcula en píxeles cada vez que cambia el tamaño, así los hilos del SVG y los nodos del DOM caen siempre en el mismo punto.
- `vendor/` pesa 2 MB sin comprimir, casi todo Three.js. El servidor lo entrega comprimido, así que al navegador llegan unos 400 KB.
