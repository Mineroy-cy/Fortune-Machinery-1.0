import express from 'express';
import Feedback from '../models/Feedback.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateCreateFeedback, validateCreateReply } from '../middleware/validation.js';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();

// Public: Get approved feedback/testimonials
router.get('/', async (req, res) => {
  try {
    const feedback = await Feedback.find({ is_approved: true })
      .populate('user_id', 'name profile_image')
      .populate('replies.user_id', 'name profile_image')
      .populate('likes.user_id', 'name')
      .populate('dislikes.user_id', 'name')
      .sort({ created_at: -1 })
      .lean();

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// User: Submit feedback
router.post('/', authenticateToken, validateCreateFeedback, async (req, res) => {
  try {
    const { message, rating, profile_image } = req.body;
    
    const feedback = await Feedback.create({
      user_id: req.user.userId,
      message,
      rating,
      profile_image,
      is_approved: false // Always require admin approval
    });

    // Populate user info
    await feedback.populate('user_id', 'name profile_image');

    res.status(201).json({
      message: 'Feedback submitted successfully. It will be reviewed by our team.',
      feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// User: Upload feedback profile image
router.post('/upload-image', authenticateToken, async (req, res) => {
  try {
    const { image_base64 } = req.body;
    if (!image_base64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const result = await cloudinary.uploader.upload(image_base64, { 
      folder: 'feedback-profiles',
      transformation: [
        { width: 200, height: 200, crop: 'fill' },
        { quality: 'auto:good' }
      ]
    });

    res.json({
      message: 'Profile image uploaded successfully',
      profile_image: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
});

// User: Like/Dislike feedback
router.post('/:feedbackId/like', authenticateToken, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.feedbackId);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const userId = req.user.userId;
    const hasLiked = feedback.likes.some(like => like.user_id.toString() === userId);
    const hasDisliked = feedback.dislikes.some(dislike => dislike.user_id.toString() === userId);

    if (hasLiked) {
      // Remove like
      feedback.likes = feedback.likes.filter(like => like.user_id.toString() !== userId);
    } else {
      // Add like and remove dislike if exists
      feedback.likes.push({ user_id: userId });
      feedback.dislikes = feedback.dislikes.filter(dislike => dislike.user_id.toString() !== userId);
    }

    await feedback.save();
    await feedback.populate('user_id', 'name profile_image');

    res.json({
      message: hasLiked ? 'Like removed' : 'Feedback liked',
      feedback
    });
  } catch (error) {
    console.error('Error liking feedback:', error);
    res.status(500).json({ error: 'Failed to like feedback' });
  }
});

router.post('/:feedbackId/dislike', authenticateToken, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.feedbackId);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const userId = req.user.userId;
    const hasDisliked = feedback.dislikes.some(dislike => dislike.user_id.toString() === userId);
    const hasLiked = feedback.likes.some(like => like.user_id.toString() === userId);

    if (hasDisliked) {
      // Remove dislike
      feedback.dislikes = feedback.dislikes.filter(dislike => dislike.user_id.toString() !== userId);
    } else {
      // Add dislike and remove like if exists
      feedback.dislikes.push({ user_id: userId });
      feedback.likes = feedback.likes.filter(like => like.user_id.toString() !== userId);
    }

    await feedback.save();
    await feedback.populate('user_id', 'name profile_image');

    res.json({
      message: hasDisliked ? 'Dislike removed' : 'Feedback disliked',
      feedback
    });
  } catch (error) {
    console.error('Error disliking feedback:', error);
    res.status(500).json({ error: 'Failed to dislike feedback' });
  }
});

// User: Reply to feedback
router.post('/:feedbackId/reply', authenticateToken, validateCreateReply, async (req, res) => {
  try {
    const { message } = req.body;
    
    const feedback = await Feedback.findById(req.params.feedbackId);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    feedback.replies.push({
      user_id: req.user.userId,
      message
    });

    await feedback.save();
    await feedback.populate('user_id', 'name profile_image');
    await feedback.populate('replies.user_id', 'name profile_image');

    res.json({
      message: 'Reply added successfully',
      feedback
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// User: Like/Dislike reply
router.post('/:feedbackId/replies/:replyId/like', authenticateToken, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.feedbackId);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const reply = feedback.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    const userId = req.user.userId;
    const hasLiked = reply.likes.some(like => like.user_id.toString() === userId);
    const hasDisliked = reply.dislikes.some(dislike => dislike.user_id.toString() === userId);

    if (hasLiked) {
      reply.likes = reply.likes.filter(like => like.user_id.toString() !== userId);
    } else {
      reply.likes.push({ user_id: userId });
      reply.dislikes = reply.dislikes.filter(dislike => dislike.user_id.toString() !== userId);
    }

    await feedback.save();
    await feedback.populate('user_id', 'name profile_image');
    await feedback.populate('replies.user_id', 'name profile_image');

    res.json({
      message: hasLiked ? 'Like removed' : 'Reply liked',
      feedback
    });
  } catch (error) {
    console.error('Error liking reply:', error);
    res.status(500).json({ error: 'Failed to like reply' });
  }
});

router.post('/:feedbackId/replies/:replyId/dislike', authenticateToken, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.feedbackId);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const reply = feedback.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    const userId = req.user.userId;
    const hasDisliked = reply.dislikes.some(dislike => dislike.user_id.toString() === userId);
    const hasLiked = reply.likes.some(like => like.user_id.toString() === userId);

    if (hasDisliked) {
      reply.dislikes = reply.dislikes.filter(dislike => dislike.user_id.toString() !== userId);
    } else {
      reply.dislikes.push({ user_id: userId });
      reply.likes = reply.likes.filter(like => like.user_id.toString() !== userId);
    }

    await feedback.save();
    await feedback.populate('user_id', 'name profile_image');
    await feedback.populate('replies.user_id', 'name profile_image');

    res.json({
      message: hasDisliked ? 'Dislike removed' : 'Reply disliked',
      feedback
    });
  } catch (error) {
    console.error('Error disliking reply:', error);
    res.status(500).json({ error: 'Failed to dislike reply' });
  }
});

// Admin: Get all feedback (including unapproved)
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('user_id', 'name email profile_image')
      .populate('replies.user_id', 'name profile_image')
      .populate('likes.user_id', 'name')
      .populate('dislikes.user_id', 'name')
      .sort({ created_at: -1 })
      .lean();

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching all feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Admin: Approve feedback
router.patch('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { is_approved: true },
      { new: true }
    ).populate('user_id', 'name email profile_image');

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({ message: 'Feedback approved successfully', feedback });
  } catch (error) {
    console.error('Error approving feedback:', error);
    res.status(500).json({ error: 'Failed to approve feedback' });
  }
});

// Admin: Disapprove feedback
router.patch('/:id/disapprove', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { is_approved: false },
      { new: true }
    ).populate('user_id', 'name email profile_image');

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({ message: 'Feedback disapproved successfully', feedback });
  } catch (error) {
    console.error('Error disapproving feedback:', error);
    res.status(500).json({ error: 'Failed to disapprove feedback' });
  }
});

// Admin: Delete feedback
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Delete associated images from Cloudinary
    if (feedback.profile_image?.public_id) {
      await cloudinary.uploader.destroy(feedback.profile_image.public_id);
    }

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

export default router; 