import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema({
  description: { type: String, required: true },
  whyChooseUs: [{ type: String, required: true }],
  images: [
    {
      url: { type: String },
      public_id: { type: String },
    }
  ],
}, { timestamps: true });

export default mongoose.model('About', aboutSchema); 