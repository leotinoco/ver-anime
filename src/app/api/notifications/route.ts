import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { FavoriteList } from "@/models/FavoriteList";
import { WatchProgress } from "@/models/WatchProgress";
import { getAnimeDetails } from "@/services/animeApi";

interface Notification {
  animeSlug: string;
  animeTitle: string;
  episodeNumber: number;
  href: string;
}

interface AnimeEntry {
  slug: string;
}

const buildNotificationForSlug = async (
  slug: string,
  userId: string,
): Promise<Notification | null> => {
  const animeData = await getAnimeDetails(slug);
  if (!animeData || !animeData.episodes?.length) return null;

  const seenRecords = await WatchProgress.find(
    {
      userId,
      animeSlug: slug,
      status: { $in: ["viendo", "visto"] },
    },
    { episodeNumber: 1, _id: 0 },
  ).lean();

  const seenEpisodes = new Set((seenRecords as Array<{ episodeNumber: number }>).map((r) => r.episodeNumber));

  const episodes = animeData.episodes as Array<{ number: number }>;
  const latestEp = episodes[episodes.length - 1];
  if (seenEpisodes.has(latestEp.number)) return null;

  return {
    animeSlug: slug,
    animeTitle: String(animeData.title),
    episodeNumber: latestEp.number,
    href: `/ver/${slug}/${latestEp.number}`,
  };
};

export const GET = async (req: NextRequest) => {
  const session = req.cookies.get("session")?.value;
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });

  const payload = await decrypt(session);
  if (!payload) return NextResponse.json({ authenticated: false }, { status: 401 });

  await connectDB();

  const lists = await FavoriteList.find({ userId: payload.userId }).lean();
  const slugSet = new Set<string>();
  for (const list of lists) {
    for (const anime of (list as unknown as { animes: AnimeEntry[] }).animes) {
      slugSet.add(anime.slug);
    }
  }

  if (slugSet.size === 0) {
    return NextResponse.json({ authenticated: true, notifications: [] });
  }

  const results = await Promise.all(
    Array.from(slugSet).map((slug) =>
      buildNotificationForSlug(slug, String(payload.userId)).catch(() => null),
    ),
  );

  const notifications = results.filter((n): n is Notification => n !== null);

  return NextResponse.json({ authenticated: true, notifications });
};
