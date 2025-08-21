import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  description: String,
  image: {
    url: String,
    public_id: String
  }
}, { 
  timestamps: true 
});

export default mongoose.model('Subcategory', subcategorySchema);