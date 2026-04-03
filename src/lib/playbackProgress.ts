export type EpisodeStatus = "pendiente" | "viendo" | "visto";

export const AUTO_TO_VIENDO_MS = 10 * 60 * 1000;
export const AUTO_TO_VISTO_AFTER_VIENDO_MS = 15 * 60 * 1000;
export const PLAYBACK_PERSIST_EVERY_MS = 30 * 1000;

export type PlaybackProgressVersion = 1;

export interface PlaybackProgressSnapshot {
  version: PlaybackProgressVersion;
  animeSlug: string;
  episodeNumber: number;
  status: EpisodeStatus;
  accumulatedMs: number;
  reachedViendoAtAccumulatedMs: number | null;
  savedAtMs: number;
}

export function makeStorageKey(animeSlug: string, episodeNumber: number) {
  return `playback-progress:v1:${animeSlug}:${episodeNumber}`;
}

export function createInitialSnapshot(params: {
  animeSlug: string;
  episodeNumber: number;
  initialStatus: EpisodeStatus;
}): PlaybackProgressSnapshot {
  return {
    version: 1,
    animeSlug: params.animeSlug,
    episodeNumber: params.episodeNumber,
    status: params.initialStatus,
    accumulatedMs: 0,
    reachedViendoAtAccumulatedMs:
      params.initialStatus === "viendo"
        ? 0
        : params.initialStatus === "visto"
          ? 0
          : null,
    savedAtMs: Date.now(),
  };
}

export function sanitizeLoadedSnapshot(
  raw: unknown,
  expected: {
    animeSlug: string;
    episodeNumber: number;
    fallbackStatus: EpisodeStatus;
  },
): PlaybackProgressSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.version !== 1) return null;
  if (r.animeSlug !== expected.animeSlug) return null;
  if (r.episodeNumber !== expected.episodeNumber) return null;
  const status: EpisodeStatus =
    r.status === "pendiente" || r.status === "viendo" || r.status === "visto"
      ? r.status
      : expected.fallbackStatus;
  const accumulatedMs =
    typeof r.accumulatedMs === "number" &&
    Number.isFinite(r.accumulatedMs) &&
    r.accumulatedMs >= 0
      ? r.accumulatedMs
      : 0;
  const reached =
    r.reachedViendoAtAccumulatedMs === null
      ? null
      : typeof r.reachedViendoAtAccumulatedMs === "number" &&
          Number.isFinite(r.reachedViendoAtAccumulatedMs) &&
          r.reachedViendoAtAccumulatedMs >= 0
        ? r.reachedViendoAtAccumulatedMs
        : null;
  const savedAtMs =
    typeof r.savedAtMs === "number" && Number.isFinite(r.savedAtMs)
      ? r.savedAtMs
      : Date.now();

  return {
    version: 1,
    animeSlug: expected.animeSlug,
    episodeNumber: expected.episodeNumber,
    status,
    accumulatedMs,
    reachedViendoAtAccumulatedMs:
      status === "pendiente" ? null : (reached ?? 0),
    savedAtMs,
  };
}

export function applyPlaybackTick(
  snapshot: PlaybackProgressSnapshot,
  params: { deltaMs: number; isPlaying: boolean },
): { snapshot: PlaybackProgressSnapshot; transition: EpisodeStatus | null } {
  if (snapshot.status === "visto") return { snapshot, transition: null };

  const deltaMs = Number.isFinite(params.deltaMs) ? params.deltaMs : 0;
  const clampedDeltaMs = Math.max(0, Math.min(deltaMs, 5000));
  if (!params.isPlaying || clampedDeltaMs === 0) {
    return { snapshot, transition: null };
  }

  const nextAccumulatedMs = snapshot.accumulatedMs + clampedDeltaMs;

  if (snapshot.status === "pendiente") {
    if (nextAccumulatedMs < AUTO_TO_VIENDO_MS) {
      return {
        snapshot: { ...snapshot, accumulatedMs: nextAccumulatedMs },
        transition: null,
      };
    }
    return {
      snapshot: {
        ...snapshot,
        status: "viendo",
        accumulatedMs: nextAccumulatedMs,
        reachedViendoAtAccumulatedMs: nextAccumulatedMs,
      },
      transition: "viendo",
    };
  }

  const reachedAt = snapshot.reachedViendoAtAccumulatedMs ?? 0;
  if (nextAccumulatedMs - reachedAt < AUTO_TO_VISTO_AFTER_VIENDO_MS) {
    return {
      snapshot: { ...snapshot, accumulatedMs: nextAccumulatedMs },
      transition: null,
    };
  }

  return {
    snapshot: {
      ...snapshot,
      status: "visto",
      accumulatedMs: nextAccumulatedMs,
    },
    transition: "visto",
  };
}

export function shouldPersist(nowMs: number, lastPersistedAtMs: number | null) {
  if (lastPersistedAtMs === null) return true;
  return nowMs - lastPersistedAtMs >= PLAYBACK_PERSIST_EVERY_MS;
}
