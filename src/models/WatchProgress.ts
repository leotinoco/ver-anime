import mongoose, { Schema, Document, Model } from 'mongoose';

export type EpisodeStatus = 'pendiente' | 'viendo' | 'visto';

export interface IWatchProgress extends Document {
  userId: string;
  animeSlug: string;
  episodeNumber: number;
  status: EpisodeStatus;
  watchedAt: Date;
  lastPosition?: number; // In seconds
}

const WatchProgressSchema = new Schema<IWatchProgress>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  animeSlug: {
    type: String,
    required: true,
    index: true,
  },
  episodeNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pendiente', 'viendo', 'visto'],
    default: 'pendiente',
  },
  watchedAt: {
    type: Date,
    default: Date.now,
  },
  lastPosition: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

// Compound index so a user only has one progress record per anime episode
WatchProgressSchema.index({ userId: 1, animeSlug: 1, episodeNumber: 1 }, { unique: true });

export const WatchProgress: Model<IWatchProgress> = mongoose.models.WatchProgress || mongoose.model<IWatchProgress>('WatchProgress', WatchProgressSchema);

