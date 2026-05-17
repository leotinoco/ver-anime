# Changelog de Anime Fan

## [1.5.0] - 2026-05-17

### Añadido

- 🔒 **Cambio de Contraseña desde Panel Admin**: Los administradores pueden restablecer la contraseña de cualquier usuario desde `/admin` con un botón de candado en cada fila de la tabla.
- 🛡️ **Validación de Contraseña Duplicada**: Se verifica que la nueva contraseña sea diferente a la actual usando `verifyPassword` contra el hash existente.
- 📋 **Log de Auditoría Estructurado**: Cada cambio de contraseña queda registrado con adminId, adminUsername, targetUserId y timestamp en formato JSON.

### Corregido

- 🔐 **Prevención de Auto-Cambio**: Se bloquea que un admin use la ruta de admin para cambiar su propia contraseña (403 Forbidden).
- 🧹 **Ruido en Logs de Producción**: Se eliminó el `console.log` de sesiones inválidas en `decrypt()` que generaba ruido innecesario y podía usarse para fingerprinting.

## [1.4.1] - 2026-05-17

### Corregido

- 📱 **Área Clicable en Miniaturas (Home, Búsqueda, Categorías, Top)**: Se resolvió el problema donde las miniaturas de animes solo respondían al toque en una zona reducida. Ahora toda el área de la imagen es 100% clicable en todas las páginas.
- 🏷️ **Badge de Rating Bloqueando Toques**: En la página "Mejor Calificados", el badge de rating en la esquina superior derecha de cada tarjeta bloqueaba los toques en esa zona. Se añadió `pointer-events-none` para permitir que el toque pase a la tarjeta.
- 🎢 **Overlays del Carrusel Hero Interceptando Toques**: Los overlays de gradiente y contenido en el carrusel de recomendaciones no tenían `pointer-events-none`, lo que causaba conflictos con el sistema de arrastre de framer-motion.
- 🎮 **Sensor de Arrastre en Favoritos Demasiado Sensible**: El umbral de activación del drag-and-drop en la página de favoritos era de solo 8px, capturando toques rápidos como intentos de arrastre. Se aumentó a 12px para mejor distinción entre tap y drag.
- ✨ **Feedback Táctil en Tarjetas**: Se añadió `whileTap={{ scale: 0.98 }}` a las tarjetas para proporcionar feedback visual inmediato al tocar en móvil.

## [1.4.0] - 2026-05-17

### Añadido

- ⚡ **Actualización Optimista de UI en Progreso de Episodios**: Al marcar un episodio como "Visto", el badge se actualiza instantáneamente (<16ms) sin esperar la respuesta del servidor, con rollback automático en caso de error.
- 🧠 **Estado Reactivo en EpisodeWatcher**: Se reemplazó el `useRef` por `useState` para que el badge del reproductor se re-renderice automáticamente al cambiar el estado (antes requería recarga manual).

### Corregido

- 🐛 **Feedback Visual Nulo en Reproductor**: El componente `EpisodeWatcher` no reflejaba cambios de estado hasta refrescar la página porque usaba `useRef` (sin re-render) en lugar de estado React. Ahora los cambios manuales y automáticos se reflejan al instante.
- 🧹 **Código Muerto Eliminado**: Se eliminó el import no utilizado de `useOptimistic` en `EpisodeStatusBadge.tsx`.
- 🔄 **Early Return Removido**: Se eliminó el `return` prematuro en el effect cuando `initialStatus === "visto"` que impedía registrar event listeners de cleanup.

## [1.3.9] - 2026-05-14

### Corregido

- 📱 **Interacción Táctil en Móvil**: Se solucionó el problema donde las miniaturas de animes no respondían correctamente al toque en dispositivos móviles. Ahora toda el área es clicable.
- 🎢 **Carrusel de Recomendaciones**: Se corrigió el conflicto entre el arrastre (swipe) y el toque (tap) en móviles.
- ⚡ **Respuesta Táctil**: Se eliminó el retraso de 300ms en clics táctiles para una navegación más fluida.

## [1.3.8] - 2026-05-13

### Refactorización

- Limpieza profunda del proyecto para resolver advertencias de ESLint y mejorar la estabilidad.
- Eliminación de variables e imports no utilizados en múltiples componentes y páginas.
- Corrección de bloques catch con variables no usadas.
- Solución de problemas de accesibilidad (a11y) en la página de perfil (botones de avatar).
- Corrección de entidades no escapadas (comillas) en `buscar/page.tsx` y `legal/page.tsx`.
- Cambio de `let` a `const` en variables que no se reasignan.

## [1.3.7] - 2026-05-06

### Añadido

