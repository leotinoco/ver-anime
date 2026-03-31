import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import { WatchProgress, EpisodeStatus } from '@/models/WatchProgress';

async function getAuthUser(req: NextRequest) {
  const session = req.cookies.get('session')?.value;
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
  const animeSlug = searchParams.get('animeSlug');

  if (!animeSlug) {
    return NextResponse.json({ error: 'animeSlug is required' }, { status: 400 });
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
  const { animeSlug, episodeNumber, status } = body;

  if (!animeSlug || episodeNumber === undefined || !status) {
    return NextResponse.json({ error: 'animeSlug, episodeNumber and status are required' }, { status: 400 });
  }

  const validStatuses: EpisodeStatus[] = ['pendiente', 'viendo', 'visto'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  await connectDB();

  // Upsert: create if not exists, update if exists
  const result = await WatchProgress.findOneAndUpdate(
    { userId: payload.userId, animeSlug, episodeNumber: Number(episodeNumber) },
    { 
      $set: { status, watchedAt: new Date() },
      $setOnInsert: { userId: payload.userId, animeSlug, episodeNumber: Number(episodeNumber) }
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true, record: result });
}
