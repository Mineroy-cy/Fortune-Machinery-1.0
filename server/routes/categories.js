import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  validateCreateCategory,
  validateUpdateCategory,
  validateCreateSubcategory,
  validateUpdateSubcategory,
} from '../middleware/validation.js';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();
// GET all subcategories for a specific category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const subcategories = await Subcategory.find({ category_id: req.params.categoryId });
    res.json(subcategories);
  } catch (err) {
    console.error('Error fetching subcategories:', err);
    res.status(500).json({ error: 'Failed to fetch subcategories' });
  }
});

// ✅ Get subcategories for a specific category
router.get('/:categoryId/subcategories', async (req, res) => {
  try {
    const subcategories = await Subcategory.find({ category_id: req.params.categoryId })
      .sort('name')
      .lean();
    res.json(subcategories);
  } catch (err) {
    console.error('Error fetching subcategories:', err);
    res.status(500).json({ error: 'Failed to fetch subcategories' });
  }
});

// ✅ Get all categories with subcategories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort('name').lean();
    const allSubcategories = await Subcategory.find().sort('name').lean();

    const categoriesWithSubs = categories.map(cat => {
      const subcategories = allSubcategories.filter(
        sub => sub.category_id.toString() === cat._id.toString()
      );
      return { ...cat, subcategories };
    });

    res.json(categoriesWithSubs);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ✅ Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const subcategories = await Subcategory.find({ category_id: category._id }).sort('name').lean();
    res.json({ ...category, subcategories });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// ✅ Create category
router.post('/', authenticateToken, requireAdmin, validateCreateCategory, async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!image?.url || !image?.public_id) {
      return res.status(400).json({ error: 'Missing image information' });
    }

    const category = await Category.create({ name, description, image });
    res.status(201).json({ ...category.toObject(), subcategories: [] });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// ✅ Update category
router.put('/:id', authenticateToken, requireAdmin, validateUpdateCategory, async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    // ✅ Handle image replacement
    if (image?.url && image?.public_id && image.public_id !== category.image?.public_id) {
      if (category.image?.public_id) {
        await cloudinary.uploader.destroy(category.image.public_id);
      }
      category.image = image;
    }

    // ✅ Update fields
    category.name = name;
    category.description = description;
    category.updated_at = new Date();

    await category.save();

    const subcategories = await Subcategory.find({ category_id: category._id }).sort('name').lean();
    res.json({ ...category.toObject(), subcategories });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// ✅ Delete category
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    if (category.image?.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }

    await Subcategory.deleteMany({ category_id: req.params.id });
    res.json({ success: true, message: 'Category and its subcategories deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ✅ Upload category image
router.post('/upload/category-image', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { image_base64 } = req.body;
    if (!image_base64) return res.status(400).json({ error: 'Image data is required' });

    const result = await cloudinary.uploader.upload(image_base64, { folder: 'categories' });
    res.status(201).json({ url: result.secure_url, public_id: result.public_id });
  } catch (error) {
    console.error('Category image upload failed:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// ✅ Upload subcategory image
router.post('/upload-subcategory-image', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { image_base64 } = req.body;
    if (!image_base64) return res.status(400).json({ error: 'Image data is required' });

    const result = await cloudinary.uploader.upload(image_base64, { folder: 'subcategories' });
    res.status(201).json({ url: result.secure_url, public_id: result.public_id });
  } catch (error) {
    console.error('Subcategory image upload failed:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});


// ✅ Create subcategory
router.post(
  '/:categoryId/subcategories',
  authenticateToken,
  requireAdmin,
  validateCreateSubcategory,
  async (req, res) => {
    try {
      const { name, description, image } = req.body;

      const subcategory = await Subcategory.create({
        name,
        description,
        image,
        category_id: req.params.categoryId,
      });

      res.status(201).json(subcategory);
    } catch (err) {
      console.error('Error creating subcategory:', err);
      res.status(500).json({ error: 'Failed to create subcategory' });
    }
  }
);

// ✅ Update subcategory
// ✅ Update subcategory (refactored to avoid .save)
router.put(
  '/:categoryId/subcategories/:subId',
  authenticateToken,
  requireAdmin,
  validateUpdateSubcategory,
  async (req, res) => {
    try {
      const { name, description, image } = req.body;

      const subcategory = await Subcategory.findById(req.params.subId);
      if (!subcategory) return res.status(404).json({ error: 'Subcategory not found' });

      let updatedImage = subcategory.image;

      // Replace image only if new and different
      if (
        image?.url &&
        image?.public_id &&
        image.public_id !== subcategory.image?.public_id
      ) {
        if (subcategory.image?.public_id) {
          await cloudinary.uploader.destroy(subcategory.image.public_id);
        }
        updatedImage = image;
      }

      const updatedSubcategory = await Subcategory.findByIdAndUpdate(
        req.params.subId,
        {
          name,
          description,
          image: updatedImage,
          updated_at: new Date(),
        },
        { new: true }
      );

      res.json(updatedSubcategory);
    } catch (err) {
      console.error('Error updating subcategory:', err);
      res.status(500).json({ error: 'Failed to update subcategory' });
    }
  }
);

// ✅ Delete subcategory
router.delete(
  '/:categoryId/subcategories/:subId',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const subcategory = await Subcategory.findByIdAndDelete(req.params.subId);
      if (!subcategory) return res.status(404).json({ error: 'Subcategory not found' });

      if (subcategory.image?.public_id) {
        await cloudinary.uploader.destroy(subcategory.image.public_id);
      }

      res.json({ success: true, message: 'Subcategory deleted' });
    } catch (err) {
      console.error('Error deleting subcategory:', err);
      res.status(500).json({ error: 'Failed to delete subcategory' });
    }
  }
);

export default router;
