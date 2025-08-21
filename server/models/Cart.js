import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  machine_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Machine', 
    required: true 
  },
  quantity: { 
    type: Number, 
    default: 1,
    min: 1
  },
  added_at: { 
    type: Date, 
    default: Date.now 
  }
});

const cartSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true,
  collection: 'carts'
});

// Update the updated_at field when items change
cartSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Virtual for total items count
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Ensure virtuals are included in JSON
cartSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Cart', cartSchema); 