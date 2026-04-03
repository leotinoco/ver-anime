import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { NotificationPreferences } from "@/models/NotificationPreferences";

async function getAuthUser(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  if (!session) return null;
  return decrypt(session);
}

export async function GET(req: NextRequest) {
  const payload = await getAuthUser(req);
  if (!payload)
    return NextResponse.json({ authenticated: false }, { status: 401 });

  await connectDB();
  const prefs = await NotificationPreferences.findOne({
    userId: payload.userId,
  }).lean();
  return NextResponse.json({
    authenticated: true,
    preferences: {
      newEpisodeEnabled: prefs
        ? Boolean((prefs as { newEpisodeEnabled?: unknown }).newEpisodeEnabled)
        : true,
      favoritesReminderEnabled: prefs
        ? Boolean(
            (prefs as { favoritesReminderEnabled?: unknown })
              .favoritesReminderEnabled,
          )
        : true,
    },
  });
}

export async function POST(req: NextRequest) {
  const payload = await getAuthUser(req);
  if (!payload)
    return NextResponse.json({ authenticated: false }, { status: 401 });

  const body = await req.json();
  const newEpisodeEnabled = body?.newEpisodeEnabled;
  const favoritesReminderEnabled = body?.favoritesReminderEnabled;

  if (
    typeof newEpisodeEnabled !== "boolean" ||
    typeof favoritesReminderEnabled !== "boolean"
  ) {
    return NextResponse.json({ error: "Invalid preferences" }, { status: 400 });
  }

  await connectDB();
  await NotificationPreferences.findOneAndUpdate(
    { userId: payload.userId },
    { $set: { newEpisodeEnabled, favoritesReminderEnabled } },
    { upsert: true, new: true },
  );

  return NextResponse.json({ success: true });
}
