import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { PushSubscription } from "@/models/PushSubscription";
import { NotificationPreferences } from "@/models/NotificationPreferences";
import { FavoriteList } from "@/models/FavoriteList";
import { WatchProgress } from "@/models/WatchProgress";
import { EpisodePublication } from "@/models/EpisodePublication";
import { PushNotificationLog } from "@/models/PushNotificationLog";
import { getLatestEpisodes } from "@/services/animeApi";
import webpush from "web-push";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const PUSH_TTL_S = 60 * 60 * 24;

interface NormalizedLatestEpisode {
  animeSlug: string;
  episodeNumber: number;
  animeTitle: string;
  cover?: string;
}

interface PushSubLean {
  userId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

interface PreferencesLean {
  userId: string;
  newEpisodeEnabled?: boolean;
  favoritesReminderEnabled?: boolean;
}

interface FavoriteListAnimeLean {
  slug: string;
  title: string;
  cover?: string;
}

interface FavoriteListLean {
  userId: string;
  name: string;
  animes: FavoriteListAnimeLean[];
}

interface EpisodePublicationLean {
  animeSlug: string;
  episodeNumber: number;
  firstSeenAt: Date;
}

interface Candidate {
  type: "new_episode" | "favorites_reminder";
  animeSlug: string;
  episodeNumber?: number;
  title: string;
  body: string;
  image?: string;
  url: string;
}

const getBearerToken = (req: NextRequest) => {
  const h = req.headers.get("authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
};

const normalizeLatestEpisode = (item: unknown): NormalizedLatestEpisode | null => {
  if (!item || typeof item !== "object") return null;
  const r = item as Record<string, unknown>;
  const animeObj =
    r.anime && typeof r.anime === "object"
      ? (r.anime as Record<string, unknown>)
      : null;

  const number =
    typeof r.number === "number"
      ? r.number
      : typeof r.episodeNumber === "number"
        ? r.episodeNumber
        : null;
  const rawSlug =
    typeof r.slug === "string"
      ? r.slug
      : typeof r.id === "string"
        ? r.id
        : null;
  const animeTitle =
    typeof animeObj?.title === "string"
      ? animeObj.title
      : typeof r.title === "string"
        ? r.title
        : null;
  const cover =
    typeof animeObj?.cover === "string"
      ? animeObj.cover
      : typeof r.cover === "string"
        ? r.cover
        : undefined;

  if (!rawSlug || typeof number !== "number" || !animeTitle) return null;
  const animeSlug = rawSlug.replace(new RegExp(`-${number}$`), "");
  if (!animeSlug) return null;
  return { animeSlug, episodeNumber: number, animeTitle, cover };
};

const isRecentlyPublished = (firstSeenAt: Date) =>
  firstSeenAt.getTime() >= Date.now() - SEVEN_DAYS_MS;

const buildWatchedSet = (
  records: Array<{ animeSlug: string; episodeNumber: number }>,
): Set<string> => {
  const watched = new Set<string>();
  for (const r of records) {
    watched.add(`${r.animeSlug}:${r.episodeNumber}`);
  }
  return watched;
};

const processSub = async (
  sub: PushSubLean,
  context: {
    newEpisodes: NormalizedLatestEpisode[];
    prefsByUserId: Map<string, { newEpisodeEnabled: boolean; favoritesReminderEnabled: boolean }>;
    listsByUserId: Map<string, FavoriteListLean[]>;
    recentAnimeByUserId: Map<string, Set<string>>;
    now: Date;
    vapidSubject: string;
    vapidPublicKey: string;
    vapidPrivateKey: string;
  },
): Promise<{ sent: number; failed: number; skipped: number }> => {
  const userId = String(sub.userId);
  const prefs = context.prefsByUserId.get(userId) ?? {
    newEpisodeEnabled: true,
    favoritesReminderEnabled: true,
  };
  const recentAnime = context.recentAnimeByUserId.get(userId) ?? new Set<string>();

  const userLists = context.listsByUserId.get(userId) ?? [];
  const allAnimeMap = new Map<string, { title: string; cover?: string }>();
  for (const list of userLists) {
    for (const a of list.animes ?? []) {
      if (!a?.slug) continue;
      allAnimeMap.set(String(a.slug), {
        title: String(a.title || a.slug),
        cover: a.cover,
      });
    }
  }

  const favoriteList = userLists.find(
    (l) =>
      typeof l?.name === "string" &&
      l.name.toLowerCase().includes("favoritos"),
  );

  const candidates: Candidate[] = [];
  let skipped = 0;

  if (prefs.newEpisodeEnabled && context.newEpisodes.length > 0) {
    const relevantEpisodes = context.newEpisodes.filter(
      (e) => allAnimeMap.has(e.animeSlug) && !recentAnime.has(e.animeSlug),
    );

    const skippedByRecent = context.newEpisodes.filter(
      (e) => allAnimeMap.has(e.animeSlug) && recentAnime.has(e.animeSlug),
    ).length;
    skipped += skippedByRecent;

    if (relevantEpisodes.length > 0) {
      const watchedRecords = await WatchProgress.find(
        {
          userId,
          animeSlug: { $in: relevantEpisodes.map((e) => e.animeSlug) },
          status: { $in: ["viendo", "visto"] },
        },
        { animeSlug: 1, episodeNumber: 1, _id: 0 },
      ).lean();

      const watchedSet = buildWatchedSet(
        watchedRecords as Array<{ animeSlug: string; episodeNumber: number }>,
      );

      for (const e of relevantEpisodes) {
        if (watchedSet.has(`${e.animeSlug}:${e.episodeNumber}`)) {
          skipped += 1;
          continue;
        }
        candidates.push({
          type: "new_episode",
          animeSlug: e.animeSlug,
          episodeNumber: e.episodeNumber,
          title: "Nuevo episodio disponible",
          body: `Nuevo episodio disponible: Episodio ${e.episodeNumber} de ${e.animeTitle}`,
          image: e.cover,
          url: `/ver/${e.animeSlug}/${e.episodeNumber}`,
        });
      }
    }
  }

  if (prefs.favoritesReminderEnabled && favoriteList) {
    const reminderAnimes = (favoriteList.animes ?? []).filter((a) => {
      const slug = String(a.slug ?? "");
      if (!slug) return false;
      if (recentAnime.has(slug)) {
        skipped += 1;
        return false;
      }
      return true;
    });

    if (reminderAnimes.length > 0) {
      const watchedRecords = await WatchProgress.find(
        {
          userId,
          animeSlug: { $in: reminderAnimes.map((a) => String(a.slug)) },
          status: "visto",
        },
        { animeSlug: 1, _id: 0 },
      ).lean();

      const watchedSlugs = new Set(
        (watchedRecords as Array<{ animeSlug: string }>).map((r) => r.animeSlug),
      );

      for (const a of reminderAnimes) {
        const slug = String(a.slug);
        if (watchedSlugs.has(slug)) continue;
        candidates.push({
          type: "favorites_reminder",
          animeSlug: slug,
          title: "Recordatorio de favoritos",
          body: `Aún no has visto ${String(a.title || slug)} que agregaste a tu lista de Favoritos`,
          image: a.cover,
          url: `/ver/${slug}/1`,
        });
      }
    }
  }

  let sent = 0;
  let failed = 0;

  for (const c of candidates) {
    if (recentAnime.has(c.animeSlug)) {
      skipped += 1;
      continue;
    }

    const log = await PushNotificationLog.create({
      userId,
      type: c.type,
      animeSlug: c.animeSlug,
      episodeNumber: c.episodeNumber,
      title: c.title,
      body: c.body,
      image: c.image,
      url: c.url,
      sentAt: context.now,
      sendStatus: "sent",
    });

    const payload = JSON.stringify({
      title: c.title,
      body: c.body,
      image: c.image,
      icon: "/anime-fan-250x250.avif",
      url: c.url,
      notificationId: String(log._id),
      tag: `anime-${c.animeSlug}`,
    });

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload,
        { TTL: PUSH_TTL_S },
      );
      sent += 1;
      recentAnime.add(c.animeSlug);
      context.recentAnimeByUserId.set(userId, recentAnime);
    } catch (err: unknown) {
      const e = err as { statusCode?: unknown; message?: unknown };
      failed += 1;
      const statusCode = typeof e?.statusCode === "number" ? e.statusCode : null;
      await PushNotificationLog.updateOne(
        { _id: log._id },
        {
          $set: {
            sendStatus: "failed",
            error: typeof e?.message === "string" ? e.message : String(err),
          },
        },
      );
      if (statusCode === 404 || statusCode === 410) {
        await PushSubscription.deleteOne({ userId, endpoint: sub.endpoint });
      }
    }
  }

