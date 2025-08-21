import express from 'express';
import mongoose from 'mongoose';
import Video from '../models/Videos.js';
import Machine from '../models/Machine.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateCreateVideo, validateUpdateVideo } from '../middleware/validation.js';

const router = express.Router();

// Get all videos with linked machine info
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find()
      .populate('machine_id', 'name description')
      .sort({ createdAt: -1 })
      .lean();
    res.json(videos);
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Unified public video feed: videos from Videos collection and from Machine demo_videos
router.get('/all-public', async (req, res) => {
  try {
    console.log('Fetching all public videos...');
    
    // 1. Videos from Videos collection
    let videosFromVideos = [];
    try {
      const videoDocs = await Video.find().lean();
      console.log(`Found ${videoDocs.length} videos in Videos collection`);
      
      videosFromVideos = videoDocs
        .filter(v => v.video && v.video.url)
        .map(v => ({
          video_url: v.video?.url || null,
          thumbnail_url: v.thumbnail?.url || null,
          description: v.description || '',
          title: v.title || '',
          machine_id: v.machine_id || null,
          machine_name: '', // We'll populate this separately if needed
          source: 'video',
          _id: v._id,
          is_featured: v.isFeatured || false,
          is_highlighted: v.isHighlighted || false,
        }));
    } catch (videoErr) {
      console.error('Error fetching videos from Videos collection:', videoErr);
      videosFromVideos = [];
    }

    // 2. Videos from Machine demo_video
    let videosFromMachines = [];
    try {
      const machineDocs = await Machine.find({ 
        'demo_video.url': { $exists: true, $ne: null, $ne: '' } 
      }).lean();
      console.log(`Found ${machineDocs.length} machines with demo videos`);
      
      videosFromMachines = machineDocs
        .filter(m => m.demo_video && m.demo_video.url)
        .map(m => ({
          video_url: m.demo_video?.url || null,
          thumbnail_url: m.video_thumbnail?.url || null,
          description: m.description || '',
          title: m.name || '',
          machine_id: m._id || null,
          machine_name: m.name || '',
          source: 'machine',
          _id: m._id,
          is_featured: m.is_featured || false,
          is_highlighted: false, // Machine videos don't have highlighted feature
        }));
    } catch (machineErr) {
      console.error('Error fetching videos from Machines collection:', machineErr);
      videosFromMachines = [];
    }

    // Combine and filter out any entries without video URLs
    let allVideos = [...videosFromVideos, ...videosFromMachines]
      .filter(video => video.video_url);
    
    // Sort: highlighted first, then featured, then by creation date
    allVideos.sort((a, b) => {
      // First priority: highlighted videos
      if (a.is_highlighted && !b.is_highlighted) return -1;
      if (!a.is_highlighted && b.is_highlighted) return 1;
      
      // Second priority: featured videos
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      
      // Third priority: creation date (newest first)
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    
    console.log(`Returning ${allVideos.length} total videos`);
    res.json(allVideos);
    
  } catch (err) {
    console.error('Error in /all-public endpoint:', err);
    res.status(500).json({ 
      error: 'Failed to fetch public videos',
      details: err.message 
    });
  }
});

// Get single video with machine info
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('machine_id', 'name description')
      .lean();
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json(video);
  } catch (err) {
    console.error('Error fetching video:', err);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Create a video entry linked to a machine
router.post('/', authenticateToken, requireAdmin, validateCreateVideo, async (req, res) => {
  try {
    const { title, description, video, thumbnail, duration, machine_id, isFeatured, isHighlighted } = req.body;

    if (!mongoose.Types.ObjectId.isValid(machine_id)) {
      return res.status(400).json({ error: 'Invalid machine ID' });
    }

    const machine = await Machine.findById(machine_id);
    if (!machine) return res.status(404).json({ error: 'Machine not found' });

    // If setting as highlighted, unhighlight all others first
    if (isHighlighted) {
      await Video.updateMany({}, { isHighlighted: false });
    }

    const newVideo = await Video.create({
      title,
      description,
      video,
      thumbnail,
      duration,
      machine_id,
      isFeatured: Boolean(isFeatured),
      isHighlighted: Boolean(isHighlighted)
    });

    res.status(201).json(newVideo);
  } catch (err) {
    console.error('Error creating video:', err);
    res.status(500).json({ error: 'Failed to create video' });
  }
});

// Update video
router.put('/:id', authenticateToken, requireAdmin, validateUpdateVideo, async (req, res) => {
  try {
    const { title, description, video, thumbnail, duration, machine_id, isFeatured, isHighlighted } = req.body;

    if (!mongoose.Types.ObjectId.isValid(machine_id)) {
      return res.status(400).json({ error: 'Invalid machine ID' });
    }

    const existing = await Video.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Video not found' });

    // If setting as highlighted, unhighlight all others first
    if (isHighlighted && !existing.isHighlighted) {
      await Video.updateMany({}, { isHighlighted: false });
    }

    existing.title = title;
    existing.description = description;
    existing.video = video;
    existing.thumbnail = thumbnail;
    existing.duration = duration;
    existing.machine_id = machine_id;
    existing.isFeatured = Boolean(isFeatured);
    existing.isHighlighted = Boolean(isHighlighted);
    await existing.save();

    res.json(existing);
  } catch (err) {
    console.error('Error updating video:', err);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Delete video
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    // Optionally, you could delete media from Cloudinary here if desired
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (err) {
    console.error('Error deleting video:', err);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Toggle featured flag
router.patch('/:id/featured', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    video.isFeatured = !video.isFeatured;
    await video.save();

    res.json(video);
  } catch (err) {
    console.error('Error updating featured status:', err);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Toggle highlighted flag
router.patch('/:id/highlighted', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    // If we're setting this video as highlighted, unhighlight all others first
    if (!video.isHighlighted) {
      await Video.updateMany({}, { isHighlighted: false });
    }

    video.isHighlighted = !video.isHighlighted;
    await video.save();

    res.json(video);
  } catch (err) {
    console.error('Error updating highlighted status:', err);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

export default router;
