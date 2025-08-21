import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  validateCreateMachine,
  validateUpdateMachine,
} from '../middleware/validation.js';
import Machine from '../models/Machine.js';

const router = express.Router();

// GET all machines
router.get('/', async (req, res) => {
  try {
    const machines = await Machine.find()
      .populate('category_id', 'name')
      .populate('subcategory_id', 'name')
      .sort({ created_at: -1 })
      .lean();
    res.json(machines);
  } catch (err) {
    console.error('Error fetching machines:', err);
    res.status(500).json({ error: 'Failed to fetch machines' });
  }
});

// GET single machine
router.get('/:id', async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id)
      .populate('category_id', 'name')
      .populate('subcategory_id', 'name')
      .lean();
    if (!machine) return res.status(404).json({ error: 'Machine not found' });
    res.json(machine);
  } catch (err) {
    console.error('Error fetching machine:', err);
    res.status(500).json({ error: 'Failed to fetch machine' });
  }
});

// CREATE machine (media already uploaded, just store URLs)
router.post('/', authenticateToken, requireAdmin, validateCreateMachine, async (req, res) => {
  try {
    console.log('📦 Creating machine with payload:', JSON.stringify(req.body, null, 2));
    
    const {
      name, description, category_id, subcategory_id, price,
      cover_image, demo_video, gallery_images = [], video_thumbnail,
      specifications = [], features = [], is_new = false, is_featured = false
    } = req.body;

    // Validate required fields
    if (!name || !category_id || !subcategory_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, category_id, and subcategory_id are required' 
      });
    }

    const machineData = {
      name: name.trim(),
      description: description?.trim() || '',
      category_id,
      subcategory_id,
      price: price?.trim() || '',
      cover_image: cover_image || null,
      demo_video: demo_video || null,
      video_thumbnail: video_thumbnail || null,
      gallery_images: Array.isArray(gallery_images) ? gallery_images : [],
      specifications: Array.isArray(specifications) ? specifications : [],
      features: Array.isArray(features) ? features : [],
      is_new: Boolean(is_new),
      is_featured: Boolean(is_featured),
    };

    console.log('🔧 Machine data to create:', JSON.stringify(machineData, null, 2));

    const machine = await Machine.create(machineData);
    console.log('✅ Machine created successfully:', machine._id);
    
    // Populate category and subcategory names for response
    const populatedMachine = await Machine.findById(machine._id)
      .populate('category_id', 'name')
      .populate('subcategory_id', 'name')
      .lean();
    
    res.status(201).json(populatedMachine);
  } catch (err) {
    console.error('❌ Error creating machine:', err);
    console.error('❌ Error details:', {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to create machine', details: err.message });
  }
});

// UPDATE machine (media already uploaded, just store URLs)
router.put('/:id', authenticateToken, requireAdmin, validateUpdateMachine, async (req, res) => {
  try {
    const existing = await Machine.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Machine not found' });

    const {
      name, description, category_id, subcategory_id, price,
      cover_image, demo_video, gallery_images = [], video_thumbnail,
      specifications = [], features = [], is_new = false, is_featured = false
    } = req.body;

    // Validate required fields
    if (!name || !category_id || !subcategory_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, category_id, and subcategory_id are required' 
      });
    }

    existing.name = name.trim();
    existing.description = description?.trim() || '';
    existing.category_id = category_id;
    existing.subcategory_id = subcategory_id;
    existing.price = price?.trim() || '';
    existing.cover_image = cover_image || null;
    existing.demo_video = demo_video || null;
    existing.video_thumbnail = video_thumbnail || null;
    existing.gallery_images = Array.isArray(gallery_images) ? gallery_images : [];
    existing.specifications = Array.isArray(specifications) ? specifications : [];
    existing.features = Array.isArray(features) ? features : [];
    existing.is_new = Boolean(is_new);
    existing.is_featured = Boolean(is_featured);
    
    await existing.save();
    
    // Populate category and subcategory names for response
    const updatedMachine = await Machine.findById(existing._id)
      .populate('category_id', 'name')
      .populate('subcategory_id', 'name')
      .lean();
    
    res.json(updatedMachine);
  } catch (err) {
    console.error('Error updating machine:', err);
    res.status(500).json({ error: 'Failed to update machine', details: err.message });
  }
});

// DELETE machine
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const machine = await Machine.findByIdAndDelete(req.params.id);
    if (!machine) return res.status(404).json({ error: 'Machine not found' });
    // Optionally, you could delete media from Cloudinary here if desired
    res.json({ success: true, message: 'Machine deleted successfully' });
  } catch (err) {
    console.error('Error deleting machine:', err);
    res.status(500).json({ error: 'Failed to delete machine' });
  }
});

export default router;
