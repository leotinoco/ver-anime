import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { PushSubscription } from "@/models/PushSubscription";
import { NotificationPreferences } from "@/models/NotificationPreferences";
import { FavoriteList } from "@/models/FavoriteList";
import { WatchProgress } from "@/models/WatchProgress";
import { EpisodePublication } from "@/models/EpisodePublication";
import { PushNotificationLog } from "@/models/PushNotificationLog";
import { getLatestEpisodes } from "@/services/animeApi";

type NormalizedLatestEpisode = {
  animeSlug: string;
  episodeNumber: number;
  animeTitle: string;
  cover?: string;
};

type PushSubLean = {
  userId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

type PreferencesLean = {
  userId: string;
  newEpisodeEnabled?: boolean;
  favoritesReminderEnabled?: boolean;
};

type FavoriteListAnimeLean = {
  slug: string;
  title: string;
  cover?: string;
};

type FavoriteListLean = {
  userId: string;
  name: string;
  animes: FavoriteListAnimeLean[];
};

type EpisodePublicationLean = {
  animeSlug: string;
  episodeNumber: number;
  firstSeenAt: Date;
};

function getBearerToken(req: NextRequest) {
  const h = req.headers.get("authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

function normalizeLatestEpisode(item: unknown): NormalizedLatestEpisode | null {
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
}

function isRecentlyPublished(firstSeenAt: Date) {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return firstSeenAt.getTime() >= sevenDaysAgo;
}

export async function POST(req: NextRequest) {
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
    ? latestRaw
        .map(normalizeLatestEpisode)
        .filter((e): e is NormalizedLatestEpisode => Boolean(e))
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
  const prefsDocs = await NotificationPreferences.find({
    userId: { $in: userIds },
  }).lean();
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

  const lists = await FavoriteList.find({ userId: { $in: userIds } }).lean();
  const listsByUserId = new Map<string, FavoriteListLean[]>();
  for (const l of lists as FavoriteListLean[]) {
    const uid = String(l.userId);
    listsByUserId.set(uid, [...(listsByUserId.get(uid) || []), l]);
  }

  const recentSince = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentLogs = await PushNotificationLog.find(
    { userId: { $in: userIds }, sentAt: { $gte: recentSince } },
    { userId: 1, animeSlug: 1 },
  ).lean();
  const recentAnimeByUserId = new Map<string, Set<string>>();
  for (const l of recentLogs as Array<{ userId: string; animeSlug: string }>) {
    const uid = String(l.userId);
    const set = recentAnimeByUserId.get(uid) || new Set<string>();
    set.add(String(l.animeSlug));
    recentAnimeByUserId.set(uid, set);
  }

  type WebPushClient = {
    setVapidDetails: (
      subject: string,
      publicKey: string,
      privateKey: string,
    ) => void;
    sendNotification: (
      subscription: {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      },
      payload: string,
      options?: { TTL?: number },
    ) => Promise<void>;
  };

  const webpushMod = (await import("web-push")) as unknown as {
    default?: WebPushClient;
  } & WebPushClient;
  const webpush: WebPushClient = webpushMod.default || webpushMod;
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const sub of subs) {
    const userId = String(sub.userId);
    const prefs = prefsByUserId.get(userId) || {
      newEpisodeEnabled: true,
      favoritesReminderEnabled: true,
    };
    const recentAnime = recentAnimeByUserId.get(userId) || new Set<string>();

    const userLists = listsByUserId.get(userId) || [];
    const allAnime = new Map<string, { title: string; cover?: string }>();
    for (const list of userLists) {
      for (const a of list.animes || []) {
        if (!a?.slug) continue;
        allAnime.set(String(a.slug), {
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

    const candidates: Array<{
      type: "new_episode" | "favorites_reminder";
      animeSlug: string;
      episodeNumber?: number;
      title: string;
      body: string;
      image?: string;
      url: string;
    }> = [];

    if (prefs.newEpisodeEnabled) {
      for (const e of newEpisodes) {
        if (!allAnime.has(e.animeSlug)) continue;
        if (recentAnime.has(e.animeSlug)) {
          skipped += 1;
          continue;
        }

        const alreadySeen = await WatchProgress.findOne(
          {
            userId,
            animeSlug: e.animeSlug,
            episodeNumber: e.episodeNumber,
            status: { $in: ["viendo", "visto"] },
          },
          { _id: 1 },
        ).lean();
        if (alreadySeen) {
          skipped += 1;
          continue;
        }

        const episodeLabel = `Episodio ${e.episodeNumber}`;
        const body = `Nuevo episodio disponible: ${episodeLabel} de ${e.animeTitle}`;
        candidates.push({
          type: "new_episode",
          animeSlug: e.animeSlug,
          episodeNumber: e.episodeNumber,
          title: "Nuevo episodio disponible",
          body,
          image: e.cover,
          url: `/ver/${e.animeSlug}/${e.episodeNumber}`,
        });
      }
    }

    if (prefs.favoritesReminderEnabled && favoriteList) {
      for (const a of favoriteList.animes || []) {
        const slug = String(a.slug || "");
        if (!slug) continue;
        if (recentAnime.has(slug)) {
          skipped += 1;
          continue;
        }
        const hasAnyWatched = await WatchProgress.findOne(
          { userId, animeSlug: slug, status: "visto" },
          { _id: 1 },
        ).lean();
        if (hasAnyWatched) {
          continue;
        }
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
        sentAt: now,
        sendStatus: "sent",
      });

      const payload = JSON.stringify({
        title: c.title,
        body: c.body,
        image: c.image,
        icon: "/anime-fan-250x250.avif",
        url: c.url,
        notificationId: String((log as { _id: unknown })._id),
        tag: `anime-${c.animeSlug}`,
      });

      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload,
          { TTL: 60 * 60 * 24 },
        );
        sent += 1;
        recentAnime.add(c.animeSlug);
        recentAnimeByUserId.set(userId, recentAnime);
      } catch (err: unknown) {
        const e = err as { statusCode?: unknown; message?: unknown };
        failed += 1;
        const statusCode =
          typeof e?.statusCode === "number" ? e.statusCode : null;
        await PushNotificationLog.updateOne(
          { _id: (log as { _id: unknown })._id },
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
  }

  return NextResponse.json({ success: true, sent, failed, skipped });
}
