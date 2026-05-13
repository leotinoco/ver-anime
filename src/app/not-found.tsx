import Link from 'next/link';
import Image from 'next/image';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="relative mb-8 w-full max-w-md aspect-video">
        <Image 
          src="/404-no-encontrado.avif" 
          alt="404 No Encontrado" 
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="mx-auto rounded-2xl shadow-2xl border-4 border-primary/20 object-cover"
        />
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white font-black px-6 py-2 rounded-full text-xl shadow-xl">
          404
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4 tracking-tighter">
        ¿Te perdiste, Zoro?
      </h1>
      
      <p className="text-zinc-400 text-lg md:text-xl max-w-lg mb-10 leading-relaxed font-medium">
        Parece que este anime no está en nuestro catálogo (o quizás se lo comió un Titán). Sea como sea, esta dirección no existe en esta realidad.
      </p>
      
      <Link 
        href="/" 
        className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold text-lg hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-2xl"
      >
        <Home className="size-5" />
        Regresar al Inicio
      </Link>
    </div>
  );
}
