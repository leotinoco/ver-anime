"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import useSWRMutation from "swr/mutation";
import EpisodeStatusBadge from "./EpisodeStatusBadge";
import {
  applyPlaybackTick,
  createInitialSnapshot,
  makeStorageKey,
  sanitizeLoadedSnapshot,
  shouldPersist,
  type EpisodeStatus,
  type PlaybackProgressSnapshot,
} from "@/lib/playbackProgress";

interface EpisodeWatcherProps {
  animeSlug: string;
  episodeNumber: number;
  initialStatus?: "pendiente" | "viendo" | "visto";
}

const subscribeOnline = (callback: () => void) => {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
};

const getSnapshotOnline = () => navigator.onLine;
const getServerSnapshotOnline = () => true;

const updateProgressFetcher = async (url: string, { arg }: { arg: { animeSlug: string; episodeNumber: number; status: string; source: string } }) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error("Failed to update progress");
  return res.json();
};

export default function EpisodeWatcher({
  animeSlug,
  episodeNumber,
  initialStatus = "pendiente",
}: EpisodeWatcherProps) {
  const statusRef = useRef<EpisodeStatus>(initialStatus);
  const snapshotRef = useRef<PlaybackProgressSnapshot>(
    createInitialSnapshot({ animeSlug, episodeNumber, initialStatus }),
  );
  const lastTickAtMsRef = useRef<number | null>(null);
  const lastPersistAtMsRef = useRef<number | null>(null);
  const pendingStatusRef = useRef<EpisodeStatus | null>(null);
  const onStatusChangeRef = useRef<((count: number) => void) | null>(null);

  const [currentStatus, setCurrentStatus] = useState<EpisodeStatus>(initialStatus);

  const isOnline = useSyncExternalStore(subscribeOnline, getSnapshotOnline, getServerSnapshotOnline);

  const { trigger } = useSWRMutation("/api/watch-progress", updateProgressFetcher);

  useEffect(() => {
    const storageKey = makeStorageKey(animeSlug, episodeNumber);

    const persist = () => {
      try {
        const nowMs = Date.now();
        const snapshot = { ...snapshotRef.current, savedAtMs: nowMs };
        localStorage.setItem(storageKey, JSON.stringify(snapshot));
        lastPersistAtMsRef.current = nowMs;
      } catch {}
    };

    const load = () => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const loaded = sanitizeLoadedSnapshot(parsed, {
          animeSlug,
          episodeNumber,
          fallbackStatus: initialStatus,
        });
        if (!loaded) return;
        snapshotRef.current = loaded;
      } catch {}
    };

    load();

    if (initialStatus === "visto") {
      snapshotRef.current = {
        ...snapshotRef.current,
        status: "visto",
        reachedViendoAtAccumulatedMs:
          snapshotRef.current.reachedViendoAtAccumulatedMs ?? 0,
      };
      pendingStatusRef.current = null;
      persist();
    } else if (
      initialStatus === "viendo" &&
      snapshotRef.current.status === "pendiente"
    ) {
      snapshotRef.current = {
        ...snapshotRef.current,
        status: "viendo",
        reachedViendoAtAccumulatedMs:
          snapshotRef.current.reachedViendoAtAccumulatedMs ??
          snapshotRef.current.accumulatedMs,
      };
      persist();
    }

    const shouldCountAsPlaying = () => {
      if (!navigator.onLine) return false;
      if (document.visibilityState !== "visible") return false;
      if (!document.hasFocus()) return false;
      return true;
    };

    const sendPending = async () => {
      const pending = pendingStatusRef.current;
      if (!pending) return;
      if (pending !== "viendo" && pending !== "visto") return;
      if (!navigator.onLine) return;
      if (statusRef.current === "visto") {
        pendingStatusRef.current = null;
        return;
      }
      if (pending === "viendo" && statusRef.current === "viendo") {
        pendingStatusRef.current = null;
        return;
      }

      try {
        await trigger({
          animeSlug,
          episodeNumber,
          status: pending,
          source: "auto",
        });
        statusRef.current = pending;
        pendingStatusRef.current = null;
        setCurrentStatus(pending);
        persist();
      } catch {
      }
    };

    const tick = () => {
      const nowMs = Date.now();
      const lastMs = lastTickAtMsRef.current ?? nowMs;
      lastTickAtMsRef.current = nowMs;

      const { snapshot, transition } = applyPlaybackTick(snapshotRef.current, {
        deltaMs: nowMs - lastMs,
        isPlaying: shouldCountAsPlaying(),
      });
      snapshotRef.current = snapshot;

      if (transition === "viendo" || transition === "visto") {
        pendingStatusRef.current = transition;
      }

      if (shouldPersist(nowMs, lastPersistAtMsRef.current)) {
        persist();
      }

      void sendPending();
    };

    const interval = window.setInterval(tick, 1000);
    const onVisibility = () => persist();
    const onBeforeUnload = () => persist();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onBeforeUnload);
      persist();
    };
  }, [animeSlug, episodeNumber, initialStatus, trigger]);

  const onOptimisticChange = (newStatus: EpisodeStatus) => {
    setCurrentStatus(newStatus);
    statusRef.current = newStatus;
  };

  const onStatusChange = (updatedPreviousCount: number) => {
    onStatusChangeRef.current?.(updatedPreviousCount);
  };

  return (
    <div className="mt-6 flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4 max-w-5xl mx-auto">
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-300">Estado de tu progreso</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Se actualizará automáticamente a Viendo tras 10 min de reproducción
          continua y a &quot;Visto&quot; 15 min después.
          {!isOnline && " (Sin conexión)"}
        </p>
      </div>
      <EpisodeStatusBadge
        animeSlug={animeSlug}
        episodeNumber={episodeNumber}
        initialStatus={currentStatus}
        onOptimisticChange={onOptimisticChange}
        onStatusChange={onStatusChange}
      />
    </div>
  );
}
