import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    default: null
  },
  company: {
    type: String,
    default: null
  },
  category: {
    type: String,
    default: null
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'read', 'resolved'],
    default: 'new'
  },
  responded: {
    type: Boolean,
    default: false
  },
  respondedAt: {
    type: Date,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

contactSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
