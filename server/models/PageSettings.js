import mongoose from 'mongoose';

const pageSettingsSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    unique: true,
    enum: ['home', 'about', 'contact', 'products', 'videos', 'success-stories']
  },
  background_image: {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  title: { type: String },
  subtitle: { type: String },
  is_active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('PageSettings', pageSettingsSchema); 