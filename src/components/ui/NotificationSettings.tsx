'use client';

import { useEffect, useMemo, useState } from 'react';
import { subscribeToPush, unsubscribeFromPush, getCurrentSubscription } from '@/lib/pushClient';

type Preferences = {
  newEpisodeEnabled: boolean;
  favoritesReminderEnabled: boolean;
};

export default function NotificationSettings() {
  const [permission, setPermission] = useState<string>(() => (typeof Notification === 'undefined' ? 'unsupported' : Notification.permission));
  const [subscribed, setSubscribed] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Preferences>({ newEpisodeEnabled: true, favoritesReminderEnabled: true });
  const [saving, setSaving] = useState(false);

  const canUsePush = useMemo(() => {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && typeof Notification !== 'undefined';
  }, []);

  const refresh = async () => {
    const [subRes, prefRes] = await Promise.all([
      fetch('/api/push/subscribe', { cache: 'no-store' }),
      fetch('/api/push/preferences', { cache: 'no-store' }),
    ]);

    if (subRes.ok) {
      const j = await subRes.json();
      setSubscribed(Boolean(j.subscribed));
      setPublicKey(typeof j.publicKey === 'string' ? j.publicKey : null);
    }

    if (prefRes.ok) {
      const j = await prefRes.json();
      if (j?.preferences) {
        setPrefs({
          newEpisodeEnabled: Boolean(j.preferences.newEpisodeEnabled),
          favoritesReminderEnabled: Boolean(j.preferences.favoritesReminderEnabled),
        });
      }
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const setPreferences = async (next: Preferences) => {
    setSaving(true);
    try {
      const res = await fetch('/api/push/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      if (res.ok) {
        setPrefs(next);
      }
    } finally {
      setSaving(false);
    }
  };

  const enablePush = async () => {
    if (!canUsePush) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result !== 'granted') return;
    if (!publicKey) return;

    const sub = await subscribeToPush(publicKey);
    if (!sub) return;
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub, userAgent: navigator.userAgent }),
    });
    await refresh();
  };

  const disablePush = async () => {
    if (!canUsePush) return;
    const sub = await getCurrentSubscription();
    const endpoint = sub?.endpoint;
    await unsubscribeFromPush();
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint }),
    });
    await refresh();
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-black">Notificaciones Push</h2>
        <p className="text-sm text-gray-400 mt-1">
          Configura permisos y el tipo de alertas que quieres recibir.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-gray-200">Permiso del navegador</p>
            <p className="text-xs text-gray-500 mt-0.5">{permission}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={enablePush}
              disabled={!canUsePush || saving || permission === 'denied' || subscribed || !publicKey}
              className="px-4 py-2 rounded-md bg-primary text-white text-xs font-bold disabled:opacity-50"
            >
              Activar
            </button>
            <button
              onClick={disablePush}
              disabled={!canUsePush || saving || !subscribed}
              className="px-4 py-2 rounded-md bg-zinc-800 text-white text-xs font-bold disabled:opacity-50"
            >
              Desactivar
            </button>
          </div>
        </div>

        {!publicKey && (
          <p className="text-xs text-yellow-400">
            Falta configurar la clave pública VAPID en el servidor para poder suscribirse.
          </p>
        )}
      </div>

      <div className="border-t border-zinc-800 pt-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-gray-200">Nuevos episodios</p>
            <p className="text-xs text-gray-500 mt-0.5">
              “Nuevo episodio disponible: Episodio X de Nombre del anime”
            </p>
          </div>
          <button
            onClick={() => void setPreferences({ ...prefs, newEpisodeEnabled: !prefs.newEpisodeEnabled })}
            disabled={saving}
            className={`px-4 py-2 rounded-md text-xs font-black ${prefs.newEpisodeEnabled ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-zinc-800 text-gray-300 border border-zinc-700'} disabled:opacity-50`}
          >
            {prefs.newEpisodeEnabled ? 'Activadas' : 'Desactivadas'}
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-gray-200">Recordatorios de Favoritos</p>
            <p className="text-xs text-gray-500 mt-0.5">
              “Aún no has visto Nombre del anime que agregaste a tu lista de Favoritos”
            </p>
          </div>
          <button
            onClick={() => void setPreferences({ ...prefs, favoritesReminderEnabled: !prefs.favoritesReminderEnabled })}
            disabled={saving}
            className={`px-4 py-2 rounded-md text-xs font-black ${prefs.favoritesReminderEnabled ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-zinc-800 text-gray-300 border border-zinc-700'} disabled:opacity-50`}
          >
            {prefs.favoritesReminderEnabled ? 'Activadas' : 'Desactivadas'}
          </button>
        </div>

        <p className="text-[11px] text-gray-500">
          Límite anti-spam: máximo una notificación por anime cada 24 horas.
        </p>
      </div>
    </div>
  );
}

