'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import DraggableAnimeCard from './DraggableAnimeCard';
import { Trash2 } from 'lucide-react';

interface SortableListProps {
  id: string;
  name: string;
  animes: any[];
  onDeleteList: (id: string) => void;
}

export default function SortableList({ id, name, animes, onDeleteList }: SortableListProps) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
          {name}
          <span className="text-sm font-normal text-gray-400 bg-zinc-800 px-2 py-0.5 rounded-full">
            {animes.length} animes
          </span>
        </h2>
        <button
          onClick={() => onDeleteList(id)}
          aria-label="Delete List"
          title="Delete List"
          className="text-gray-500 hover:text-red-500 transition-colors pointer-events-auto"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div 
        ref={setNodeRef}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 min-h-[150px]"
      >
        <SortableContext 
          id={id}
          items={animes.map(a => a.slug)} 
          strategy={rectSortingStrategy}
        >
          {animes.map((anime) => (
            <DraggableAnimeCard 
              key={anime.slug} 
              anime={anime} 
              listId={id} 
            />
          ))}
        </SortableContext>

        {animes.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500 italic text-sm border-2 border-dashed border-zinc-800 rounded-lg">
            Arrastra un anime aquí o agrégalo desde el buscador.
          </div>
        )}
      </div>
    </div>
  );
}
