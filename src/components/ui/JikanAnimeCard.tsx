'use client';

import Link from 'next/link';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Play, Search as SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AddToListButton from './AddToListButton';

interface JikanAnimeCardProps {
  slug: string | null;
  title: string;
  cover: string;
  type?: string;
}

export default function JikanAnimeCard({ slug, title, cover }: JikanAnimeCardProps) {
  const { push } = useRouter();

  const hasLocalSlug = slug !== null;
  const finalHref = hasLocalSlug ? `/anime/${slug}` : `/buscar?q=${encodeURIComponent(title)}`;

  return (
    <Link
      href={finalHref}
      className="relative group w-full aspect-[2/3] cursor-pointer block touch-manipulation"
      draggable="false"
    >
      {/* Image Container */}
      <div className="relative w-full h-full rounded-md overflow-hidden shadow-lg border border-zinc-800">
        <m.div 
          className="w-full h-full relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <Image 
            src={cover} 
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover pointer-events-none"
            draggable="false"
          />
          
          {/* Background Shade on Hover (desktop only) */}
          <div className="absolute inset-0 bg-black/60 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </m.div>
      </div>

      {/* Título siempre visible en móvil (gradiente inferior) */}
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none md:hidden">
        <div className="rounded-b-md bg-gradient-to-t from-black/85 via-black/40 to-transparent px-2 pt-6 pb-2">
          <h3 className="text-white font-semibold text-xs line-clamp-2 drop-shadow-md">
            {title}
          </h3>
          {!hasLocalSlug && (
            <span className="inline-block mt-1 px-1.5 py-0.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-yellow-300 text-[9px] font-semibold">
              Buscar en catálogo
            </span>
          )}
        </div>
      </div>

      {/* Floating UI Layer — solo visible en desktop al hacer hover */}
      <div className="absolute inset-0 z-10 flex-col justify-end p-3 pointer-events-none opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hidden md:flex">
        <div className="mb-1">
          <h3 className="text-white font-semibold text-xs md:text-sm line-clamp-2 mb-2 drop-shadow-md">
            {title}
          </h3>
          
          {/* Interactive buttons — stop propagation to prevent Link navigation */}
          <div
            className="flex items-center gap-2 mb-2 pointer-events-auto"
            onClick={(e) => e.preventDefault()}
          >
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); push(finalHref)}}
              aria-label={hasLocalSlug ? 'Ver anime' : 'Buscar anime'} 
              title={hasLocalSlug ? 'Ver anime' : 'Buscar en catálogo'}
              className="size-8 rounded-full bg-white flex items-center justify-center hover:bg-neutral-300 transition-colors shadow-lg"
            >
              {hasLocalSlug ? (
                <Play className="size-4 text-black fill-black ml-0.5" />
              ) : (
                <SearchIcon className="size-4 text-black" />
              )}
            </button>
            
            {hasLocalSlug && (
              <AddToListButton 
                slug={slug} 
                title={title} 
                cover={cover} 
                variant="circle" 
              />
            )}
          </div>
          
          {!hasLocalSlug && (
            <span className="inline-block px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-yellow-300 text-[10px] font-semibold">
              Buscar en catálogo
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
