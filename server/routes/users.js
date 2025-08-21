import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateCreateUser, validateUpdateUser } from '../middleware/validation.js';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();

// User Registration
router.post('/register', validateCreateUser, async (req, res) => {
  try {
    const { name, email, password, phone, company } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      company
    });

    // Create empty cart for user
    await Cart.create({ user_id: user._id });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update User Profile
router.put('/profile', authenticateToken, validateUpdateUser, async (req, res) => {
  try {
    const { name, phone, company, address } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (company) user.company = company;
    if (address) user.address = address;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload Profile Image
router.post('/profile/image', authenticateToken, async (req, res) => {
  try {
    const { image_base64 } = req.body;
    if (!image_base64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete old image if exists
    if (user.profile_image?.public_id) {
      await cloudinary.uploader.destroy(user.profile_image.public_id);
    }

    // Upload new image
    const result = await cloudinary.uploader.upload(image_base64, { 
      folder: 'user-profiles',
      transformation: [
        { width: 400, height: 400, crop: 'fill' },
        { quality: 'auto:good' }
      ]
    });

    user.profile_image = {
      url: result.secure_url,
      public_id: result.public_id
    };

    await user.save();

    res.json({
      message: 'Profile image updated successfully',
      profile_image: user.profile_image
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
});

// Get User Cart
router.get('/cart', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user.userId })
      .populate({
        path: 'items.machine_id',
        select: 'name description cover_image price is_featured is_new category_id subcategory_id'
      });

    if (!cart) {
      // Create empty cart if doesn't exist
      const newCart = await Cart.create({ user_id: req.user.userId });
      return res.json(newCart);
    }

    res.json(cart);
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add Item to Cart
router.post('/cart/add', authenticateToken, async (req, res) => {
  try {
    const { machine_id, quantity = 1 } = req.body;

    if (!machine_id) {
      return res.status(400).json({ error: 'Machine ID is required' });
    }

    let cart = await Cart.findOne({ user_id: req.user.userId });

    if (!cart) {
      cart = await Cart.create({ user_id: req.user.userId });
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(item => 
      item.machine_id.toString() === machine_id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ machine_id, quantity });
    }

    await cart.save();

    // Populate machine details
    await cart.populate({
      path: 'items.machine_id',
      select: 'name description cover_image price is_featured is_new category_id subcategory_id'
    });

    res.json({
      message: 'Item added to cart successfully',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update Cart Item Quantity
router.put('/cart/update/:itemId', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user_id: req.user.userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();

    await cart.populate({
      path: 'items.machine_id',
      select: 'name description cover_image price is_featured is_new category_id subcategory_id'
    });

    res.json({
      message: 'Cart updated successfully',
      cart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove Item from Cart
router.delete('/cart/remove/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user_id: req.user.userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    await cart.populate({
      path: 'items.machine_id',
      select: 'name description cover_image price is_featured is_new category_id subcategory_id'
    });

    res.json({
      message: 'Item removed from cart successfully',
      cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear Cart
router.delete('/cart/clear', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user.userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router; 