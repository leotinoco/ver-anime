import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import { PushSubscription } from '@/models/PushSubscription';

async function getAuthUser(req: NextRequest) {
  const session = req.cookies.get('session')?.value;
  if (!session) return null;
  return decrypt(session);
}

function getPublicVapidKey() {
  const k = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
  return typeof k === 'string' && k.trim() ? k.trim() : null;
}

export async function GET(req: NextRequest) {
  const payload = await getAuthUser(req);
  if (!payload) return NextResponse.json({ authenticated: false }, { status: 401 });

  await connectDB();
  const existing = await PushSubscription.findOne({ userId: payload.userId }).lean();
  return NextResponse.json({
    authenticated: true,
    subscribed: Boolean(existing),
    publicKey: getPublicVapidKey(),
  });
}

export async function POST(req: NextRequest) {
  const payload = await getAuthUser(req);
  if (!payload) return NextResponse.json({ authenticated: false }, { status: 401 });

  const body = await req.json();
  const subscription = body?.subscription;
  const userAgent = typeof body?.userAgent === 'string' ? body.userAgent : undefined;

  const endpoint = typeof subscription?.endpoint === 'string' ? subscription.endpoint : null;
  const p256dh = typeof subscription?.keys?.p256dh === 'string' ? subscription.keys.p256dh : null;
  const auth = typeof subscription?.keys?.auth === 'string' ? subscription.keys.auth : null;

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  await connectDB();

  await PushSubscription.findOneAndUpdate(
    { userId: payload.userId, endpoint },
    { $set: { keys: { p256dh, auth }, userAgent } },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const payload = await getAuthUser(req);
  if (!payload) return NextResponse.json({ authenticated: false }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const endpoint = typeof body?.endpoint === 'string' ? body.endpoint : null;

  await connectDB();
  if (endpoint) {
    await PushSubscription.deleteOne({ userId: payload.userId, endpoint });
  } else {
    await PushSubscription.deleteMany({ userId: payload.userId });
  }
  return NextResponse.json({ success: true });
}

