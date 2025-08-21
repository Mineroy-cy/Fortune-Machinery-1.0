import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String }, // rich or plain text
  cover_image: {
    url: String,
    public_id: String
  },
  video_thumbnail: {
    url: String,
    public_id: String
  },
  demo_video: {
    url: String,
    public_id: String
  },
  gallery_images: [
    {
      url: String,
      public_id: String
    }
  ],
  specifications: [String],
  features: [String],
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true },
  is_featured: { type: Boolean, default: false },
  is_new: { type: Boolean, default: false },
  price: { type: String },
}, { 
  timestamps: true 
});

export default mongoose.model('Machine', machineSchema);
