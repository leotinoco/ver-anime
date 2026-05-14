import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import {
  WatchProgress,
  type EpisodeStatus,
  type IWatchProgress,
} from "@/models/WatchProgress";
import { type AnyBulkWriteOperation } from "mongoose";

const SLOW_REQUEST_THRESHOLD_MS = 500;

const getAuthUser = async (req: NextRequest) => {
  const session = req.cookies.get("session")?.value;
  if (!session) return null;
  return decrypt(session);
};

export const GET = async (req: NextRequest) => {
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

  const statusMap: Record<number, EpisodeStatus> = {};
  for (const record of progressRecords) {
    statusMap[record.episodeNumber] = record.status;
  }

  return NextResponse.json({ authenticated: true, statusMap });
};

export const POST = async (req: NextRequest) => {
  const payload = await getAuthUser(req);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const body = await req.json();
  const { animeSlug, episodeNumber, status, source, seriesId, seasonId } = body;

  const animeSlugStr = typeof animeSlug === "string" ? animeSlug : null;
  if (!animeSlugStr || episodeNumber === undefined || !status) {
    return NextResponse.json(
      { error: "animeSlug, episodeNumber and status are required" },
      { status: 400 },
    );
  }

  const validStatuses = new Set<EpisodeStatus>(["pendiente", "viendo", "visto"]);
  if (!validStatuses.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const statusValue = status as EpisodeStatus;

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
      : animeSlugStr;
  const resolvedSeasonId =
    typeof seasonId === "string" && seasonId.trim()
      ? seasonId.trim()
      : animeSlugStr;
  const episodeNum = Number(episodeNumber);
  if (!Number.isFinite(episodeNum) || episodeNum <= 0) {
    return NextResponse.json(
      { error: "Invalid episodeNumber" },
      { status: 400 },
    );
  }

  const startedAt = Date.now();

  try {
    const now = new Date();
    const updatedPrevious: Array<{
      episodeNumber: number;
      from: EpisodeStatus;
      to: EpisodeStatus;
    }> = [];

    // 1. Upsert the target episode — atomic, no transaction needed
    //    The unique compound index (userId, animeSlug, episodeNumber) guarantees idempotency.
    await WatchProgress.updateOne(
      {
        userId: payload.userId,
        animeSlug: animeSlugStr,
        episodeNumber: episodeNum,
      },
      {
        $set: {
          status: statusValue,
          watchedAt: now,
          seriesId: resolvedSeriesId,
          seasonId: resolvedSeasonId,
        },
        $setOnInsert: {
          userId: payload.userId,
          animeSlug: animeSlugStr,
          episodeNumber: episodeNum,
        },
      },
      { upsert: true },
    );

    // 2. Auto-mark previous episodes as "visto" (only for manual marks)
    const shouldAutoMarkPrevious =
      normalizedSource === "manual" && statusValue === "visto";

    if (shouldAutoMarkPrevious && episodeNum > 1) {
      // Find previous episodes that are NOT already "visto"
      const previous = await WatchProgress.find(
        {
          userId: payload.userId,
          animeSlug: animeSlugStr,
          episodeNumber: { $lt: episodeNum },
          status: { $ne: "visto" },
        },
        { episodeNumber: 1, status: 1, _id: 0 },
      ).lean();

      const existingNotVistoSet = new Set<number>();
      for (const doc of previous) {
        existingNotVistoSet.add(doc.episodeNumber);
        updatedPrevious.push({
          episodeNumber: doc.episodeNumber,
          from: doc.status,
          to: "visto",
        });
      }

      // Build bulk ops: upsert all episodes from 1 to episodeNum-1
      const bulkOps: AnyBulkWriteOperation<IWatchProgress>[] = [];
      for (let i = 1; i < episodeNum; i++) {
        if (existingNotVistoSet.has(i)) {
          // Existing doc that is not "visto" — update it
          bulkOps.push({
            updateOne: {
              filter: {
                userId: payload.userId,
                animeSlug: animeSlugStr,
                episodeNumber: i,
              },
              update: {
                $set: {
                  status: "visto",
                  watchedAt: now,
                  seriesId: resolvedSeriesId,
                  seasonId: resolvedSeasonId,
                },
              },
            },
          });
        } else if (!existingNotVistoSet.has(i)) {
          // Might not exist at all — upsert only if missing
          bulkOps.push({
            updateOne: {
              filter: {
                userId: payload.userId,
                animeSlug: animeSlugStr,
                episodeNumber: i,
              },
              update: {
                $setOnInsert: {
                  userId: payload.userId,
                  animeSlug: animeSlugStr,
                  episodeNumber: i,
                  status: "visto",
                  watchedAt: now,
                  seriesId: resolvedSeriesId,
                  seasonId: resolvedSeasonId,
                },
              },
              upsert: true,
            },
          });
        }
      }

      if (bulkOps.length > 0) {
        await WatchProgress.bulkWrite(bulkOps, { ordered: false });
      }
    }

    const elapsedMs = Date.now() - startedAt;
    const logPayload = {
      ts: new Date().toISOString(),
      event: "watch_progress_update",
      source: normalizedSource || "unknown",
      userId: payload.userId,
      animeSlug: animeSlugStr,
      seriesId: resolvedSeriesId,
      seasonId: resolvedSeasonId,
      episodeNumber: episodeNum,
      status: statusValue,
      updatedPreviousCount: updatedPrevious.length,
      elapsedMs,
    };
    console.info(JSON.stringify(logPayload));

    if (elapsedMs > SLOW_REQUEST_THRESHOLD_MS) {
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
    const e = err as { status?: unknown; message?: unknown };
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
        error: typeof e?.message === "string" ? e.message : String(err),
      }),
    );
    return NextResponse.json(
      { error: "Failed to update watch progress" },
      { status: statusCode },
    );
  }
};
