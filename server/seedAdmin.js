import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists');
      return process.exit(0);
    }

    const admin = new Admin({
      username: 'admin',
      password: 'admin123'  // Will be hashed automatically
    });

    await admin.save();
    console.log('✅ Admin created: username="admin", password="admin123"');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed admin:', err);
    process.exit(1);
  }
};

seedAdmin();
