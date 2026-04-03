import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotificationPreferences extends Document {
  userId: string;
  newEpisodeEnabled: boolean;
  favoritesReminderEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    newEpisodeEnabled: { type: Boolean, default: true },
    favoritesReminderEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const NotificationPreferences: Model<INotificationPreferences> =
  mongoose.models.NotificationPreferences ||
  mongoose.model<INotificationPreferences>('NotificationPreferences', NotificationPreferencesSchema);

