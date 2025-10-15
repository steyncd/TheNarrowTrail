# 🔐 Environment Configuration Management

## 🎯 Overview

This document explains how environment variables are managed across different environments to prevent deployment issues.

---

## 📁 File Structure & Precedence

### Frontend Environment Files

Files are loaded in this order (later files override earlier ones):

1. `.env` - Default values (committed to repo)
2. `.env.production` - Production overrides (committed to repo)
3. `.env.local` - Local overrides (NEVER commit)

### Critical Rules

✅ **DO**:
- Commit `.env` and `.env.production`
- Use `.env.local` for local development
- Start all React variables with `REACT_APP_`
- Document all environment variables

❌ **DON'T**:
- Commit `.env.local` to version control
- Hardcode URLs or secrets in source code
- Use production credentials locally
- Mix development and production configs

---

## 🔧 Frontend Configuration

### `.env` (Base Configuration)
```bash
# Application Metadata
REACT_APP_NAME=Hiking Portal
REACT_APP_VERSION=1.0.0

# Feature Flags (defaults - can be overridden)
REACT_APP_ENABLE_PWA=false
REACT_APP_ENABLE_NOTIFICATIONS=false
REACT_APP_ENABLE_OFFLINE_MODE=false
```

### `.env.production` (Production Configuration)
```bash
# Backend API URL - PRODUCTION
REACT_APP_API_URL=https://backend-554106646136.europe-west1.run.app

# Environment identifier
REACT_APP_ENV=production

# Feature Flags - Production
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_OFFLINE_MODE=true

# Analytics & Monitoring
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_LOG_LEVEL=error
```

### `.env.local` (Local Development - NOT COMMITTED)
```bash
# Local Development Environment
# This file is used for local development - DO NOT COMMIT TO VERSION CONTROL
# WARNING: This file takes precedence over .env.production!

# Backend API URL - LOCAL DEVELOPMENT ONLY
REACT_APP_API_URL=http://localhost:3001

# Environment identifier
REACT_APP_ENV=development

# Enable debug mode for development
REACT_APP_DEBUG=true

# Feature flags for development
REACT_APP_ENABLE_PWA=false
REACT_APP_ENABLE_NOTIFICATIONS=false
REACT_APP_ENABLE_OFFLINE_MODE=false

# Development-specific settings
REACT_APP_LOG_LEVEL=debug
REACT_APP_MOCK_API=false
```

---

## 🎯 Backend Configuration

### Development (.env or .env.local)
```bash
NODE_ENV=development
PORT=3001

# Database - Local PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=hiking_portal_dev
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Authentication
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug

# Email (development - use mailtrap or similar)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass

# SMS/WhatsApp (development - disabled)
ENABLE_SMS=false
ENABLE_WHATSAPP=false
```

### Production (Google Cloud Run Environment Variables)

Set via Cloud Console or gcloud CLI - NEVER store in files:

```bash
NODE_ENV=production
PORT=8080

# Database - Cloud SQL
DATABASE_HOST=/cloudsql/hiking-portal-442919:europe-west1:hiking-portal-db
DATABASE_PORT=5432
DATABASE_NAME=hiking_portal
DATABASE_USER=<secure_username>
DATABASE_PASSWORD=<secure_password>

# Authentication
JWT_SECRET=<strong_random_string_64_chars>
JWT_EXPIRY=7d

# CORS
CORS_ORIGIN=https://www.thenarrowtrail.co.za,https://helloliam.web.app

# Logging
LOG_LEVEL=error

# Email (SendGrid or similar)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<sendgrid_api_key>
FROM_EMAIL=noreply@thenarrowtrail.co.za

# SMS/WhatsApp
ENABLE_SMS=true
ENABLE_WHATSAPP=true
WHATSAPP_API_KEY=<whatsapp_api_key>
WHATSAPP_PHONE_NUMBER=<verified_whatsapp_number>
```

---

## 🚨 Security Best Practices

### 1. Never Hardcode Credentials
❌ **Bad**:
```javascript
const API_URL = 'https://backend-554106646136.europe-west1.run.app';
```

✅ **Good**:
```javascript
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) {
      throw new Error('REACT_APP_API_URL must be set in production');
    }
    return apiUrl;
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};
```

### 2. Use Strong Secrets
```bash
# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate strong database password
pwgen -s 32 1
```

### 3. Rotate Secrets Regularly
- Database passwords: Every 90 days
- JWT secrets: Every 180 days
- API keys: Every 365 days

### 4. Use Secret Management
For production, consider:
- Google Cloud Secret Manager
- AWS Secrets Manager
- HashiCorp Vault

---

## 🧪 Testing Environment Configuration

### Verify Frontend Environment
```javascript
// Add to src/utils/configValidator.js
export const validateConfig = () => {
  const required = ['REACT_APP_API_URL', 'REACT_APP_ENV'];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    return false;
  }
  
  if (process.env.NODE_ENV === 'production') {
    if (process.env.REACT_APP_API_URL?.includes('localhost')) {
      console.error('Production build contains localhost reference!');
      return false;
    }
  }
  
  return true;
};
```

### Verify Backend Environment
```javascript
// Add to backend/config/validator.js
const requiredEnvVars = [
  'DATABASE_HOST',
  'DATABASE_NAME',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'JWT_SECRET'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

if (process.env.NODE_ENV === 'production') {
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
}
```

---

## 📋 Environment Variable Checklist

### Before Deployment

Frontend:
- [ ] `.env.local` removed or backed up
- [ ] `.env.production` has correct values
- [ ] No localhost references in code
- [ ] All `REACT_APP_*` variables prefixed correctly

Backend:
- [ ] All required variables set in Cloud Run
- [ ] Database connection string correct
- [ ] JWT secret is strong (64+ chars)
- [ ] CORS origins include production domain
- [ ] Email/SMS credentials configured

---

## 🔍 Debugging Environment Issues

### Check what environment variables are loaded
```javascript
// Frontend (add temporarily, remove before commit)
console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', process.env.REACT_APP_API_URL);
console.log('All REACT_APP vars:', 
  Object.keys(process.env)
    .filter(key => key.startsWith('REACT_APP_'))
    .reduce((obj, key) => ({ ...obj, [key]: process.env[key] }), {})
);
```

### Common Issues

**Issue**: Environment variables not loading
- Check variable starts with `REACT_APP_`
- Restart development server after changing .env files
- Clear build cache: `rm -rf node_modules/.cache`

**Issue**: Wrong environment used
- Check `NODE_ENV` is set correctly
- Verify which .env file has precedence
- Remove `.env.local` for production builds

**Issue**: Secrets exposed in build
- Never log sensitive values
- Never commit .env.local
- Use `.gitignore` correctly

---

## 📚 References

- [Create React App - Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [Node.js - Environment Variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [Google Cloud - Managing Secrets](https://cloud.google.com/secret-manager/docs)

---

Last Updated: October 13, 2025
