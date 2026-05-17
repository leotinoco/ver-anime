'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import EpisodeStatusBadge from './EpisodeStatusBadge';

interface Episode { number: number; [key: string]: any; }

interface EpisodeListProps {
  episodes: Episode[];
  animeSlug: string;
  animeTitle: string;
}

interface StatusMap {
  [key: number]: 'pendiente' | 'viendo' | 'visto';
}

export default function EpisodeList({ episodes, animeSlug, animeTitle }: EpisodeListProps) {
  const [statusMap, setStatusMap] = useState<StatusMap>({});

  const fetchStatusMap = useCallback(() => {
    fetch(`/api/watch-progress?animeSlug=${animeSlug}`)
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.statusMap) {
          setStatusMap(data.statusMap);
        }
      })
      .catch(() => {}); // Silently fail if not authenticated
  }, [animeSlug]);

  useEffect(() => {
    fetchStatusMap();
  }, [fetchStatusMap]);

  // Called by EpisodeStatusBadge immediately when a user clicks a new status
  const handleOptimisticUpdate = (episodeNumber: number, newStatus: 'pendiente' | 'viendo' | 'visto') => {
    setStatusMap(prev => {
      const updated = { ...prev };
      if (newStatus === 'visto') {
        // Optimistically mark this and all previous episodes as 'visto'
        for (let i = 1; i <= episodeNumber; i++) {
          updated[i] = 'visto';
        }
      } else {
        // Just update this specific episode
        updated[episodeNumber] = newStatus;
      }
      return updated;
    });
  };

  // Called by EpisodeStatusBadge after the API call finishes.
  // We refetch to ensure the local state is perfectly synced with the DB.
  const handleApiSync = (_updatedPreviousCount: number) => {
    // If the API failed (updatedPreviousCount === 0 when we expected more, or just to be safe),
    // or if it succeeded, we refetch to ensure consistency.
    // To avoid too many fetches, we could only fetch if updatedPreviousCount > 0 or if there was an error,
    // but a background refetch is generally safe and ensures we don't stay out of sync.
    fetchStatusMap();
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
                onOptimisticChange={(newStatus) => handleOptimisticUpdate(ep.number, newStatus)}
                onStatusChange={handleApiSync}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
