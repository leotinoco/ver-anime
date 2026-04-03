'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const EXT = { target: '_blank', rel: 'noopener noreferrer nofollow' } as const;

export default function Footer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.authenticated) setIsLoggedIn(true); })
      .catch(() => {});
  }, []);

  return (
    <footer className="w-full bg-[#141414] border-t border-zinc-800 text-gray-400 py-8 text-sm mt-auto">
      <div className="container mx-auto px-4 md:px-12 flex flex-col items-center justify-center space-y-4">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full text-xs border-b border-zinc-800 pb-8 text-center md:text-left">
          {/* Explorar */}
          <div className="flex flex-col gap-2">
            <h4 className="text-white font-bold mb-1">Explorar</h4>
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <Link href="/categorias" className="hover:text-white transition-colors">Categorías</Link>
            <Link href="/mejor-calificados" className="hover:text-white transition-colors">Top en Emisión</Link>
            <Link href="/mejor-calificados-myanimelist" className="hover:text-white transition-colors">Top MyAnimeList</Link>
          </div>

          {/* Cuenta */}
          <div className="flex flex-col gap-2">
            <h4 className="text-white font-bold mb-1">Cuenta</h4>
            <Link href="/perfil" className="hover:text-white transition-colors">Mi Perfil</Link>
            <Link href="/favoritos" className="hover:text-white transition-colors">Mis Listas</Link>
            {!isLoggedIn && (
              <Link href="/login" className="hover:text-white transition-colors">Ingresar</Link>
            )}
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-2">
            <h4 className="text-white font-bold mb-1">Legal</h4>
            <Link href="/legal" className="hover:text-white transition-colors">Aviso Legal</Link>
            <Link href="/legal#terminos" className="hover:text-white transition-colors">Términos de Uso</Link>
          </div>

          {/* Soporte */}
          <div className="flex flex-col gap-2">
            <h4 className="text-white font-bold mb-1">Soporte</h4>
            <Link href="/ayuda" className="hover:text-white transition-colors">Ayuda y FAQ</Link>
            <Link href="/notificaciones" className="hover:text-white transition-colors">Notificaciones</Link>
            <Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link>
            <a href="https://github.com/leotinoco/ver-anime" {...EXT} className="hover:text-white transition-colors">
              Repositorio GitHub
            </a>
            <a href="https://github.com/leotinoco/ver-anime/issues" {...EXT} className="hover:text-white transition-colors">
              Contacto / Issues
            </a>
          </div>
        </div>

        <p className="text-center max-w-3xl leading-relaxed">
          Anime Fan opera como una capa de abstracción técnica y middleware de interfaz diseñada específicamente para optimizar la experiencia de gestión de metadatos del ecosistema AnimeFLV. Nuestra misión es proveer herramientas avanzadas de persistencia de datos —como el seguimiento de progreso y personalización de listas— que no se encuentran disponibles nativamente en la infraestructura de origen.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] opacity-70">
           <span>Engineered with </span>
           <a href="https://animeflv.ahmedrangel.com" {...EXT} className="text-white hover:text-primary transition-colors underline">
             AnimeFLV API (Unnoficial)
           </a>
           <span className="hidden md:inline">|</span>
           <span>Powered by </span>
           <a href="https://github.com/ahmedrangel/animeflv-scraper" {...EXT} className="text-white hover:text-primary transition-colors underline">
             animeflv-scraper engine
           </a>
        </div>

        <div className="pt-4 flex flex-col items-center gap-2">
           <p className="font-semibold">
              Realizado por{' '}
              <a href="https://github.com/leotinoco" {...EXT} className="text-white hover:underline">leotinoco</a>, un{' '}
              <a href="https://chibcha.club" {...EXT} className="text-white hover:underline">Chibcha</a>.
           </p>
           <Link href="/legal" className="text-xs text-zinc-500 hover:text-white transition-colors underline underline-offset-2">
             Términos, Condiciones y Aviso Legal
           </Link>
        </div>

      </div>
    </footer>
  );
}
