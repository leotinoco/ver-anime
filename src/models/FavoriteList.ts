import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFavoriteList extends Document {
  userId: string;
  name: string; // The custom name of the user's list
  animes: Array<{
    slug: string;
    title: string;
    cover: string;
    addedAt: Date;
  }>;
}

const FavoriteListSchema = new Schema<IFavoriteList>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  animes: [
    {
      slug: { type: String, required: true },
      title: { type: String, required: true },
      cover: { type: String, required: true },
      addedAt: { type: Date, default: Date.now },
    }
  ]
}, { timestamps: true });

// Prevent duplicate logic using Mongoose pre save hook. 
// A user should not have more than 3 lists. We'll handle this at the API route level as well, but can add validation here.

export const FavoriteList: Model<IFavoriteList> = mongoose.models.FavoriteList || mongoose.model<IFavoriteList>('FavoriteList', FavoriteListSchema);
