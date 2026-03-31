'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Info } from 'lucide-react';
import { AnimeOnAir } from '@/services/animeApi';

export default function Hero({ anime }: { anime: AnimeOnAir | null }) {
  if (!anime) return <div className="h-[70vh] w-full bg-[#141414]" />;

  // Using the cover as hero background, but typically a banner is better. 
  // AnimeFLV only provides covers, so we use it with heavy blur or a dark gradient.
  return (
    <div className="relative h-[70vh] md:h-[85vh] w-full">
      {/* Background Image with Gradients */}
      <div className="absolute inset-0 w-full h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={anime.cover}
          alt={anime.title}
          className="w-full h-full object-cover md:object-[center_20%] opacity-60 blur-sm md:blur-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-[10%] md:bottom-[20%] left-4 md:left-12 max-w-2xl">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg"
        >
          {anime.title}
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-3 text-sm md:text-base font-semibold text-gray-300 mb-6"
        >
          <span className="text-green-500">95% coincidencia</span>
          <span className="border border-gray-600 px-2 py-0.5 rounded">{anime.type || "TV"}</span>
          <span>{anime.year}</span>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-gray-200 text-sm md:text-lg mb-8 line-clamp-3 md:line-clamp-4 max-w-xl drop-shadow-md"
        >
          {/* @ts-ignore - Synopsis is injected in page.tsx dynamically */}
          {anime.synopsis || `La historia épica de ${anime.title}. No te pierdas los nuevos episodios que se emiten esta temporada. Disfruta de la mejor animación y acción sin límites.`}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center gap-4"
        >
          <Link 
            href={`/anime/${anime.slug}`}
            className="flex items-center gap-2 bg-white text-black px-6 py-2 md:py-3 rounded md:text-lg font-bold hover:bg-white/80 transition-colors"
          >
            <Play className="w-5 h-5 md:w-6 md:h-6 fill-black" />
            Reproducir
          </Link>
          
          <Link 
            href={`/anime/${anime.slug}`}
            className="flex items-center gap-2 bg-gray-500/50 text-white px-6 py-2 md:py-3 rounded md:text-lg font-bold hover:bg-gray-500/70 transition-colors"
          >
            <Info className="w-5 h-5 md:w-6 md:h-6" />
            Más información
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
