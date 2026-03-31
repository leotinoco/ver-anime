'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Search as SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AddToListButton from './AddToListButton';

interface JikanAnimeCardProps {
  slug: string | null;
  title: string;
  cover: string;
  type?: string;
}

export default function JikanAnimeCard({ slug, title, cover, type }: JikanAnimeCardProps) {
  const router = useRouter();

  const hasLocalSlug = slug !== null;
  const finalHref = hasLocalSlug ? `/anime/${slug}` : `/buscar?q=${encodeURIComponent(title)}`;

  return (
    <div className="relative group w-full aspect-[2/3] cursor-pointer">
      {/* Image Container (Clipped) */}
      <div className="relative w-full h-full rounded-md overflow-hidden shadow-lg border border-zinc-800">
        <Link href={finalHref} className="block w-full h-full">
          <motion.div 
            className="w-full h-full"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={cover} 
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Background Shade on Hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        </Link>
      </div>

      {/* Floating UI Layer (NOT clipped) */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="mb-1">
          <h3 className="text-white font-bold text-xs md:text-sm line-clamp-2 mb-2 drop-shadow-md">
            {title}
          </h3>
          
          <div className="flex items-center gap-2 mb-2 pointer-events-auto">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(finalHref)}}
              aria-label={hasLocalSlug ? 'Ver anime' : 'Buscar anime'} 
              title={hasLocalSlug ? 'Ver anime' : 'Buscar en catálogo'}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-neutral-300 transition-colors shadow-lg"
            >
              {hasLocalSlug ? (
                <Play className="w-4 h-4 text-black fill-black ml-0.5" />
              ) : (
                <SearchIcon className="w-4 h-4 text-black" />
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
            <span className="inline-block px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-yellow-300 text-[10px] font-bold">
              Buscar en catálogo
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
