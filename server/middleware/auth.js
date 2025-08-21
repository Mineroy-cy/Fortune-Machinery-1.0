import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's an admin token (has adminId) or user token (has userId)
    if (payload.adminId) {
      req.admin = payload; // Admin authentication
    } else if (payload.userId) {
      req.user = payload; // User authentication
    } else {
      return res.status(403).json({ error: 'Invalid token structure' });
    }
    
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.admin?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
