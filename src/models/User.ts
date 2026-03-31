import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: Date;
  createdBy: string; // ID of the admin who created the account
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  avatar: {
    type: String,
    default: null,
  },
  createdBy: {
    type: String,
    required: true, // we assume an admin creates ALL users (even themselves via seed)
  },
}, { timestamps: true });

// Prevent mongoose from compiling the model multiple times in Next.js
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
