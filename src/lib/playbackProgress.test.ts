import test from "node:test";
import assert from "node:assert/strict";
import {
  AUTO_TO_VIENDO_MS,
  applyPlaybackTick,
  createInitialSnapshot,
  sanitizeLoadedSnapshot,
  shouldPersist,
} from "./playbackProgress";

test("no acumula tiempo si no está reproduciendo", () => {
  const s0 = createInitialSnapshot({
    animeSlug: "a",
    episodeNumber: 1,
    initialStatus: "pendiente",
  });
  const { snapshot, transition } = applyPlaybackTick(s0, {
    deltaMs: 1000,
    isPlaying: false,
  });
  assert.equal(transition, null);
  assert.equal(snapshot.accumulatedMs, 0);
  assert.equal(snapshot.status, "pendiente");
});

test("transiciona a viendo exactamente a los 10 minutos de reproducción continua", () => {
  let s = createInitialSnapshot({
    animeSlug: "a",
    episodeNumber: 1,
    initialStatus: "pendiente",
  });
  for (let i = 0; i < 599; i += 1) {
    const out = applyPlaybackTick(s, { deltaMs: 1000, isPlaying: true });
    assert.equal(out.transition, null);
    assert.equal(out.snapshot.status, "pendiente");
    s = out.snapshot;
  }

  const last = applyPlaybackTick(s, { deltaMs: 1000, isPlaying: true });
  assert.equal(last.transition, "viendo");
  assert.equal(last.snapshot.status, "viendo");
  assert.equal(last.snapshot.accumulatedMs, AUTO_TO_VIENDO_MS);
  assert.equal(last.snapshot.reachedViendoAtAccumulatedMs, AUTO_TO_VIENDO_MS);
});

test("transiciona a visto 15 minutos después de llegar a viendo", () => {
  let s = createInitialSnapshot({
    animeSlug: "a",
    episodeNumber: 1,
    initialStatus: "pendiente",
  });

  for (let i = 0; i < 600; i += 1) {
    s = applyPlaybackTick(s, { deltaMs: 1000, isPlaying: true }).snapshot;
  }
  assert.equal(s.status, "viendo");

  for (let i = 0; i < 899; i += 1) {
    const out = applyPlaybackTick(s, { deltaMs: 1000, isPlaying: true });
    assert.equal(out.transition, null);
    assert.equal(out.snapshot.status, "viendo");
    s = out.snapshot;
  }

  const last = applyPlaybackTick(s, { deltaMs: 1000, isPlaying: true });
  assert.equal(last.transition, "visto");
  assert.equal(last.snapshot.status, "visto");
});

test("clampa deltas grandes para evitar saltos por suspensión", () => {
  const s0 = createInitialSnapshot({
    animeSlug: "a",
    episodeNumber: 1,
    initialStatus: "pendiente",
  });
  const out = applyPlaybackTick(s0, { deltaMs: 60_000, isPlaying: true });
  assert.equal(out.snapshot.accumulatedMs, 5000);
});

test("sanitizeLoadedSnapshot valida slug/episodio y normaliza campos", () => {
  const raw = {
    version: 1,
    animeSlug: "x",
    episodeNumber: 3,
    status: "viendo",
    accumulatedMs: 12_345,
    reachedViendoAtAccumulatedMs: 12_345,
    savedAtMs: 1_000,
  };
  const ok = sanitizeLoadedSnapshot(raw, {
    animeSlug: "x",
    episodeNumber: 3,
    fallbackStatus: "pendiente",
  });
  assert.ok(ok);
  assert.equal(ok?.status, "viendo");
  assert.equal(ok?.accumulatedMs, 12_345);

  const bad = sanitizeLoadedSnapshot(raw, {
    animeSlug: "y",
    episodeNumber: 3,
    fallbackStatus: "pendiente",
  });
  assert.equal(bad, null);
});

test("shouldPersist respeta intervalo de 30s", () => {
  assert.equal(shouldPersist(1000, null), true);
  assert.equal(shouldPersist(31_000, 1_000), true);
  assert.equal(shouldPersist(30_999, 1_000), false);
});

test("restaura snapshot sin sumar tiempo fuera de la app", () => {
  let s = createInitialSnapshot({
    animeSlug: "a",
    episodeNumber: 1,
    initialStatus: "pendiente",
  });
  for (let i = 0; i < 120; i += 1) {
    s = applyPlaybackTick(s, { deltaMs: 1000, isPlaying: true }).snapshot;
  }
  const raw = JSON.parse(JSON.stringify({ ...s, savedAtMs: 123 }));
  const restored = sanitizeLoadedSnapshot(raw, {
    animeSlug: "a",
    episodeNumber: 1,
    fallbackStatus: "pendiente",
  });
  assert.ok(restored);
  assert.equal(restored?.accumulatedMs, s.accumulatedMs);
  const out = applyPlaybackTick(restored!, {
    deltaMs: 10_000,
    isPlaying: false,
  });
  assert.equal(out.snapshot.accumulatedMs, s.accumulatedMs);
});
