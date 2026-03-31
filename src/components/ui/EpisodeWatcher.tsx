'use client';

import { useEffect, useRef } from 'react';
import EpisodeStatusBadge from './EpisodeStatusBadge';

interface EpisodeWatcherProps {
  animeSlug: string;
  episodeNumber: number;
  initialStatus?: 'pendiente' | 'viendo' | 'visto';
}

export default function EpisodeWatcher({
  animeSlug,
  episodeNumber,
  initialStatus = 'pendiente',
}: EpisodeWatcherProps) {
  const statusRef = useRef(initialStatus);

  useEffect(() => {
    const updateStatus = async (newStatus: 'viendo' | 'visto') => {
      // Don't downgrade: if already 'visto', don't set 'viendo'
      if (statusRef.current === 'visto') return;
      if (newStatus === 'viendo' && statusRef.current === 'viendo') return;
      
      try {
        await fetch('/api/watch-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ animeSlug, episodeNumber, status: newStatus }),
        });
        statusRef.current = newStatus;
        console.log(`[EpisodeWatcher] Auto-updated status to "${newStatus}" for ep ${episodeNumber}`);
      } catch (e) {
        console.error('[EpisodeWatcher] Failed to update status:', e);
      }
    };

    // 15 minutes → 'viendo'
    const viendo = setTimeout(() => updateStatus('viendo'), 15 * 60 * 1000);
    // 25 minutes → 'visto'  
    const visto = setTimeout(() => updateStatus('visto'), 25 * 60 * 1000);

    return () => {
      clearTimeout(viendo);
      clearTimeout(visto);
    };
  }, [animeSlug, episodeNumber]);

  return (
    <div className="mt-6 flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4 max-w-5xl mx-auto">
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-300">Estado de tu progreso</p>
        <p className="text-xs text-gray-500 mt-0.5">Se actualizará automáticamente a "Viendo" a los 15 min y "Visto" a los 25 min.</p>
      </div>
      <EpisodeStatusBadge
        animeSlug={animeSlug}
        episodeNumber={episodeNumber}
        initialStatus={initialStatus}
      />
    </div>
  );
}
