import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import colors from 'colors';

//import mongoose from 'mongoose';

//import routes
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import machineRoutes from './routes/machines.js';
import videoRoutes from './routes/videos.js';
import mediaRoutes from './routes/media.js';
import statsRoutes from './routes/admin.js';
import partnersRoute from './routes/partners.js';
import successStoriesRoute from './routes/successStories.js';
import aboutRoute from './routes/about.js';
import contactRoutes from './routes/contact.js';
import settingsRoutes from './routes/settings.js';
import subscriptionRoutes from './routes/subscriptions.js';
import userRoutes from './routes/users.js';
import feedbackRoutes from './routes/feedback.js';
import proxyRoutes from './routes/proxy.js';

console.log('Registering routes...');

// MongoDB connection (from external file)
import connectDB from './config/db.js';

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Helmet security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      mediaSrc: ["'self'", "blob:"],
    },
  },
}));

// Rate limiter (optional)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
// });
// app.use('/api', limiter);

// CORS setup (no cookies)
app.use(cors({
  origin: 'http://localhost:5173',
}));

// Logging
app.use(morgan('dev'));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
 app.use('/api/auth', authRoutes);
 app.use('/api/categories', categoryRoutes);
 app.use('/api/machines', machineRoutes);
app.use('/api/videos', videoRoutes);
 app.use('/api/media', mediaRoutes);
 app.use('/api/admin', statsRoutes);
 app.use('/api/partners', partnersRoute);
 app.use('/api/success-stories', successStoriesRoute);
 app.use('/api/about', aboutRoute);
 app.use('/api/contact', contactRoutes);
 
 // Settings routes with extended timeout for large uploads
 app.use('/api/settings', (req, res, next) => {
   // Set timeout to 3 minutes for settings routes
   req.setTimeout(180000);
   res.setTimeout(180000);
   next();
 }, settingsRoutes);
 
 app.use('/api/subscriptions', subscriptionRoutes);
 app.use('/api/users', userRoutes);
 app.use('/api/feedback', feedbackRoutes);
 app.use('/api/proxy', proxyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'File too large' });
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});