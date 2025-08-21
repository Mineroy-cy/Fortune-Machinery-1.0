import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  subcategories: {
    type: [String],  
    default: []      // this is important!
  },
}, { 
  timestamps: true,
  strict: false,
});

export default mongoose.model('Category', categorySchema);