// Express & Dependencies
import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

// Mongoose Models
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Machine from '../models/Machine.js';
import Video from '../models/Videos.js';
import Contact from '../models/Contact.js';
import Partner from '../models/Partner.js';
import SuccessStory from '../models/SuccessStory.js';

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many contact requests. Please try again later.'
});

// Admin Stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalCategories,
      totalSubcategories,
      totalMachines,
      totalVideos,
      totalContacts,
      totalSuccessStories,
      featuredMachines,
      newMachines,
      totalPartners
    ] = await Promise.all([
      Category.countDocuments(),
      Subcategory.countDocuments(),
      Machine.countDocuments(),
      Video.countDocuments(),
      Contact.countDocuments(),
      SuccessStory.countDocuments(),
      Machine.countDocuments({ is_featured: true }),
      Machine.countDocuments({ is_new: true }),
      Partner.countDocuments()
    ]);

    const recentActivity = {
      machines: await Machine.find().sort({ createdAt: -1 }).limit(5).select('name createdAt'),
      videos: await Video.find().sort({ createdAt: -1 }).limit(5).select('title createdAt'),
      contacts: await Contact.find().sort({ createdAt: -1 }).limit(5).select('name subject createdAt'),
      successStories: await SuccessStory.find().sort({ createdAt: -1 }).limit(5).select('title createdAt')
    };

    res.json({
      totalCategories,
      totalSubcategories,
      totalMachines,
      totalVideos,
      totalContacts,
      totalSuccessStories,
      totalPartners,
      featuredMachines,
      newMachines,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;