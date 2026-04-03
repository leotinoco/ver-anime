import mongoose, { Schema, Document, Model } from "mongoose";

export type PushNotificationType = "new_episode" | "favorites_reminder";
export type PushNotificationInteraction = "opened" | "dismissed";

export interface IPushNotificationLog extends Document {
  userId: string;
  type: PushNotificationType;
  animeSlug: string;
  episodeNumber?: number;
  title: string;
  body: string;
  image?: string;
  url: string;
  sentAt: Date;
  openedAt?: Date;
  dismissedAt?: Date;
  sendStatus: "sent" | "failed";
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PushNotificationLogSchema = new Schema<IPushNotificationLog>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["new_episode", "favorites_reminder"],
      required: true,
      index: true,
    },
    animeSlug: { type: String, required: true, index: true },
    episodeNumber: { type: Number },
    title: { type: String, required: true },
    body: { type: String, required: true },
    image: { type: String },
    url: { type: String, required: true },
    sentAt: { type: Date, required: true, index: true },
    openedAt: { type: Date },
    dismissedAt: { type: Date },
    sendStatus: {
      type: String,
      enum: ["sent", "failed"],
      required: true,
      index: true,
    },
    error: { type: String },
  },
  { timestamps: true },
);

PushNotificationLogSchema.index({ userId: 1, animeSlug: 1, sentAt: -1 });

export const PushNotificationLog: Model<IPushNotificationLog> =
  mongoose.models.PushNotificationLog ||
  mongoose.model<IPushNotificationLog>(
    "PushNotificationLog",
    PushNotificationLogSchema,
  );
