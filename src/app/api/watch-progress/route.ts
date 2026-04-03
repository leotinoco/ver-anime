import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { WatchProgress, EpisodeStatus } from "@/models/WatchProgress";
import mongoose from "mongoose";

async function getAuthUser(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  if (!session) return null;
  return decrypt(session);
}

// GET /api/watch-progress?animeSlug=xxx
// Returns all episode statuses for a user + specific anime
export async function GET(req: NextRequest) {
  const payload = await getAuthUser(req);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const animeSlug = searchParams.get("animeSlug");

  if (!animeSlug) {
    return NextResponse.json(
      { error: "animeSlug is required" },
      { status: 400 },
    );
  }

  await connectDB();

  const progressRecords = await WatchProgress.find({
    userId: payload.userId,
    animeSlug,
  }).lean();

  // Return a map: { episodeNumber: status }
  const statusMap: Record<number, EpisodeStatus> = {};
  for (const record of progressRecords) {
    statusMap[record.episodeNumber] = record.status;
  }

  return NextResponse.json({ authenticated: true, statusMap });
}

// POST /api/watch-progress
// Body: { animeSlug, episodeNumber, status }
export async function POST(req: NextRequest) {
  const payload = await getAuthUser(req);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const body = await req.json();
  const { animeSlug, episodeNumber, status, source, seriesId, seasonId } = body;

  if (!animeSlug || episodeNumber === undefined || !status) {
    return NextResponse.json(
      { error: "animeSlug, episodeNumber and status are required" },
      { status: 400 },
    );
  }

  const validStatuses: EpisodeStatus[] = ["pendiente", "viendo", "visto"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await connectDB();

  const normalizedSource =
    (typeof source === "string" &&
      (source === "manual" || source === "auto") &&
      source) ||
    (req.headers.get("x-progress-source") === "manual"
      ? "manual"
      : req.headers.get("x-progress-source") === "auto"
        ? "auto"
        : undefined);

  const resolvedSeriesId =
    typeof seriesId === "string" && seriesId.trim()
      ? seriesId.trim()
      : String(animeSlug);
  const resolvedSeasonId =
    typeof seasonId === "string" && seasonId.trim()
      ? seasonId.trim()
      : String(animeSlug);
  const episodeNum = Number(episodeNumber);

  const startedAt = Date.now();
  let attempt = 0;

  while (attempt < 3) {
    attempt += 1;
    const session = await mongoose.startSession();
    try {
      let updatedPrevious: Array<{
        episodeNumber: number;
        from: EpisodeStatus;
        to: EpisodeStatus;
      }> = [];

      await session.withTransaction(async () => {
        const now = new Date();

        await WatchProgress.findOneAndUpdate(
          { userId: payload.userId, animeSlug, episodeNumber: episodeNum },
          {
            $set: {
              status,
              watchedAt: now,
              seriesId: resolvedSeriesId,
              seasonId: resolvedSeasonId,
            },
            $setOnInsert: {
              userId: payload.userId,
              animeSlug,
              episodeNumber: episodeNum,
            },
          },
          { upsert: true, new: true, session },
        );

        const shouldAutoMarkPrevious =
          normalizedSource === "manual" && status === "visto";
        if (!shouldAutoMarkPrevious) return;

        const previous = await WatchProgress.find(
          {
            userId: payload.userId,
            animeSlug,
            episodeNumber: { $lt: episodeNum },
            status: { $in: ["pendiente", "viendo"] },
          },
          { episodeNumber: 1, status: 1, seriesId: 1, seasonId: 1, _id: 0 },
          { session },
        ).lean();

        for (const doc of previous as Array<{
          seriesId?: unknown;
          seasonId?: unknown;
          episodeNumber: number;
          status: EpisodeStatus;
        }>) {
          const prevSeriesId =
            typeof doc.seriesId === "string" ? doc.seriesId : null;
          const prevSeasonId =
            typeof doc.seasonId === "string" ? doc.seasonId : null;
          if (prevSeriesId && prevSeriesId !== resolvedSeriesId) {
            const err = new Error("Series mismatch") as Error & {
              status?: number;
            };
            err.status = 409;
            throw err;
          }
          if (prevSeasonId && prevSeasonId !== resolvedSeasonId) {
            const err = new Error("Season mismatch") as Error & {
              status?: number;
            };
            err.status = 409;
            throw err;
          }
        }

        updatedPrevious = (
          previous as Array<{ episodeNumber: number; status: EpisodeStatus }>
        ).map((p) => ({
          episodeNumber: p.episodeNumber,
          from: p.status,
          to: "visto",
        }));

        if (updatedPrevious.length === 0) return;

        await WatchProgress.updateMany(
          {
            userId: payload.userId,
            animeSlug,
            episodeNumber: { $lt: episodeNum },
            status: { $in: ["pendiente", "viendo"] },
          },
          {
            $set: {
              status: "visto",
              watchedAt: now,
              seriesId: resolvedSeriesId,
              seasonId: resolvedSeasonId,
            },
          },
          { session },
        );
      });

      const elapsedMs = Date.now() - startedAt;
      const logPayload = {
        ts: new Date().toISOString(),
        event: "watch_progress_update",
        source: normalizedSource || "unknown",
        userId: payload.userId,
        animeSlug,
        seriesId: resolvedSeriesId,
        seasonId: resolvedSeasonId,
        episodeNumber: episodeNum,
        status,
        updatedPrevious,
        elapsedMs,
      };
      console.info(JSON.stringify(logPayload));

      if (elapsedMs > 500) {
        console.warn(
          JSON.stringify({
            ...logPayload,
            event: "watch_progress_update_slow",
          }),
        );
      }

      return NextResponse.json({
        success: true,
        updatedPreviousCount: updatedPrevious.length,
      });
    } catch (err: unknown) {
      const e = err as {
        hasErrorLabel?: (label: string) => boolean;
        code?: unknown;
        status?: unknown;
        message?: unknown;
      };
      const hasTransientLabel =
        typeof e?.hasErrorLabel === "function" &&
        e.hasErrorLabel("TransientTransactionError");
      const isWriteConflict = e?.code === 112;
      const shouldRetry = hasTransientLabel || isWriteConflict;

      if (shouldRetry && attempt < 3) {
        continue;
      }

      const statusCode = typeof e?.status === "number" ? e.status : 500;
      console.error(
        JSON.stringify({
          ts: new Date().toISOString(),
          event: "watch_progress_update_error",
          userId: payload.userId,
          animeSlug,
          episodeNumber: episodeNum,
          status,
          source: normalizedSource || "unknown",
          attempt,
          error: typeof e?.message === "string" ? e.message : String(err),
        }),
      );
      return NextResponse.json(
        { error: "Failed to update watch progress" },
        { status: statusCode },
      );
    } finally {
      await session.endSession();
    }
  }

  return NextResponse.json(
    { error: "Failed to update watch progress" },
    { status: 500 },
  );
}
