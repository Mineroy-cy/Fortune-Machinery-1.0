import express from 'express';
import Subscription from '../models/Subscription.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if already subscribed
    const existingSubscription = await Subscription.findOne({ email: email.toLowerCase() });
    
    if (existingSubscription) {
      if (existingSubscription.is_active) {
        return res.status(400).json({ error: 'Email is already subscribed' });
      } else {
        // Reactivate subscription
        existingSubscription.is_active = true;
        existingSubscription.unsubscribed_at = null;
        await existingSubscription.save();
        return res.json({ message: 'Subscription reactivated successfully' });
      }
    }

    // Create new subscription
    const subscription = await Subscription.create({ email: email.toLowerCase() });
    
    res.status(201).json({ 
      message: 'Subscribed successfully',
      subscription: {
        id: subscription._id,
        email: subscription.email,
        subscribed_at: subscription.subscribed_at
      }
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const subscription = await Subscription.findOne({ email: email.toLowerCase() });
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    subscription.is_active = false;
    subscription.unsubscribed_at = new Date();
    await subscription.save();
    
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Admin: Get all subscriptions
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .sort({ subscribed_at: -1 })
      .lean();
    
    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Admin: Get subscription stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ is_active: true });
    const thisMonthSubscriptions = await Subscription.countDocuments({
      subscribed_at: { 
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
      }
    });
    
    res.json({
      total: totalSubscriptions,
      active: activeSubscriptions,
      thisMonth: thisMonthSubscriptions
    });
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    res.status(500).json({ error: 'Failed to fetch subscription stats' });
  }
});

// Admin: Delete subscription
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

export default router; 