import express from 'express';
import Partner from '../models/Partner.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateCreatePartner, validateUpdatePartner } from '../middleware/validation.js';

const router = express.Router();

// Public: Get all partners
router.get('/', async (req, res) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 }).lean();
    res.json(partners);
  } catch (err) {
    console.error('Error fetching partners:', err);
    res.status(500).json({ error: 'Failed to fetch partners' });
  }
});

// Admin: Create partner
router.post('/', authenticateToken, requireAdmin, validateCreatePartner, async (req, res) => {
  try {
    const partner = await Partner.create(req.body);
    res.status(201).json(partner);
  } catch (err) {
    console.error('Error creating partner:', err);
    res.status(500).json({ error: 'Failed to create partner' });
  }
});

// Admin: Update partner
router.put('/:id', authenticateToken, requireAdmin, validateUpdatePartner, async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!partner) return res.status(404).json({ error: 'Partner not found' });
    res.json(partner);
  } catch (err) {
    console.error('Error updating partner:', err);
    res.status(500).json({ error: 'Failed to update partner' });
  }
});

// Admin: Delete partner
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) return res.status(404).json({ error: 'Partner not found' });
    res.json({ success: true, message: 'Partner deleted' });
  } catch (err) {
    console.error('Error deleting partner:', err);
    res.status(500).json({ error: 'Failed to delete partner' });
  }
});

export default router; 