  return { sent, failed, skipped };
};

export const POST = async (req: NextRequest) => {
  const secret = process.env.PUSH_DISPATCH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Push dispatch not configured" },
      { status: 501 },
    );
  }
  if (getBearerToken(req) !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vapidSubject = process.env.VAPID_SUBJECT;
  const vapidPublicKey =
    process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  if (!vapidSubject || !vapidPublicKey || !vapidPrivateKey) {
    return NextResponse.json(
      { error: "VAPID not configured" },
      { status: 501 },
    );
  }

  await connectDB();

  const latestRaw = await getLatestEpisodes();
  const normalizedLatest = Array.isArray(latestRaw)
    ? latestRaw.reduce<NormalizedLatestEpisode[]>((acc, item) => {
        const e = normalizeLatestEpisode(item);
        if (e) acc.push(e);
        return acc;
      }, [])
    : [];

  const now = new Date();
  if (normalizedLatest.length > 0) {
    const ops = normalizedLatest.map((e) => ({
      updateOne: {
        filter: { animeSlug: e.animeSlug, episodeNumber: e.episodeNumber },
        update: {
          $setOnInsert: { firstSeenAt: now },
          $set: { lastSeenAt: now, title: e.animeTitle, cover: e.cover },
        },
        upsert: true,
      },
    }));
    await EpisodePublication.bulkWrite(ops, { ordered: false });
  }

  const orKeys = normalizedLatest.map((e) => ({
    animeSlug: e.animeSlug,
    episodeNumber: e.episodeNumber,
  }));
  const publicationDocs = orKeys.length
    ? await EpisodePublication.find(
        { $or: orKeys },
        { animeSlug: 1, episodeNumber: 1, firstSeenAt: 1 },
      ).lean()
    : [];

  const publicationKeyToFirstSeen = new Map<string, Date>();
  for (const d of publicationDocs as EpisodePublicationLean[]) {
    publicationKeyToFirstSeen.set(
      `${d.animeSlug}:${d.episodeNumber}`,
      d.firstSeenAt,
    );
  }

  const newEpisodes = normalizedLatest.filter((e) => {
    const firstSeen = publicationKeyToFirstSeen.get(
      `${e.animeSlug}:${e.episodeNumber}`,
    );
    return firstSeen ? isRecentlyPublished(firstSeen) : true;
  });

  const subs = (await PushSubscription.find(
    {},
    { userId: 1, endpoint: 1, keys: 1 },
  ).lean()) as PushSubLean[];
  if (subs.length === 0)
    return NextResponse.json({ success: true, sent: 0, failed: 0, skipped: 0 });

  const userIds = Array.from(new Set(subs.map((s) => String(s.userId))));

  const [prefsDocs, lists, recentLogs] = await Promise.all([
    NotificationPreferences.find({ userId: { $in: userIds } }).lean(),
    FavoriteList.find({ userId: { $in: userIds } }).lean(),
    PushNotificationLog.find(
      { userId: { $in: userIds }, sentAt: { $gte: new Date(Date.now() - ONE_DAY_MS) } },
      { userId: 1, animeSlug: 1 },
    ).lean(),
  ]);

  const prefsByUserId = new Map<
    string,
    { newEpisodeEnabled: boolean; favoritesReminderEnabled: boolean }
  >();
  for (const p of prefsDocs as PreferencesLean[]) {
    prefsByUserId.set(String(p.userId), {
      newEpisodeEnabled: Boolean(p.newEpisodeEnabled),
      favoritesReminderEnabled: Boolean(p.favoritesReminderEnabled),
    });
  }

  const listsByUserId = new Map<string, FavoriteListLean[]>();
  for (const l of lists as FavoriteListLean[]) {
    const uid = String(l.userId);
    listsByUserId.set(uid, [...(listsByUserId.get(uid) ?? []), l]);
  }

  const recentAnimeByUserId = new Map<string, Set<string>>();
  for (const l of recentLogs as Array<{ userId: string; animeSlug: string }>) {
    const uid = String(l.userId);
    const set = recentAnimeByUserId.get(uid) ?? new Set<string>();
    set.add(String(l.animeSlug));
    recentAnimeByUserId.set(uid, set);
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const context = {
    newEpisodes,
    prefsByUserId,
    listsByUserId,
    recentAnimeByUserId,
    now,
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey,
  };

  const results = await Promise.all(subs.map((sub) => processSub(sub, context)));

  const totals = results.reduce(
    (acc, r) => ({
      sent: acc.sent + r.sent,
      failed: acc.failed + r.failed,
      skipped: acc.skipped + r.skipped,
    }),
    { sent: 0, failed: 0, skipped: 0 },
  );

  return NextResponse.json({ success: true, ...totals });
};
