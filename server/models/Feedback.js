import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true,
    maxlength: 1000
  },
  likes: [{
    user_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }
  }],
  dislikes: [{
    user_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }
  }],
  created_at: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: true });

const feedbackSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  profile_image: {
    url: { type: String },
    public_id: { type: String }
  },
  is_approved: { 
    type: Boolean, 
    default: false 
  },
  likes: [{
    user_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }
  }],
  dislikes: [{
    user_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }
  }],
  replies: [replySchema],
  created_at: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true,
  collection: 'feedback'
});

// Virtual for total likes
feedbackSchema.virtual('totalLikes').get(function() {
  return this.likes.length;
});

// Virtual for total dislikes
feedbackSchema.virtual('totalDislikes').get(function() {
  return this.dislikes.length;
});

// Virtual for total replies
feedbackSchema.virtual('totalReplies').get(function() {
  return this.replies.length;
});

// Ensure virtuals are included in JSON
feedbackSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Feedback', feedbackSchema); 