- 🔔 **Notificaciones en Móvil**: El ícono de campana de notificaciones ahora es visible en la barra de navegación en todos los tamaños de pantalla (antes estaba oculto en móvil).
- 📱 **Panel de notificaciones responsive**: El panel desplegable se adapta al ancho de la pantalla en dispositivos móviles (`calc(100vw - 2rem)`) evitando desbordamientos visuales.
- 📋 **Acceso rápido en menú móvil**: Se añadió un enlace a "Notificaciones" dentro del menú hamburguesa para facilitar el acceso desde dispositivos móviles.

### Corregido

- 🔐 **Persistencia de sesión**: Se corrige el bug que pedía credenciales de nuevo al navegar a páginas protegidas (`/favoritos`, `/notificaciones`). La cookie de sesión ahora se configura correctamente usando `NODE_ENV === 'production'` en lugar de inspeccionar la URL interna del proxy de Vercel, que era poco fiable.
- 🔗 **Redirect post-login**: Las páginas protegidas ahora redirigen a `/login?redirect=/ruta` para que tras el inicio de sesión el usuario regrese directamente a donde intentaba ir.


## [1.3.5] - 2026-04-20
### Corregido
- 🐛 **Slider Hero**: Corrección de desborde horizontal en móviles mediante la ocultación de botones de navegación y optimización de responsividad.

### Tareas
- 🔧 **Gitignore**: Se agregó la carpeta `.agents` para evitar el rastreo de archivos generados por herramientas de IA.


