import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEpisodePublication extends Document {
  animeSlug: string;
  episodeNumber: number;
  title?: string;
  cover?: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EpisodePublicationSchema = new Schema<IEpisodePublication>(
  {
    animeSlug: { type: String, required: true, index: true },
    episodeNumber: { type: Number, required: true, index: true },
    title: { type: String },
    cover: { type: String },
    firstSeenAt: { type: Date, required: true, index: true },
    lastSeenAt: { type: Date, required: true },
  },
  { timestamps: true }
);

EpisodePublicationSchema.index({ animeSlug: 1, episodeNumber: 1 }, { unique: true });

export const EpisodePublication: Model<IEpisodePublication> =
  mongoose.models.EpisodePublication || mongoose.model<IEpisodePublication>('EpisodePublication', EpisodePublicationSchema);

