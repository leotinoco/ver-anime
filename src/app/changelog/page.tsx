import { Milestone, Rocket, ShieldCheck, Sparkles, Zap } from 'lucide-react';

export default function ChangelogPage() {
  const updates = [
    {
      version: 'v1.3.6',
      date: '20 de Abril, 2026',
      title: 'Optimización Hero y UX Móvil',
      icon: <Sparkles className="text-yellow-400" />,
      changes: [
        '📱 Dual-View Móvil: Ahora se muestran 2 animes simultáneamente en el slider hero para una mejor densidad de contenido.',
        '🎮 Control Táctil Mejorado: Ajuste de físicas y eliminación de inercia descontrolada para un desplazamiento más preciso.',
        '📐 Precisión de Layout: Corrección de cálculos de ancho para evitar recortes de imágenes en pantallas pequeñas.'
      ]
    },
    {
      version: 'v1.3.5',
      date: '20 de Abril, 2026',
      title: 'Mantenimiento y Estabilidad',
      icon: <ShieldCheck className="text-green-500" />,
      changes: [
        '🐛 Corrección de Desborde: Eliminación del scroll horizontal causado por los botones del slider en resoluciones móviles.',
        '🔧 Optimización de Repositorio: Configuración de .gitignore para excluir carpetas de agentes inteligentes.'
      ]
    },
    {
      version: 'v1.3.4',
      date: '19 de Abril, 2026',
      title: 'Restauración de Funcionalidades',
      icon: <Zap className="text-blue-400" />,
      changes: [
        '🧾 Listas Personalizadas: Se restauró la capacidad de crear nuevas listas desde el modal "Añadir a mi lista".',
        '🔗 Sincronización de Persistencia: Mejoras en el refresco de UI tras la creación exitosa de una lista.'
      ]
    },
    {
      version: 'v1.3.1',
      date: '08 de Abril, 2026',
      title: 'Mejoras de UX y Correcciones de UI',
      icon: <Zap className="text-yellow-400" />,
      changes: [
        '⏯️ Reanudación Inteligente: El botón "Ver Ep." ahora sugiere el siguiente episodio lógico (Viendo > Pendiente).',
        '🏷️ Títulos Enriquecidos: Inclusión explícita del número de episodio en el título de la página de reproducción.',
        '🔼 Menú Anti-Recorte: Mejora en la lógica del EpisodeStatusBadge para abrirse hacia arriba al final de las listas.',
        '📑 Nombres Completos: Los títulos de animes en favoritos ya no se truncan con puntos suspensivos.',
        '👁️ Marcado Automático: Los episodios anteriores se marcan como "Visto" automáticamente al avanzar en la serie.'
      ]
    },
    {
      version: 'v1.3.0',
      date: '04 de Abril, 2026',
      title: 'Hero Carousel Premium v2 y Optimización AVIF',
      icon: <Rocket className="text-blue-500" />,
      changes: [
        'Sistema de carrusel infinito seamless con auto-avance táctico.',
        'Migración masiva de imágenes a formato .avif reduciendo el peso en un 94%.',
        'Soporte táctil avanzado para navegación en dispositivos móviles.',
        'Regeneración de pósters cinematográficos en alta resolución.'
      ]
    },
    {
      version: 'v1.2.1',
      date: '30 de Marzo, 2026',
      title: 'Catálogo de Géneros Completo',
      icon: <Sparkles className="text-yellow-500" />,
      changes: [
        'Integración de 40 categorías de anime vinculadas directamente a AnimeFLV.',
        'Rediseño minimalista de botones de género para mejorar la densidad de información.',
        'Reestructuración de la página de Categorías: Enlaces globales al inicio.',
        'Optimización de espaciado y navegación responsiva en móviles.'
      ]
    },
    {
      version: 'v1.2.0',
      date: '30 de Marzo, 2026',
      title: 'Identidad y Gestión de Usuarios',
      icon: <ShieldCheck className="text-primary" />,
      changes: [
        'Sistema de autenticación robusto basado en Email y JWT.',
        'Panel de Administración para la creación y gestión de usuarios.',
        'Página de Perfil personalizada con gestión de listas.',
        'Funcionalidad para renombrar listas de favoritos directamente desde el perfil.',
        'Implementación de Middleware para la protección de rutas privadas.',
        'Rediseño legal y profesionalización del Footer.'
      ]
    },
    {
      version: 'v1.1.0',
      date: '25 de Marzo, 2026',
      title: 'Optimización de Contenido y Ranking',
      icon: <Sparkles className="text-yellow-500" />,
      changes: [
        'Nuevo sistema de "Mejor Calificados" ordenado por rating real de la API.',
        'Sección de "Categorías" con filtrado dinámico por géneros.',
        'Bypass de restricciones de servidor: Priorización de MEGA como reproductor predeterminado.',
        'Capa de abstracción para apertura de enlaces externos en reproductores restringidos.',
        'Mejora en la velocidad de carga de miniaturas y metadatos.'
      ]
    },
    {
      version: 'v1.0.0',
      date: '20 de Marzo, 2026',
      title: 'Lanzamiento de Anime Fan',
      icon: <Rocket className="text-blue-500" />,
      changes: [
        'Interfaz de usuario premium inspirada en Netflix.',
        'Consumo integral de la API no oficial de AnimeFLV.',
        'Buscador global de animes funcional.',
        'Sistema de favoritos local inicial.',
        'Diseño responsivo para móviles y escritorio.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-12 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4 uppercase tracking-widest">
            <Zap size={14} /> Bitácora de Desarrollo
          </div>
          <h1 className="text-5xl font-black mb-4">Changelog</h1>
          <p className="text-gray-400 text-lg">
            Sigue la evolución técnica y funcional de Anime Fan.
          </p>
        </div>

        <div className="space-y-12 relative before:absolute before:inset-y-0 before:left-8 before:w-px before:bg-zinc-800">
          {updates.map((update, index) => (
            <div key={index} className="relative pl-20 group">
              <div className="absolute left-0 top-0 w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-2xl group-hover:border-primary/50 transition-colors">
                {update.icon}
              </div>
              
              <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl group-hover:bg-zinc-900 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                  <h2 className="text-2xl font-bold">{update.title}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-primary font-mono font-bold text-sm">{update.version}</span>
                    <span className="text-zinc-500 text-sm">{update.date}</span>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  {update.changes.map((change, i) => (
                    <li key={i} className="flex gap-3 text-gray-400 leading-relaxed">
                      <span className="text-primary mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl text-center">
          <Milestone className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">¿Tienes una sugerencia?</h3>
          <p className="text-gray-500 mb-6">
            Este proyecto está en constante evolución técnica para mejorar la experiencia de usuario.
          </p>
          <a 
            href="https://github.com/leotinoco" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-white text-black font-black rounded-full hover:bg-neutral-200 transition-colors"
          >
            Reportar un Issue en GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
