// config/env.js - Environment configuration
// This file provides default values and environment variable mapping
// Actual values should be set via environment variables

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  // ============================================================================
  // CORE APPLICATION SETTINGS
  // ============================================================================
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || (isProduction ? 8080 : 5000),
  
  // ============================================================================
  // SECURITY CONFIGURATION
  // ============================================================================
  JWT_SECRET: process.env.JWT_SECRET || (isDevelopment ? 'dev-jwt-secret-change-in-production' : null),
  
  // ============================================================================
  // FRONTEND INTEGRATION
  // ============================================================================
  FRONTEND_URL: process.env.FRONTEND_URL || (isDevelopment ? 'http://localhost:3000' : null),
  
  // ============================================================================
  // EMAIL CONFIGURATION (SendGrid)
  // ============================================================================
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  FROM_EMAIL: process.env.FROM_EMAIL || (isDevelopment ? 'noreply@localhost' : null),
  
  // Legacy email config (deprecated - use SendGrid)
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,

  // ============================================================================
  // SMS CONFIGURATION (Twilio)
  // ============================================================================
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  
  // ============================================================================
  // DEVELOPMENT FLAGS
  // ============================================================================
  DEBUG: process.env.DEBUG === 'true' || isDevelopment,
  LOG_LEVEL: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  ENABLE_CORS: process.env.ENABLE_CORS === 'true' || isDevelopment,
  
  // ============================================================================
  // EXTERNAL SERVICES
  // ============================================================================
  REDIS_URL: process.env.REDIS_URL,
  
  // Weather API
  WEATHER_API_KEY: process.env.WEATHER_API_KEY,
  
  // Maps API
  MAPS_API_KEY: process.env.MAPS_API_KEY,
  
  // Payment Processing (Stripe)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  
  // ============================================================================
  // VALIDATION
  // ============================================================================
  validate() {
    const required = [];
    
    if (isProduction) {
      if (!this.JWT_SECRET || this.JWT_SECRET.length < 32) {
        required.push('JWT_SECRET (minimum 32 characters)');
      }
      if (!this.FRONTEND_URL) {
        required.push('FRONTEND_URL');
      }
      if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
        required.push('DATABASE_URL or DB_HOST');
      }
    }
    
    if (required.length > 0) {
      throw new Error(`Missing required environment variables for ${this.NODE_ENV}: ${required.join(', ')}`);
    }
  }
};
