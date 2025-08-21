import express from 'express';
import PageSettings from '../models/PageSettings.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();

// Get all page settings
router.get('/', async (req, res) => {
  try {
    const settings = await PageSettings.find().sort('page');
    res.json(settings);
  } catch (err) {
    console.error('Error fetching page settings:', err);
    res.status(500).json({ error: 'Failed to fetch page settings' });
  }
});

// Get settings for a specific page
router.get('/:page', async (req, res) => {
  try {
    const setting = await PageSettings.findOne({ page: req.params.page });
    if (!setting) {
      return res.status(404).json({ error: 'Page settings not found' });
    }
    res.json(setting);
  } catch (err) {
    console.error('Error fetching page setting:', err);
    res.status(500).json({ error: 'Failed to fetch page setting' });
  }
});

// Create or update page settings (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page, background_image, title, subtitle, is_active } = req.body;

    if (!background_image?.url || !background_image?.public_id) {
      return res.status(400).json({ error: 'Background image is required' });
    }

    // Check if settings exist for this page
    let setting = await PageSettings.findOne({ page });
    
    if (setting) {
      // Update existing settings
      if (setting.background_image?.public_id !== background_image.public_id) {
        // Delete old image from Cloudinary
        if (setting.background_image?.public_id) {
          await cloudinary.uploader.destroy(setting.background_image.public_id);
        }
      }
      
      setting.background_image = background_image;
      setting.title = title;
      setting.subtitle = subtitle;
      setting.is_active = is_active;
      await setting.save();
    } else {
      // Create new settings
      setting = await PageSettings.create({
        page,
        background_image,
        title,
        subtitle,
        is_active
      });
    }

    res.status(201).json(setting);
  } catch (err) {
    console.error('Error saving page settings:', err);
    res.status(500).json({ error: 'Failed to save page settings' });
  }
});

// Update page settings (Admin only)
router.put('/:page', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { background_image, title, subtitle, is_active } = req.body;
    
    const setting = await PageSettings.findOne({ page: req.params.page });
    if (!setting) {
      return res.status(404).json({ error: 'Page settings not found' });
    }

    // Handle image replacement
    if (background_image?.url && background_image?.public_id && 
        background_image.public_id !== setting.background_image?.public_id) {
      if (setting.background_image?.public_id) {
        await cloudinary.uploader.destroy(setting.background_image.public_id);
      }
      setting.background_image = background_image;
    }

    setting.title = title;
    setting.subtitle = subtitle;
    setting.is_active = is_active;
    await setting.save();

    res.json(setting);
  } catch (err) {
    console.error('Error updating page settings:', err);
    res.status(500).json({ error: 'Failed to update page settings' });
  }
});

// Delete page settings (Admin only)
router.delete('/:page', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const setting = await PageSettings.findOneAndDelete({ page: req.params.page });
    if (!setting) {
      return res.status(404).json({ error: 'Page settings not found' });
    }

    // Delete image from Cloudinary
    if (setting.background_image?.public_id) {
      await cloudinary.uploader.destroy(setting.background_image.public_id);
    }

    res.json({ success: true, message: 'Page settings deleted' });
  } catch (err) {
    console.error('Error deleting page settings:', err);
    res.status(500).json({ error: 'Failed to delete page settings' });
  }
});

// Upload background image (Admin only)
router.post('/upload-background', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { image_base64, page } = req.body;
    if (!image_base64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    console.log('📤 Starting background image upload for page:', page);
    console.log('📊 Image data size:', image_base64.length, 'characters');

    // Set a longer timeout for large image uploads
    const uploadOptions = { 
      folder: `page-backgrounds/${page}`,
      timeout: 120000, // 2 minutes timeout
      resource_type: 'image',
      // Optimize the image
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    };

    console.log('🔄 Uploading to Cloudinary with options:', uploadOptions);

    const result = await cloudinary.uploader.upload(image_base64, uploadOptions);
    
    console.log('✅ Background image uploaded successfully:', {
      url: result.secure_url,
      public_id: result.public_id,
      size: result.bytes
    });
    
    res.status(201).json({ 
      url: result.secure_url, 
      public_id: result.public_id 
    });
  } catch (error) {
    console.error('❌ Background image upload failed:', error);
    
    // Provide more specific error messages
    if (error.http_code === 499) {
      res.status(408).json({ 
        error: 'Upload timeout - image may be too large. Please try a smaller image or check your connection.' 
      });
    } else if (error.http_code === 400) {
      res.status(400).json({ 
        error: 'Invalid image format. Please use JPG, PNG, or WebP format.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Image upload failed', 
        details: error.message 
      });
    }
  }
});

export default router; 