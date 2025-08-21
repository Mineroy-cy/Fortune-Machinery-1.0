import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js'; // assuming you have this
import bcrypt from 'bcryptjs';
import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router(); 

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { adminId: admin._id, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.json({ token }); // send it back to frontend
});

router.get('/me', authenticateToken, requireAdmin, async (req, res) => {
  const admin = await Admin.findById(req.admin.adminId).select('-password');
  if (!admin) return res.status(404).json({ error: 'Admin not found' });
  res.json(admin);
});

router.post('/logout', (req, res) => {
  // Just for UI consistency — no server state to clear
  res.json({ message: 'Logged out' });
});

//GET /auth/verify
router.get('/verify', authenticateToken, (req, res) => {
  return res.json({ success: true, user: req.admin });
  
});

export default router;