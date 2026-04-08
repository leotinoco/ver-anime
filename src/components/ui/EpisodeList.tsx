'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import EpisodeStatusBadge from './EpisodeStatusBadge';

interface Episode { number: number; [key: string]: any; }

interface EpisodeListProps {
  episodes: Episode[];
  animeSlug: string;
  animeTitle: string;
}

type StatusMap = Record<number, 'pendiente' | 'viendo' | 'visto'>;

export default function EpisodeList({ episodes, animeSlug, animeTitle }: EpisodeListProps) {
  const [statusMap, setStatusMap] = useState<StatusMap>({});

  const fetchStatusMap = () => {
    fetch(`/api/watch-progress?animeSlug=${animeSlug}`)
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.statusMap) {
          setStatusMap(data.statusMap);
        }
      })
      .catch(() => {}); // Silently fail if not authenticated
  };

  useEffect(() => {
    fetchStatusMap();
  }, [animeSlug]);

  // Called by EpisodeStatusBadge after a successful save.
  // If previous episodes were bulk-updated, refetch the full map.
  const handleStatusChange = (updatedPreviousCount: number) => {
    if (updatedPreviousCount > 0) {
      fetchStatusMap();
    }
  };

  if (!episodes || episodes.length === 0) {
    return <p className="text-gray-500 italic text-center py-8">No hay episodios disponibles.</p>;
  }

  return (
    <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      {episodes.map((ep, index) => {
        const epStatus = statusMap[ep.number] || 'pendiente';
        const isLastFew = episodes.length > 4 && index >= episodes.length - 2;
        return (
          <div
            key={ep.number}
            className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 transition-colors border border-zinc-800/50 group"
          >
            <Link
              href={`/ver/${animeSlug}/${ep.number}`}
              className="flex gap-4 flex-1 items-center"
            >
              <div className="relative w-20 sm:w-28 aspect-video bg-zinc-800 rounded overflow-hidden shrink-0 flex items-center justify-center">
                <Play className="w-6 h-6 text-white opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-base mb-0.5 group-hover:text-white text-gray-200 transition-colors">
                  Episodio {ep.number}
                </h4>
                <p className="text-xs text-gray-400 line-clamp-1">
                  Haz clic para ver el episodio {ep.number} de {animeTitle}.
                </p>
              </div>
            </Link>

            {/* Status Badge - separate from Link to avoid nested interaction issues */}
            <div className="flex items-center pl-2 sm:pr-1" onClick={e => e.stopPropagation()}>
              <EpisodeStatusBadge
                animeSlug={animeSlug}
                episodeNumber={ep.number}
                initialStatus={epStatus}
                dropdownDirection={isLastFew ? 'up' : 'down'}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
