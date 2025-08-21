import express from 'express';
import cloudinary from '../utils/cloudinary.js';
import {
  validateMediaUpload,
  validateMediaDelete,
  validateMediaUpdate // ⬅️ add this
} from '../middleware/validation.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
const router = express.Router();

/**
 * @route POST /api/media/upload
 * @desc Upload base64 image or video to Cloudinary
 * @access Private
 */
router.post('/upload',authenticateToken, requireAdmin,validateMediaUpload, async (req, res) => {
  try {
    console.log('📩 Incoming upload payload:', req.body);
const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('❌ Validation failed:', errors.array());
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

    const { base64, resourceType = 'auto', folder = 'misc' } = req.body;

    if (!base64) return res.status(400).json({ error: 'Missing base64 file' });

    const result = await cloudinary.uploader.upload(base64, {
      resource_type: resourceType,
      folder,
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

/**
 * @route DELETE /api/media/delete
 * @desc Delete media from Cloudinary by public_id
 * @access Private
 */
router.delete('/delete',authenticateToken, requireAdmin, validateMediaDelete,async (req, res) => {
  try {
    const { public_id, resourceType = 'image' } = req.body;

    if (!public_id) return res.status(400).json({ error: 'Missing public_id' });

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resourceType,
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      return res.status(500).json({ error: 'Failed to delete from Cloudinary' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Delete failed' });
  }
});

/**
 * @route PUT /api/media/update
 * @desc Replace old media with new one (upload new, delete old)
 * @access Private
 */
router.put('/update',authenticateToken, requireAdmin,validateMediaUpdate, async (req, res) => {
  try {
    const { newBase64, oldPublicId, resourceType = 'auto', folder = 'misc' } = req.body;

    if (!newBase64 || !oldPublicId) {
      return res.status(400).json({ error: 'Missing new base64 or old public_id' });
    }

    // Upload new
    const uploaded = await cloudinary.uploader.upload(newBase64, {
      resource_type: resourceType,
      folder,
    });

    // Delete old
    await cloudinary.uploader.destroy(oldPublicId, {
      resource_type: resourceType,
    });

    res.json({
      url: uploaded.secure_url,
      public_id: uploaded.public_id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Update failed' });
  }
});

export default router;
