import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { PushNotificationLog } from "@/models/PushNotificationLog";

async function getAuthUser(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  if (!session) return null;
  return decrypt(session);
}

export async function POST(req: NextRequest) {
  const payload = await getAuthUser(req);
  if (!payload)
    return NextResponse.json({ authenticated: false }, { status: 401 });

  const body = await req.json().catch(() => null);
  const notificationId =
    typeof body?.notificationId === "string" ? body.notificationId : null;
  const action =
    body?.action === "opened" || body?.action === "dismissed"
      ? body.action
      : null;

  if (!notificationId || !action) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await connectDB();
  const now = new Date();

  if (action === "opened") {
    await PushNotificationLog.updateOne(
      { _id: notificationId, userId: payload.userId },
      { $set: { openedAt: now } },
    );
  } else {
    await PushNotificationLog.updateOne(
      { _id: notificationId, userId: payload.userId },
      { $set: { dismissedAt: now } },
    );
  }

  return NextResponse.json({ success: true });
}
