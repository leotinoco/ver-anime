'use client';

import Link from 'next/link';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AddToListButton from './AddToListButton';

interface AnimeCardProps {
  slug: string;
  title: string;
  cover: string;
  type?: string;
  episodeNumber?: number;
}

export default function AnimeCard({ slug, title, cover, type, episodeNumber }: AnimeCardProps) {
  const { push } = useRouter();

  const finalHref = episodeNumber ? `/ver/${slug}/${episodeNumber}` : `/anime/${slug}`;

  return (
    <div className="relative group w-full aspect-[2/3] cursor-pointer">
      {/* Container for the image (Clipped) */}
      <div className="relative w-full h-full rounded-md overflow-hidden shadow-lg border border-zinc-800">
        <Link href={finalHref} className="block w-full h-full relative">
          <m.div 
            className="w-full h-full relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Image 
              src={cover} 
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
            
            {/* Background Shade on Hover (desktop only) */}
            <div className="absolute inset-0 bg-black/60 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
          </m.div>
        </Link>
      </div>

      {/* Título siempre visible en móvil (gradiente inferior) */}
      <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none md:hidden">
        <div className="rounded-b-md bg-gradient-to-t from-black/85 via-black/40 to-transparent px-2 pt-6 pb-2">
          <h3 className="text-white font-semibold text-xs line-clamp-2 drop-shadow-md">
            {title}
          </h3>
          {(type || episodeNumber) && (
            <div className="flex items-center flex-wrap gap-1 mt-1 text-[10px] font-semibold">
              {type && (
                <span className="px-1.5 py-0.5 bg-white/20 backdrop-blur-md border border-white/30 rounded text-white uppercase tracking-tighter">
                  {type}
                </span>
              )}
              {episodeNumber && (
                <span className="px-1.5 py-0.5 bg-primary/90 border border-primary text-white rounded">
                  Ep. {episodeNumber}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating UI Layer — solo visible en desktop al hacer hover */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 pointer-events-none opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hidden md:flex">
        <div className="mb-2">
          <h3 className="text-white font-semibold text-sm md:text-base line-clamp-2 mb-2 drop-shadow-md">
            {title}
          </h3>
          
          <div className="flex items-center gap-2 mb-2 pointer-events-auto">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); push(finalHref)}}
              aria-label="Reproducir" title="Reproducir" className="size-8 rounded-full bg-white flex items-center justify-center hover:bg-neutral-300 transition-colors shadow-lg"
            >
              <Play className="size-4 text-black fill-black ml-1" />
            </button>
            
            <AddToListButton 
              slug={slug} 
              title={title} 
              cover={cover} 
              variant="circle" 
            />
          </div>
          
          <div className="flex items-center flex-wrap gap-2 text-xs font-semibold pointer-events-none">
            {type && (
              <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md border border-white/30 rounded text-white uppercase tracking-tighter shadow-sm">
                {type}
              </span>
            )}
            {episodeNumber && (
              <span className="px-2 py-0.5 bg-primary/90 border border-primary text-white rounded shadow-lg shadow-primary/20">
                Episodio {episodeNumber}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
