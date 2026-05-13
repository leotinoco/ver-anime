export type EpisodeStatus = "pendiente" | "viendo" | "visto";

export const AUTO_TO_VIENDO_MS = 10 * 60 * 1000;
export const AUTO_TO_VISTO_AFTER_VIENDO_MS = 15 * 60 * 1000;

const PLAYBACK_PERSIST_EVERY_MS = 30 * 1000;
const MAX_TICK_DELTA_MS = 5000;

export interface PlaybackProgressSnapshot {
  version: 1;
  animeSlug: string;
  episodeNumber: number;
  status: EpisodeStatus;
  accumulatedMs: number;
  reachedViendoAtAccumulatedMs: number | null;
  savedAtMs: number;
}

export const makeStorageKey = (animeSlug: string, episodeNumber: number) =>
  `playback-progress:v1:${animeSlug}:${episodeNumber}`;

export const createInitialSnapshot = (params: {
  animeSlug: string;
  episodeNumber: number;
  initialStatus: EpisodeStatus;
}): PlaybackProgressSnapshot => ({
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
});

const isValidEpisodeStatus = (value: unknown): value is EpisodeStatus =>
  value === "pendiente" || value === "viendo" || value === "visto";

const isFinitePositive = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

export const sanitizeLoadedSnapshot = (
  raw: unknown,
  expected: {
    animeSlug: string;
    episodeNumber: number;
    fallbackStatus: EpisodeStatus;
  },
): PlaybackProgressSnapshot | null => {
  if (!raw || typeof raw !== "object") return null;

  const r = raw as Record<string, unknown>;
  if (r.version !== 1) return null;
  if (r.animeSlug !== expected.animeSlug) return null;
  if (r.episodeNumber !== expected.episodeNumber) return null;

  const status: EpisodeStatus = isValidEpisodeStatus(r.status)
    ? r.status
    : expected.fallbackStatus;

  const accumulatedMs = isFinitePositive(r.accumulatedMs) ? r.accumulatedMs : 0;

  const reached =
    r.reachedViendoAtAccumulatedMs === null
      ? null
      : isFinitePositive(r.reachedViendoAtAccumulatedMs)
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
};

export const applyPlaybackTick = (
  snapshot: PlaybackProgressSnapshot,
  params: { deltaMs: number; isPlaying: boolean },
): { snapshot: PlaybackProgressSnapshot; transition: EpisodeStatus | null } => {
  if (snapshot.status === "visto") return { snapshot, transition: null };

  const deltaMs = Number.isFinite(params.deltaMs) ? params.deltaMs : 0;
  const clampedDeltaMs = Math.max(0, Math.min(deltaMs, MAX_TICK_DELTA_MS));
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
};

export const shouldPersist = (nowMs: number, lastPersistedAtMs: number | null) => {
  if (lastPersistedAtMs === null) return true;
  return nowMs - lastPersistedAtMs >= PLAYBACK_PERSIST_EVERY_MS;
};
