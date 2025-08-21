import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  is_active: { 
    type: Boolean, 
    default: true 
  },
  subscribed_at: { 
    type: Date, 
    default: Date.now 
  },
  unsubscribed_at: { 
    type: Date 
  }
}, { 
  timestamps: true,
  collection: 'subscriptions'
});

export default mongoose.model('Subscription', subscriptionSchema); 