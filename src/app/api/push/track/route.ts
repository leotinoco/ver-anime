import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import { PushNotificationLog } from '@/models/PushNotificationLog';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const notificationId = typeof body?.notificationId === 'string' ? body.notificationId : null;
  const action = body?.action === 'opened' || body?.action === 'dismissed' ? body.action : null;

  if (!notificationId || !action) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  await connectDB();
  const now = new Date();

  if (action === 'opened') {
    await PushNotificationLog.updateOne({ _id: notificationId }, { $set: { openedAt: now } });
  } else {
    await PushNotificationLog.updateOne({ _id: notificationId }, { $set: { dismissedAt: now } });
  }

  return NextResponse.json({ success: true });
}

