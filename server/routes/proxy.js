import express from 'express';
import axios from 'axios';

const router = express.Router();

// Proxy route for images to handle CORS issues
router.get('/image/:encodedUrl', async (req, res) => {
  try {
    const encodedUrl = req.params.encodedUrl;
    const imageUrl = decodeURIComponent(encodedUrl);
    
    console.log('🖼️ Proxy - Fetching image:', imageUrl);
    
    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // Set CORS headers
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': response.headers['content-type'] || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
    });
    
    // Pipe the image data
    response.data.pipe(res);
    
  } catch (error) {
    console.error('❌ Image proxy error:', error.message);
    res.status(500).json({ error: 'Failed to proxy image' });
  }
});

export default router; 