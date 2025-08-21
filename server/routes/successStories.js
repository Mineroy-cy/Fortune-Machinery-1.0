import express from 'express';
import SuccessStory from '../models/SuccessStory.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateCreateSuccessStory, validateUpdateSuccessStory } from '../middleware/validation.js';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();

// Public: Get approved success stories only
router.get('/', async (req, res) => {
  try {
    // Show admin-created stories (no user_id) OR approved user stories (user_id exists and is_approved: true)
    const stories = await SuccessStory.find({
      $or: [
        { user_id: { $exists: false } }, // Admin-created stories
        { user_id: { $exists: true }, is_approved: true } // Approved user stories
      ]
    }).sort({ createdAt: -1 }).lean();
    res.json(stories);
  } catch (err) {
    console.error('Error fetching success stories:', err);
    res.status(500).json({ error: 'Failed to fetch success stories' });
  }
});

// Admin: Create success story
router.post('/', authenticateToken, requireAdmin, validateCreateSuccessStory, async (req, res) => {
  try {
    console.log('📦 Creating success story with payload:', JSON.stringify(req.body, null, 2));
    
    const storyData = {
      ...req.body,
      is_approved: true, // Admin stories are automatically approved
      // Don't include user_id for admin-created stories
    };
    
    const story = await SuccessStory.create(storyData);
    console.log('✅ Success story created successfully:', story._id);
    res.status(201).json(story);
  } catch (err) {
    console.error('❌ Error creating success story:', err);
    console.error('❌ Error details:', {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to create success story', details: err.message });
  }
});

// Admin: Update success story
router.put('/:id', authenticateToken, requireAdmin, validateUpdateSuccessStory, async (req, res) => {
  try {
    console.log('📦 Updating success story with payload:', JSON.stringify(req.body, null, 2));
    
    const story = await SuccessStory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!story) return res.status(404).json({ error: 'Success story not found' });
    
    console.log('✅ Success story updated successfully:', story._id);
    res.json(story);
  } catch (err) {
    console.error('❌ Error updating success story:', err);
    console.error('❌ Error details:', {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to update success story', details: err.message });
  }
});

// Admin: Delete success story
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const story = await SuccessStory.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ error: 'Success story not found' });
    res.json({ success: true, message: 'Success story deleted' });
  } catch (err) {
    console.error('Error deleting success story:', err);
    res.status(500).json({ error: 'Failed to delete success story' });
  }
});

// Upload success story image
router.post('/upload-image', async (req, res) => {
  try {
    const { image_base64 } = req.body;
    if (!image_base64) return res.status(400).json({ error: 'Image data is required' });

    const result = await cloudinary.uploader.upload(image_base64, { 
      folder: 'success-stories',
      transformation: [
        { quality: 'auto:good' }
      ]
    });
    
    res.status(201).json({ 
      success_image: {
        url: result.secure_url, 
        public_id: result.public_id 
      },
      profile_image: {
        url: result.secure_url, 
        public_id: result.public_id 
      }
    });
  } catch (error) {
    console.error('Success story image upload failed:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// Admin: Get all success stories (including unapproved)
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stories = await SuccessStory.find()
      .populate('user_id', 'name email profile_image')
      .sort({ createdAt: -1 })
      .lean();
    res.json(stories);
  } catch (err) {
    console.error('Error fetching all success stories:', err);
    res.status(500).json({ error: 'Failed to fetch success stories' });
  }
});

// Admin: Approve success story
router.patch('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const story = await SuccessStory.findByIdAndUpdate(
      req.params.id,
      { is_approved: true },
      { new: true }
    ).populate('user_id', 'name email profile_image');

    if (!story) {
      return res.status(404).json({ error: 'Success story not found' });
    }

    res.json({ message: 'Success story approved successfully', story });
  } catch (error) {
    console.error('Error approving success story:', error);
    res.status(500).json({ error: 'Failed to approve success story' });
  }
});

// Admin: Disapprove success story
router.patch('/:id/disapprove', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const story = await SuccessStory.findByIdAndUpdate(
      req.params.id,
      { is_approved: false },
      { new: true }
    ).populate('user_id', 'name email profile_image');

    if (!story) {
      return res.status(404).json({ error: 'Success story not found' });
    }

    res.json({ message: 'Success story disapproved successfully', story });
  } catch (error) {
    console.error('Error disapproving success story:', error);
    res.status(500).json({ error: 'Failed to disapprove success story' });
  }
});

// Public: Get approved user success stories only
router.get('/user-stories', async (req, res) => {
  try {
    const stories = await SuccessStory.find({ 
      user_id: { $exists: true }, 
      is_approved: true 
    })
      .populate('user_id', 'name profile_image')
      .sort({ createdAt: -1 })
      .lean();
    res.json(stories);
  } catch (err) {
    console.error('Error fetching user success stories:', err);
    res.status(500).json({ error: 'Failed to fetch user success stories' });
  }
});

// User: Submit success story
router.post('/user-submit', authenticateToken, async (req, res) => {
  try {
    const storyData = {
      ...req.body,
      user_id: req.user.userId,
      is_approved: false // Always require admin approval
    };
    
    const story = await SuccessStory.create(storyData);
    await story.populate('user_id', 'name email profile_image');
    
    res.status(201).json({
      message: 'Success story submitted successfully. It will be reviewed by our team.',
      story
    });
  } catch (error) {
    console.error('Error submitting success story:', error);
    res.status(500).json({ error: 'Failed to submit success story' });
  }
});

export default router; 