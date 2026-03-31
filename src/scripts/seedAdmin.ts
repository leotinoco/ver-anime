import 'dotenv/config'; // Used for the script execution context
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error('DATABASE_URL must be defined');
  process.exit(1);
}

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to Database');

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@Anime Fan.local';
    const adminPassword = process.env.ADMIN_PASSWORD || '123456';

    const existingAdmin = await User.findOne({ username: adminUsername });

    if (existingAdmin) {
      console.log('Admin user already exists. Skipping seed.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const newAdmin = new User({
      username: adminUsername,
      email: adminEmail,
      passwordHash,
      role: 'admin',
      createdBy: 'system', // the original seed is created by the system
    });

    await newAdmin.save();
    console.log(`Admin user created successfully: ${adminUsername} / ${adminEmail}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
