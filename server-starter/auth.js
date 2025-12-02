// server/middlewares/auth.js
// Authentication middleware using JWT

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Require admin role
const requireAdmin = async (req, res, next) => {
  verifyToken(req, res, async () => {
    try {
      const user = await User.findById(req.userId);
      
      if (!user || !user.active) {
        return res.status(403).json({ error: 'User not found or inactive' });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      req.user = user;
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

// Require editor or admin role
const requireEditor = async (req, res, next) => {
  verifyToken(req, res, async () => {
    try {
      const user = await User.findById(req.userId);
      
      if (!user || !user.active) {
        return res.status(403).json({ error: 'User not found or inactive' });
      }

      if (!['admin', 'editor'].includes(user.role)) {
        return res.status(403).json({ error: 'Editor access required' });
      }

      req.user = user;
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireEditor
};
