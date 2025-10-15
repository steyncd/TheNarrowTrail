// middleware/auth.js - Authentication middleware
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

// Authentication middleware
function authenticateToken(req, res, next) {
  console.log(`[AUTH] ${req.method} ${req.originalUrl || req.url} (path: ${req.path})`);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('[AUTH] No token provided, returning 401');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('[AUTH] Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    console.log(`[AUTH] User authenticated: ${user.email} (ID: ${user.id})`);
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

