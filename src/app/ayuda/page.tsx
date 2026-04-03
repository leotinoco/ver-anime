export const metadata = {
  title: 'Ayuda y FAQ - Anime Fan',
};

export default function AyudaPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-12 max-w-4xl space-y-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">Ayuda y FAQ</h1>
          <p className="text-gray-400">
            Respuestas rápidas sobre progreso automático y notificaciones.
          </p>
        </div>

        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-black">Progreso automático</h2>
          <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
            <p>
              El estado cambia automáticamente a <span className="font-bold text-white">Viendo</span> tras{' '}
              <span className="font-bold text-white">10 minutos</span> de reproducción continua.
            </p>
            <p>
              Luego cambia a <span className="font-bold text-white">Visto</span> exactamente{' '}
              <span className="font-bold text-white">15 minutos</span> después de alcanzar <span className="font-bold text-white">Viendo</span>.
            </p>
            <p>
              Para mantener la integridad del conteo, el temporizador se pausa si cambias de pestaña, pierdes el foco o te quedas sin conexión.
            </p>
            <p>
              El progreso se guarda localmente cada 30 segundos y se recupera si cierras el navegador o reinicias la app.
            </p>
          </div>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-black">Notificaciones push</h2>
          <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
            <p>
              Puedes activar notificaciones del navegador y elegir el tipo de alertas desde la pantalla de <span className="font-bold text-white">Notificaciones</span>.
            </p>
            <p>
              Tipos disponibles:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
              <li>Nuevo episodio disponible: Episodio X de Nombre del anime.</li>
              <li>Recordatorio de favoritos: Aún no has visto un anime que agregaste a tu lista de Favoritos.</li>
            </ul>
            <p>
              Límite anti-spam: máximo una notificación por anime cada 24 horas.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

