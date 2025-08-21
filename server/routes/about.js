import express from 'express';
import About from '../models/About.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateCreateAbout, validateUpdateAbout } from '../middleware/validation.js';

const router = express.Router();

// Public: Get about info (return the latest one)
router.get('/', async (req, res) => {
  try {
    const about = await About.findOne().sort({ createdAt: -1 }).lean();
    res.json(about);
  } catch (err) {
    console.error('Error fetching about info:', err);
    res.status(500).json({ error: 'Failed to fetch about info' });
  }
});

// Admin: Create about info
router.post('/', authenticateToken, requireAdmin, validateCreateAbout, async (req, res) => {
  try {
    const about = await About.create(req.body);
    res.status(201).json(about);
  } catch (err) {
    console.error('Error creating about info:', err);
    res.status(500).json({ error: 'Failed to create about info' });
  }
});

// Admin: Update about info (by id)
router.put('/:id', authenticateToken, requireAdmin, validateUpdateAbout, async (req, res) => {
  try {
    const about = await About.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!about) return res.status(404).json({ error: 'About info not found' });
    res.json(about);
  } catch (err) {
    console.error('Error updating about info:', err);
    res.status(500).json({ error: 'Failed to update about info' });
  }
});

// Admin: Delete about info (by id)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const about = await About.findByIdAndDelete(req.params.id);
    if (!about) return res.status(404).json({ error: 'About info not found' });
    res.json({ success: true, message: 'About info deleted' });
  } catch (err) {
    console.error('Error deleting about info:', err);
    res.status(500).json({ error: 'Failed to delete about info' });
  }
});

export default router; 