## [1.3.4] - 2026-04-15
### Corregido
- 🧾 **Creación de listas**: Se restauró el recuadro interactivo para crear nuevas listas desde “Mis Listas”, con validación, manejo de errores y refresco de la vista tras crearla. ([commit 9bc8931](https://github.com/leotinoco/ver-anime/commit/9bc8931))

### Documentación
- 📚 **Documentación sincronizada**: Se actualizan `CHANGELOG.md` y `README.md` para reflejar cambios recientes y el proceso de release.

### Enlaces
- Comparación: [v1.3.3…v1.3.4](https://github.com/leotinoco/ver-anime/compare/v1.3.3...v1.3.4)

## [1.3.3] - 2026-04-15
### Corregido
- 🔐 **Seguridad de autenticación**: Se eliminó el secreto JWT por defecto y ahora `JWT_SECRET` es obligatorio para iniciar la aplicación.
- 🛡️ **Endpoint de tracking protegido**: `POST /api/push/track` ahora exige sesión válida y restringe actualizaciones de métricas al `userId` propietario.
- 🧹 **Hardening de errores en login**: Se redujo la exposición de detalles internos en respuestas de error y logs del flujo de autenticación.
- 👤 **Seed administrativo seguro**: El script de creación de admin ya no usa credenciales por defecto; requiere variables `ADMIN_USERNAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
- 📝 **Prevención de fuga accidental**: Se enmascara la URI de conexión en utilidades temporales de diagnóstico y se ignora `tmp/` en control de versiones.
- 🧩 **Build en Vercel**: Se corrigió el tipado de `bulkWrite` en el endpoint de progreso para evitar fallos de compilación por incompatibilidad de overloads.
- 📦 **Lockfile reproducible**: Se añadió `pnpm-lock.yaml` para fijar resoluciones de dependencias y facilitar auditorías/CI consistentes.

## [1.3.2] - 2026-04-12
### Añadido
- 📱 **Visibilidad Móvil**: Los nombres de los animes y sus etiquetas ahora son siempre visibles en móvil con un degradado inferior, eliminando la dependencia del "hover" inexistente en estos dispositivos.
- ⏭️ **Control de Navegación**: El botón "Siguiente Episodio" se oculta automáticamente en animes "Finalizados" al llegar al último capítulo.
- 📅 **Info de Emisión**: Muestra la fecha del próximo estreno directamente en el reproductor para animes "En Emisión" al alcanzar el episodio más reciente.

### Corregido
- 🔗 **Relleno de Historial**: Al marcar un episodio como "Visto" manualmente, ahora se crean/actualizan automáticamente todos los episodios anteriores como "Vistos", incluso si el usuario nunca los había abierto.


## [1.3.1] - 2026-04-08
### Añadido
- ⏯️ **Reanudación Inteligente**: El botón "Ver Ep." en la página de detalles ahora sugiere automáticamente el menor episodio en estado "Viendo" o el menor "Pendiente", facilitando el seguimiento de series largas.
- 🏷️ **Títulos Claros**: Ahora el número de episodio se incluye explícitamente en el título principal de la página de reproducción (ej. "Anime - Episodio 1").
- 👁️ **Marcado Automático**: Al marcar manualmente un episodio como "Visto", todos los episodios anteriores se actualizan automáticamente al mismo estado con sincronización en tiempo real.

### Corregido
- 🔼 **Menú Anti-Recorte**: La insignia de estado del episodio ahora detecta su posición y se abre hacia arriba si está al final de la lista, evitando que el menú quede oculto.
- 📑 **Nombres Completos**: Los títulos de los animes en la sección de "Mis Listas" ya no se truncan, mostrando el nombre completo en todas las tarjetas.

## [1.3.0] - 2026-04-04
### Añadido
- 🎢 **Hero Carousel Premium v2**: Sistema de bucle infinito (seamless) con auto-avance 1-a-1 cada 3 segundos y temporizador de alta precisión.
- 🖼️ **Póster Cinemático — Bakemono no Ko**: Regeneración del activo visual en alta resolución con títulos en japonés, inglés y español, además de créditos técnicos integrados.
- ⚡ **Optimización AVIF**: Migración total de activos del Hero a formato `.avif`, reduciendo el peso del carrusel de ~25MB a ~1.4MB para una carga ultrarrápida.
- 🎮 **Control Swipe Avanzado**: Implementación de soporte táctil robusto con umbral de 50px para evitar desplazamientos accidentales durante el scroll.

### Cambiado
- 🔗 **Navegación Interactiva**: Activación de los botones "VER AHORA" vinculados a rutas dinámicas `/anime/[slug]` mediante Next.js `Link`.
- 📊 **Jerarquía de Inicio**: Reubicación estratégica del banner Brave debajo del Navbar y mejora en la carga de miniaturas de la sección "En Emisión".
- 🧹 **Refactorización de Datos**: Limpieza de archivos `.png` redundantes y duplicados `.env` para un repositorio más liviano.

### Corregido
- 💧 **Fijación de Hidratación**: Solucionado el error crítico de Next.js causado por extensiones de navegador en `layout.tsx`.
- 🧩 **Sincronización de Indicadores**: Corregida la lógica de los dots del carrusel para reflejar con precisión los 12 elementos individuales.

## [1.2.1] - 2026-03-31
### Corregido
- 🔐 **Login dual:** Los usuarios ahora pueden autenticarse usando su nombre de usuario **o** correo electrónico indistintamente.
- 💾 **Estado de episodios:** Corregido bug crítico donde el cambio manual de estado (Pendiente / Viendo / Visto) no persistía al refrescar la página. El componente `EpisodeStatusBadge` ahora sincroniza correctamente cuando el padre actualiza el `statusMap` desde la API.
- ♿ **Accesibilidad — Formularios:** Añadidos atributos `htmlFor`/`id` en todos los campos del formulario del panel de administración para cumplir con WCAG (screen readers).
- ♿ **Accesibilidad — Botones:** Añadidos `aria-label` a los botones de iconos sin texto visible en las páginas de perfil y administración (`Trash2`, `Check`, `X`, `Edit2`).
- ♿ **Accesibilidad — Carrusel:** Añadidos `aria-label` a los botones de navegación Anterior/Siguiente del `HeroCarousel`.

## [1.2.0] - 2026-03-31
### Añadido
- 🎬 **Carrusel de Portada (Hero):** Implementado carrusel premium con 4 clásicos: "Hotaru no Haka", "Sen to Chihiro no Kamikakushi", "Cowboy Bebop" y "Monster".
- ⭐ **Integración MyAnimeList:** Nueva sección de mejores calificados vía Jikan API.
- 🔗 **Mapeo Inteligente:** Sistema de búsqueda dinámica para vincular títulos globales con el catálogo local.
- 🔍 **Página 404 Personalizada:** Diseño divertido con temática de anime (Zoro perdido).
- 🛡️ **Seguridad:** Configuración de cabeceras de seguridad en `vercel.json` y `.htaccess`.
- 🤖 **SEO:** Bloqueo de indexación para mayor privacidad en `robots.txt`.
- 👤 **Avatares Personalizados:** Añadida la posibilidad de elegir entre 4 caras de anime clásicas desde el perfil de usuario.

### Cambiado
- 📐 **Rediseño de Tarjetas:** Corrección de aspecto y tamaños para mejorar la visualización en dispositivos móviles y carruseles del home.
- 🧭 **Navegación:** Menú desplegable en el Navbar para categorías de calificación ("En emisión" y "Top MAL").

## [1.1.0] - 2026-03-29
### Añadido
- ➕ **Gestión de Listas:** Funcionalidad para añadir animes a listas personalizadas directamente desde las tarjetas o la página de detalles.
- 🎨 **Rediseño Visual:** Actualización de colores primarios y tipografía Inter para una estética más premium.
- 📱 **Mobile First:** Mejoras de responsividad en el reproductor y el Navbar.

## [1.0.0] - 2026-03-25
### Añadido
- 🚀 **Lanzamiento Inicial:** Plataforma de streaming funcional estilo Netflix.
- 📡 **API de Episodios:** Integración de catálogo dinámico con tendencias y últimos episodios.
- 🔑 **Autenticación:** Sistema de usuarios y administrador básico.
- 📽️ **Reproductor:** Componente de video optimizado con cambio de episodios fluido.

---
*Este changelog se actualiza manualmente para reflejar hitos significativos.*
