'use client';

import { useState } from 'react';
import { Download, MonitorPlay, PlayCircle } from 'lucide-react';

interface Server {
  name: string;
  embed: string;
  download?: string;
  type?: string;
}

interface VideoPlayerProps {
  servers: Server[];
}

export default function VideoPlayer({ servers }: VideoPlayerProps) {
  const megaServer = servers?.find(s => s.name.toUpperCase() === 'MEGA');
  const [activeServer, setActiveServer] = useState<Server>(megaServer || servers[0]);

  if (!servers || servers.length === 0) {
    return (
      <div className="w-full aspect-video bg-zinc-900 rounded-xl flex flex-col items-center justify-center text-gray-500">
        <MonitorPlay className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-xl">No hay servidores disponibles</p>
      </div>
    );
  }

  const isMega = activeServer.name.toUpperCase() === 'MEGA';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Video Iframe Container */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
        {isMega ? (
          <iframe
            src={activeServer.embed}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen"
            sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"
            title={`Anime FLV Server - ${activeServer.name}`}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-zinc-900/80 p-6 text-center">
            <MonitorPlay className="w-20 h-20 text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Servidor Externo</h2>
            <p className="text-gray-400 max-w-md mb-8">
              Por restricciones de seguridad de AnimeFLV, los servidores distintos a MEGA no pueden ser incrustados directamente.
            </p>
            <a 
              href={activeServer.embed} 
              target="_blank" 
              rel="noreferrer noopener"
              className="bg-primary hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg flex items-center gap-3 transition-colors text-lg"
            >
              <PlayCircle className="w-6 h-6" /> Reproducir en Nueva Pestaña
            </a>
          </div>
        )}
      </div>

      {/* Server Selection and Actions */}
      <div className="bg-[#141414] rounded-xl p-4 md:p-6 border border-zinc-900 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          <div className="flex-1 w-full">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <MonitorPlay className="w-4 h-4" /> Servidores de Reproducción
            </h3>
            <div className="flex flex-wrap gap-2">
              {servers.map((server, idx) => (
                <button
                  key={`${server.name}-${idx}`}
                  onClick={() => setActiveServer(server)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2
                    ${activeServer.name === server.name 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'bg-zinc-800/80 text-gray-300 hover:bg-zinc-700 hover:text-white'
                    }`}
                >
                  {activeServer.name === server.name && <PlayCircle className="w-4 h-4" />}
                  {server.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {activeServer.download && (
              <a
                href={activeServer.download}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-md text-sm font-bold transition-colors w-full md:w-auto"
              >
                <Download className="w-4 h-4" /> Descargar
              </a>
            )}


          </div>
          
        </div>
      </div>
    </div>
  );
}
