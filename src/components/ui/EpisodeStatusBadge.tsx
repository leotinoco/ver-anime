'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, Circle, ChevronDown } from 'lucide-react';

type EpisodeStatus = 'pendiente' | 'viendo' | 'visto';

interface EpisodeStatusBadgeProps {
  animeSlug: string;
  episodeNumber: number;
  initialStatus?: EpisodeStatus;
  compact?: boolean;
}

const STATUS_CONFIG = {
  pendiente: {
    label: 'Pendiente',
    icon: Circle,
    className: 'bg-zinc-800 text-gray-400 border-zinc-700',
    dot: 'bg-gray-500',
  },
  viendo: {
    label: 'Viendo',
    icon: Clock,
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    dot: 'bg-yellow-500',
  },
  visto: {
    label: 'Visto',
    icon: CheckCircle2,
    className: 'bg-green-500/20 text-green-400 border-green-500/40',
    dot: 'bg-green-500',
  },
};

export default function EpisodeStatusBadge({
  animeSlug,
  episodeNumber,
  initialStatus = 'pendiente',
  compact = false,
}: EpisodeStatusBadgeProps) {
  const [status, setStatus] = useState<EpisodeStatus>(initialStatus);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const config = STATUS_CONFIG[status];

  const [error, setError] = useState(false);

  const updateStatus = async (newStatus: EpisodeStatus) => {
    if (newStatus === status) { setOpen(false); return; }
    const previous = status;
    setStatus(newStatus); // Optimistic update
    setOpen(false);
    setSaving(true);
    setError(false);
    try {
      const res = await fetch('/api/watch-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeSlug, episodeNumber, status: newStatus }),
      });
      if (!res.ok) {
        // Revert on failure
        setStatus(previous);
        setError(true);
        setTimeout(() => setError(false), 3000);
      }
    } catch (e) {
      console.error(e);
      setStatus(previous);
      setError(true);
      setTimeout(() => setError(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (compact) {
    return (
      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.className}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  }

  return (
    <div className="relative" onClick={(e) => e.preventDefault()}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        disabled={saving}
        title={error ? 'Error al guardar. ¿Estás conectado?' : `Estado: ${config.label}`}
        aria-label={`Cambiar estado del episodio. Estado actual: ${config.label}`}
        className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all hover:opacity-80 ${
          error
            ? 'bg-red-500/20 text-red-400 border-red-500/40'
            : config.className
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : config.dot} ${saving ? 'animate-pulse' : ''}`} />
        {error ? '¡Error!' : config.label}
        {!error && <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl z-50 p-1 min-w-[130px]">
          {(Object.keys(STATUS_CONFIG) as EpisodeStatus[]).map((s) => {
            const sc = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={(e) => { e.stopPropagation(); updateStatus(s); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold hover:bg-zinc-800 transition-colors ${status === s ? 'text-white' : 'text-gray-400'}`}
              >
                <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                {sc.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
