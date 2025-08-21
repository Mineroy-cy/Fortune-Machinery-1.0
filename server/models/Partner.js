import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  website: { type: String },
}, { 
  timestamps: true,
  // Ensure no conflicts with existing indexes
  strict: true,
  // Explicitly set collection name to avoid conflicts
  collection: 'partners'
});

// Remove any problematic indexes that might exist
partnerSchema.on('index', function(error) {
  if (error) {
    console.log('⚠️ Partner index creation warning:', error.message);
  }
});

export default mongoose.model('Partner', partnerSchema);