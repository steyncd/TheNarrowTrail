// server.js - Main Express server
// Load environment variables first
require('dotenv').config();

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
const weatherRoutes = require('./routes/weather');
const paymentRoutes = require('./routes/payments');
const expenseRoutes = require('./routes/expenses');
const contentRoutes = require('./routes/content');
const publicContentRoutes = require('./routes/publicContent');
const notificationPreferencesRoutes = require('./routes/notificationPreferences');
const permissionRoutes = require('./routes/permissions');
const settingsRoutes = require('./routes/settings');
const eventTypesRoutes = require('./routes/eventTypes');
const tagsRoutes = require('./routes/tags');
const reviewsRoutes = require('./routes/reviews');
const userPreferencesRoutes = require('./routes/userPreferences');

// Import controllers for special routes
const hikeController = require('./controllers/hikeController');

// Import Socket.IO service
const socketService = require('./services/socketService');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://www.thenarrowtrail.co.za',
    'https://thenarrowtrail.co.za',
    'https://helloliam.web.app',
    'http://localhost:3000',
    'http://localhost:3001',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for photo uploads
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded files (branding assets, etc.)
app.use('/uploads', express.static('uploads'));

// Activity tracking middleware for POPIA retention compliance
const { trackUserActivity } = require('./middleware/activityTracker');
app.use(trackUserActivity);

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
app.use('/api/permissions', permissionRoutes);
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
app.use('/api/weather', weatherRoutes);
app.use('/api/notification-preferences', notificationPreferencesRoutes);
app.use('/api/settings', settingsRoutes); // System settings (admin only)
app.use('/api/event-types', eventTypesRoutes); // Event types (hiking, camping, 4x4, etc.)
app.use('/api/tags', tagsRoutes); // Tags system for events
app.use('/api', reviewsRoutes); // Reviews and ratings system
app.use('/api', userPreferencesRoutes); // User preferences for recommendations
app.use('/api/public-content', publicContentRoutes); // Public content API - NO AUTH (must be before /api)
app.use('/api/content', contentRoutes);
app.use('/api', expenseRoutes); // Expenses routes
app.use('/api', paymentRoutes); // Catch-all for payments - must be LAST
app.use('/api/hikes', interestRoutes);

// My Hikes Dashboard route
app.get('/api/my-hikes', authenticateToken, hikeController.getMyHikes);

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server ready to accept connections`);
});

// Initialize Socket.IO server
socketService.initializeSocket(server);

// Initialize and start data retention service for POPIA compliance
const dataRetentionService = require('./services/dataRetentionService');
if (process.env.NODE_ENV === 'production') {
  // Only auto-start in production to avoid development interference
  dataRetentionService.start();
  console.log('Data retention service started for POPIA compliance');
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  dataRetentionService.stop();
  server.close(() => {
    console.log('HTTP server closed');
    pool.end();
  });
});

module.exports = app;

