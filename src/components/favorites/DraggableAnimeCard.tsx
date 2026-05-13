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
      className={`group relative w-full aspect-[2/3] rounded-md overflow-hidden bg-zinc-800 border border-zinc-700 ${isDragging ? 'z-50 ring-2 ring-primary' : ''}`}
    >
      <Image
        src={anime.cover}
        alt={anime.title}
        fill
        sizes="(max-width: 640px) 50vw, 25vw"
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4">
        <Link
          href={`/anime/${anime.slug}`}
          className="bg-primary hover:bg-red-700 text-white p-2 rounded-full mb-2 pointer-events-auto"
        >
          <ListVideo className="size-5" />
        </Link>
        <p className="text-xs font-semibold text-center mt-2 px-1 text-white">
          {anime.title}
        </p>
      </div>

      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 left-2 bg-black/50 p-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing z-30 pointer-events-auto"
      >
        <GripVertical className="size-4 text-white" />
      </div>
    </div>
  );
}
