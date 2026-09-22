# Video 3D de Herramienta Multi-Tenant

Video promocional de 2 minutos hecho con [Remotion](https://www.remotion.dev) sobre los **componentes reales** de la app (`../src`). Si cambia el diseño de la app, basta con volver a renderizar.

## Uso

```bash
cd video
npm install
npm run studio          # vista previa con línea de tiempo en el navegador
npm run render          # MP4 1080p sin música en out/herramienta-multi-tenant.mp4
npm run render:4k       # MP4 4K sin música
npm run musica          # genera la banda sonora en public/musica/banda-sonora.wav
npm run subtitulos      # genera out/herramienta-multi-tenant.srt
npm run musica:montar   # le pone la música al MP4 ya renderizado, sin volver a renderizar
npm run render:musica   # renderiza desde cero la versión con música
npm run render:subtitulos          # MP4 con los subtítulos incrustados
npm run musica:montar:subtitulos   # le pone la música a esa versión
npm run typecheck
```

En el Studio hay tres composiciones del video entero — `VideoCompleto` (sin música), `VideoConMusica` (antes hay que correr `npm run musica`) y `VideoConSubtitulos` — y la carpeta **Escenas**, con cada escena por separado para iterar más rápido.

## Música

La banda sonora es original y se sintetiza por código en `scripts/banda-sonora.mjs`, sin muestras externas, así que no hay licencias de por medio.

**Sincronización.** Lee `src/tiempos.json`, el mismo archivo del que salen las duraciones del video:

- **Cortes:** en cada corte hay una subida, un silencio de percusión de una corchea y un golpe.
- **Barridos:** acompañan los cambios de plano dentro de cada escena (`barridos`).
- **Campanas:** marcan los momentos clave (`destellos`).

**Estructura.** A 120 BPM, en La menor:

- **Intro:** ambiental, crece hasta el estallido del logo.
- **Multi-tenant:** entra el ritmo.
- **Módulos:** se suman palmas y semicorcheas.
- **Cierre:** resuelve en Do mayor y se apaga con el fundido a negro.

**Si cambias una duración o un momento en `tiempos.json`,** vuelve a correr `npm run musica` (y `musica:montar` o `render:musica`) para que la música siga en sincronía.

**Para usar una pista con licencia de un banco de música,** reemplaza `public/musica/banda-sonora.wav` por ese archivo (o cambia `PISTA` en `src/VideoConMusica.tsx`) y monta o renderiza de nuevo.

`musica:montar` copia el video sin recodificarlo: la imagen queda idéntica bit a bit a la versión sin música.

## Guion

| Escena | Duración | Qué se ve |
|---|---|---|
| Intro | 6 s | El logo se forma con partículas; aparecen el nombre y el lema |
| Multi-tenant | 10 s | Tres organizaciones con distintos módulos contratados; acercamiento al plan en el panel real |
| 01 · Dashboard | 19 s | Panel real, KPI que se levantan contando, módulos en arco, metas y reportes |
| 02 · PQRSDF | 20 s | Bandeja con SLA y canales entrando; un radicado avanza de Recibido a Resuelto; formularios de radicación; buzones y configuración |
| 03 · Envíos Individuales | 20 s | Los mensajes salen del chat; tres teléfonos con plantillas; tipificaciones y bandeja de transferencias; una transferencia que cruza el SLA |
| 04 · Envíos Masivos | 20 s | Campañas; consola en vivo con chorro de partículas; editor de plantillas; informe recorrido y plantilla enviada |
| 05 · Flujos de Trabajo | 20 s | Vista de flujos; un caso recorre la cadena de pasos; mi trabajo del día; ejecuciones y cargas del equipo |
| Cierre | 6 s | Los módulos orbitan el logo; nombre y lema final |

Los textos están en `src/guion.ts`, las duraciones en `src/tiempos.json` y el orden en `src/VideoCompleto.tsx`.

**Ritmo.** Cada módulo dura 20 s y pasa por cuatro paradas: la vista general, la pieza protagonista, una vista adicional del módulo y un cierre con dos subvistas abiertas en V. Para alargar o acortar una escena, cambia sus segundos en `src/tiempos.json` y reparte los cuadros entre esas paradas.

**Planos de detalle.** En cada escena la cámara se acerca a una pieza real para que se pueda leer: los indicadores del panel, el estado del radicado, la transferencia con su SLA, la consola de envío y la cadena de pasos. Se logra con las claves de `escala` y `z` de cada pose, no con recortes.

## Subtítulos

`src/subtitulos.json` tiene las líneas con tiempos relativos a cada escena. Ese texto es a la vez el **guion de locución** para cuando se grabe la voz en off.

- `npm run subtitulos` genera `out/herramienta-multi-tenant.srt` para las plataformas que muestran subtítulos aparte.
- `VideoConSubtitulos` los incrusta en la imagen, para redes donde se ve sin sonido.

## Estructura

| Ruta | Qué contiene |
|---|---|
| `src/guion.ts` | Capítulos y todos los textos en pantalla |
| `src/tiempos.json` | Duración de cada escena y momentos que sigue la música |
| `src/subtitulos.json` | Subtítulos y guion de locución |
| `src/marca.ts` | Nombre, colores, color de cada capítulo y logo |
| `src/VideoCompleto.tsx` | Orden de las escenas |
| `src/escenas/` | Una escena por archivo |
| `src/componentes/Escena.tsx` | Marco de cada escena: transición con zoom y destello, viñeta y cambio de nombre |
| `src/componentes/Capitulo.tsx` | Título de módulo con letras que llegan desde el fondo |
| `src/componentes/Espacio.tsx` | Fondo 3D con Three.js: estrellas, rejilla y luces |
| `src/componentes/LogoParticulas.tsx` | Logo que se forma con partículas |
| `src/componentes/ChorroParticulas.tsx` | Mensajes disparados hacia la cámara |
| `src/componentes/Escenario3D.tsx` | Escenario 3D en CSS para poner pantallas y tarjetas reales en el espacio |
| `src/componentes/MarcoApp.tsx` | Barra lateral y encabezado reales alrededor de un módulo |
| `src/componentes/Lamina.tsx` | Una subvista suelta en el espacio, sin barra lateral |
| `src/componentes/ModalFlotante.tsx` | Un modal real de la app flotando solo |
| `src/componentes/Recorte.tsx` | Muestra una región de una vista real a tamaño legible |
| `src/componentes/TarjetaOrganizacion.tsx` | Una organización con su plan y sus módulos |
| `src/componentes/Subtitulos.tsx` | Subtítulos incrustados |
| `src/componentes/Rotulo.tsx`, `Chip3D.tsx`, `NombreMarca.tsx` | Titulares, etiquetas y nombre animado |
| `src/lib/movimiento.ts` | `tramo`, `claves`, `recorrido`, `contar` y `flotar` para animar por cuadro |
| `src/lib/entorno.ts` | Neutraliza `scrollIntoView` dentro de las escenas |

## Cómo se anima

Todo se calcula a partir del cuadro actual (`useCurrentFrame`), sin estado ni temporizadores. Así cada cuadro sale idéntico en la vista previa y en el MP4.

```tsx
const pose = recorrido(frame, [
  [30, { x: 800, z: -3400, ry: -44, escala: 0.62 }],
  [110, { x: 330, z: -220, ry: -16 }, salida],
])
<Plano3D {...pose}>…</Plano3D>
```

**Claves de `recorrido`.** Cada clave es `[cuadro, pose, curva?]`, y la curva gobierna el tramo que llega a esa clave. Un campo que una pose no define conserva el valor de la pose anterior. A 30 fps, 30 cuadros equivalen a 1 segundo.

**Por qué hay dos tipos de 3D.** Three.js pinta el fondo y las partículas. Las pantallas de la app son DOM real con transformaciones 3D de CSS, así el texto queda nítido y los componentes se ven exactamente como en la app.

**Componentes con estado.** Lo que cambia durante la escena se pasa como props derivadas del cuadro:

- el estado y los seguimientos del radicado
- el avance de la consola de envío
- el paso activo del flujo
- la espera de la transferencia
- `conDatos` en la plantilla

## Agregar una escena

1. Crea `src/escenas/MiEscena.tsx`. Usa `PqrsEscena.tsx` como plantilla: `Escena` con `Espacio` de fondo, `Capitulo`, `Escenario3D` con `Plano3D` y `Rotulo`.
2. Agrega la duración, el capítulo y los textos en `src/guion.ts`.
3. Súmala a la lista `escenas` de `src/VideoCompleto.tsx`; el Studio la registra solo.

## Notas

- **Nombre.** Los componentes de la app dicen "Concept CRM". `Escena` lo reemplaza en el texto renderizado por el nombre de `marca.ts`, y también cambia las iniciales "CC" de los avatares de los teléfonos. La app no cambia.
- **Animaciones de la app.** `estilos.css` desactiva las transiciones y animaciones CSS de la app, porque corren en tiempo real y no por cuadro. El movimiento lo pone el video.
- **Scroll.** No se usa `scrollTop`, porque Chrome no lo refleja en la captura dentro de un contexto 3D. `useDesplazamiento` mueve con `transform` el contenedor que más desborda.
- **Modales.** Los de la app usan `fixed inset-0`. `ModalFlotante` les da un tamaño y `estilos.css` quita el velo oscuro.
- **Envíos Masivos.** Se monta con `simularEnvio={false}` para que su simulación con `setInterval` no avance con el reloj real.
- **Render.** Usa la GPU mediante ANGLE (`remotion.config.ts`). La primera vez descarga Chrome Headless Shell.
- **Licencia.** Remotion es gratis para personas y empresas de hasta 3 empleados. Las empresas más grandes necesitan una [licencia de empresa](https://www.remotion.pro).
