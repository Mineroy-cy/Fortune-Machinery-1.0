// models/video.js
import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  video: {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  thumbnail: {
    url: { type: String },
    public_id: { type: String },
  },
  machine_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: true,
  },
  duration: { type: String },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isHighlighted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model('Video', videoSchema);
