// server.js - Main Express server
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const { PORT } = require('./config/env');
const { authenticateToken } = require('./middleware/auth');

// Import route modules
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const hikeRoutes = require('./routes/hikes');
const photoRoutes = require('./routes/photos');
const interestRoutes = require('./routes/interest');
const profileRoutes = require('./routes/profile');
const analyticsRoutes = require('./routes/analytics');
const logsRoutes = require('./routes/logs');
const feedbackRoutes = require('./routes/feedback');
const suggestionRoutes = require('./routes/suggestions');
const homeassistantRoutes = require('./routes/homeassistant');
const calendarRoutes = require('./routes/calendar');
const tokenRoutes = require('./routes/tokens');

// Import controllers for special routes
const hikeController = require('./controllers/hikeController');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for now (change in production)
  credentials: true
}));
app.use(express.json());

// Health check routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Hiking Portal API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/*',
      hikes: '/api/hikes',
      photos: '/api/photos',
      admin: '/api/admin/*',
      myHikes: '/api/my-hikes',
      profile: '/api/profile/*',
      analytics: '/api/analytics/*'
    }
  });
});

// Mount route modules
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hikes', hikeRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/logs', logsRoutes);

// Emergency Contact routes - MUST be before /api/profile routes to avoid conflict with /:userId
app.get('/api/profile/emergency-contact', authenticateToken, hikeController.getEmergencyContact);
app.put('/api/profile/emergency-contact', authenticateToken, hikeController.updateEmergencyContact);

app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/homeassistant', homeassistantRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/tokens', tokenRoutes);

// Interest route - mounted separately because it follows the hikes pattern
app.post('/api/hikes/:id/interest', authenticateToken, require('./controllers/interestController').toggleInterest);

// My Hikes Dashboard route
app.get('/api/my-hikes', authenticateToken, hikeController.getMyHikes);

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server ready to accept connections`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end();
  });
});

module.exports = app;
