import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import { FavoriteList } from '@/models/FavoriteList';
import { WatchProgress } from '@/models/WatchProgress';
import { getAnimeDetails } from '@/services/animeApi';

// GET /api/notifications
// Returns unseen episodes for animes in the user's lists
export async function GET(req: NextRequest) {
  const session = req.cookies.get('session')?.value;
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });

  const payload = await decrypt(session);
  if (!payload) return NextResponse.json({ authenticated: false }, { status: 401 });

  await connectDB();

  // 1. Get all animes from all user lists (flatten & deduplicate by slug)
  const lists = await FavoriteList.find({ userId: payload.userId }).lean();
  const slugSet = new Set<string>();
  for (const list of lists) {
    for (const anime of (list as any).animes) {
      slugSet.add(anime.slug);
    }
  }

  if (slugSet.size === 0) {
    return NextResponse.json({ authenticated: true, notifications: [] });
  }

  // 2. For each anime, get its episodes from the API (cached by Next.js fetch)
  const notifications: Array<{
    animeSlug: string;
    animeTitle: string;
    episodeNumber: number;
    href: string;
  }> = [];

  for (const slug of slugSet) {
    try {
      const animeData = await getAnimeDetails(slug);
      if (!animeData || !animeData.episodes?.length) continue;

      // 3. Check which episodes the user has NOT seen (not in WatchProgress or status='pendiente')
      const seenRecords = await WatchProgress.find({
        userId: payload.userId,
        animeSlug: slug,
        status: { $in: ['viendo', 'visto'] },
      }).lean();

      const seenNumbers = new Set(seenRecords.map((r: any) => r.episodeNumber));

      // Latest episode only — avoid flooding notifications
      const latestEp = animeData.episodes[animeData.episodes.length - 1];
      if (!seenNumbers.has(latestEp.number)) {
        notifications.push({
          animeSlug: slug,
          animeTitle: animeData.title,
          episodeNumber: latestEp.number,
          href: `/ver/${slug}/${latestEp.number}`,
        });
      }
    } catch {
      // Skip if anime details not available
    }
  }

  return NextResponse.json({ authenticated: true, notifications });
}
