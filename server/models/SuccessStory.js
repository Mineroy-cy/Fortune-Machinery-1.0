import mongoose from 'mongoose';

const successStorySchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  title: { type: String },
  user_name: { type: String, required: true },
  company: { type: String },
  description: { type: String, required: true },
  success_image: {
    url: { type: String },
    public_id: { type: String },
  },
  profile_image: {
    url: { type: String },
    public_id: { type: String },
  },
  rating: { type: Number, default: 5 },
  is_approved: { 
    type: Boolean, 
    default: false 
  },
}, { 
  timestamps: true,
  // Ensure no conflicts with existing indexes
  strict: true,
  // Explicitly set collection name to avoid conflicts
  collection: 'successstories'
});

// Remove any problematic indexes that might exist
successStorySchema.on('index', function(error) {
  if (error) {
    console.log('⚠️ Index creation warning:', error.message);
  }
});

export default mongoose.model('SuccessStory', successStorySchema);