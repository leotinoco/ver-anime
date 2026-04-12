# 🎬 Anime Fan - Netflix Style Streaming

[![Ver en Vivo](https://img.shields.io/badge/🌐_Ver_en_Vivo-ver--anime.vercel.app-red?style=for-the-badge)](https://ver-anime.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-leotinoco%2Fver--anime-181717?style=for-the-badge&logo=github)](https://github.com/leotinoco/ver-anime)

> 🌐 Para ver este proyecto en línea visita: [ver-anime.vercel.app](https://ver-anime.vercel.app)

![Anime Fan Preview](https://ver-anime.vercel.app/miniatura-1200.avif)

Una plataforma de streaming de anime moderna y fluida, inspirada en la interfaz de usuario de Netflix, diseñada para ofrecer la mejor experiencia de visualización gratuita y en alta definición.

## ✨ Características Principales

- **🍿 Interfaz Premium:** Diseño "Dark Mode" estilo Netflix con carruseles fluidos y transiciones cinemáticas.
- **🖼️ Carrusel de Portada (Hero):** Destacados dinámicos con las mejores obras maestras (La Tumba de las Luciérnagas, El Viaje de Chihiro, Cowboy Bebop y Monster).
- **⭐ Integración con MyAnimeList:** Sección de "Mejor Calificados" consumiendo la API de Jikan, con mapeo inteligente al catálogo local.
- **📚 Gestión de Listas:** Crea tus propias listas personalizadas y guarda tus animes favoritos sin complicaciones.
- **🔔 Notificaciones:** Recibe alertas de nuevos episodios de los animes en tus listas.
- **▶️ Estado de Episodios:** Marca cada episodio como Pendiente, Viendo o Visto, por usuario.
- **🔍 Búsqueda Avanzada:** Encuentra cualquier anime instantáneamente con el motor de búsqueda integrado.
- **📱 Experiencia Mobile-First:** Interfaz optimizada para móviles con títulos siempre visibles (sin hover) y navegación adaptada para pantallas táctiles.
- **🛡️ Seguridad Reforzada:** Protección contra vulnerabilidades comunes y navegación privada.

## 🚀 Tecnologías Usadas

- **Core:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Animaciones:** [Framer Motion](https://www.framer.com/motion/)
- **Iconos:** [Lucide React](https://lucide.dev/)
- **Base de Datos:** [MongoDB](https://www.mongodb.com/) (vía Mongoose para gestión de listas y progreso)
- **API Externa:** [Jikan API](https://jikan.moe/) & [AnimeFLV scraping API](https://animeflv.ahmedrangel.com/)

## 🛠️ Instalación y Configuración

```bash
# 1. Clonar el repositorio
git clone https://github.com/leotinoco/ver-anime.git

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (.env)
DATABASE_URL=tu_mongodb_url
JWT_SECRET=tu_secreto_super_seguro
NEXT_PUBLIC_API_BASE=https://animeflv.ahmedrangel.com/api

# (Opcional) Push Notifications (Web Push)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_vapid_public_key
VAPID_PRIVATE_KEY=tu_vapid_private_key
VAPID_SUBJECT=mailto:tu_correo@dominio.com
PUSH_DISPATCH_SECRET=tu_secreto_para_dispatch

# 4. Iniciar en desarrollo
npm run dev
```

## 🔒 Privacidad y SEO

Este proyecto se ha configurado para ser exclusivo de sus usuarios. Se ha implementado un bloqueo estricto de indexación en buscadores (`robots.txt`) y cabeceras de seguridad avanzadas en `vercel.json` y `.htaccess`.

## 🐛 Reportar un Error

¿Encontraste un problema? Abre un issue en GitHub:  
👉 [github.com/leotinoco/ver-anime/issues](https://github.com/leotinoco/ver-anime/issues)

---
Desarrollado con ❤️ por **Leonardo Tinoco**
