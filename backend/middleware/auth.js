// middleware/auth.js - Authentication middleware
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

// Authentication middleware
function authenticateToken(req, res, next) {
  console.log(`AUTH MIDDLEWARE CALLED for path: ${req.path}`);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('No token provided, returning 401');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Admin authorization middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin
};
