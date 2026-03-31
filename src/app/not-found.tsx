import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="relative mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/404-no-encontrado.avif" 
          alt="404 No Encontrado" 
          className="w-full max-w-md mx-auto rounded-2xl shadow-2xl border-4 border-primary/20"
        />
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white font-black px-6 py-2 rounded-full text-xl shadow-xl">
          404
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
        ¿Te perdiste, Zoro?
      </h1>
      
      <p className="text-gray-400 text-lg md:text-xl max-w-lg mb-10 leading-relaxed font-medium">
        Parece que este anime no está en nuestro catálogo (o quizás se lo comió un Titán). Sea como sea, esta dirección no existe en esta realidad.
      </p>
      
      <Link 
        href="/" 
        className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-black text-lg hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-2xl"
      >
        <Home className="w-5 h-5" />
        Regresar al Inicio
      </Link>
    </div>
  );
}
