# Changelog de Anime Fan

Todos los cambios notables en este proyecto serán documentados en este archivo. El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto sigue el [Versionado Semántico](https://semver.org/lang/es/).

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
