'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ListVideo } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface DraggableAnimeCardProps {
  anime: {
    slug: string;
    title: string;
    cover: string;
  };
  listId: string;
}

export default function DraggableAnimeCard({ anime, listId }: DraggableAnimeCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: anime.slug,
    data: {
      type: 'Anime',
      anime,
      listId,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative w-full aspect-[2/3] rounded-md overflow-hidden bg-zinc-800 border border-zinc-700 shadow-lg ${isDragging ? 'z-50 ring-2 ring-primary' : ''}`}
    >
      {/* Full-card clickable link */}
      <Link
        href={`/anime/${anime.slug}`}
        className="relative w-full h-full block touch-manipulation"
        draggable="false"
      >
        <Image
          src={anime.cover}
          alt={anime.title}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover pointer-events-none"
          draggable="false"
        />

        {/* Título siempre visible en móvil (gradiente inferior) */}
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none md:hidden">
          <div className="rounded-b-md bg-gradient-to-t from-black/85 via-black/40 to-transparent px-2 pt-6 pb-2">
            <h3 className="text-white font-semibold text-xs line-clamp-2 drop-shadow-md">
              {anime.title}
            </h3>
          </div>
        </div>

        {/* Overlay desktop — solo visible al hacer hover */}
        <div className="absolute inset-0 z-10 bg-black/60 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden md:flex flex-col items-center justify-center p-4">
          <div
            className="pointer-events-auto mb-2"
            onClick={(e) => e.preventDefault()}
          >
            <ListVideo className="size-8 text-white" />
          </div>
          <p className="text-xs font-semibold text-center text-white pointer-events-none">
            {anime.title}
          </p>
        </div>
      </Link>

      {/* Grip handle for drag-and-drop — stops link navigation */}
      <div
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2 left-2 bg-black/50 p-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing z-30 pointer-events-auto transition-opacity"
      >
        <GripVertical className="size-4 text-white" />
      </div>
    </div>
  );
}
