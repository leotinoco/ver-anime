import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWatchProgress extends Document {
  userId: string;
  animeSlug: string;
  episodeNumber: number;
  watchedAt: Date;
  completed: boolean;
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
  watchedAt: {
    type: Date,
    default: Date.now,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  lastPosition: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

// Compound index so a user only has one progress record per anime episode
WatchProgressSchema.index({ userId: 1, animeSlug: 1, episodeNumber: 1 }, { unique: true });

export const WatchProgress: Model<IWatchProgress> = mongoose.models.WatchProgress || mongoose.model<IWatchProgress>('WatchProgress', WatchProgressSchema);
