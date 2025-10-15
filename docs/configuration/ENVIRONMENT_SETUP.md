# � Environment Configuration Guide

This document outlines the proper configuration of environment variables for both development and production deployments of the Hiking Portal application.

## � Files Overview

### Frontend Environment Files
- `.env.example` - Template with all available environment variables
- `.env.local` - Local development environment (not committed to git)
- `.env.production` - Production environment variables (set in hosting platform)

### Backend Environment Files
- `.env.example` - Template with all available environment variables
- `.env` - Local development environment (not committed to git)
- Production variables - Set directly in hosting platform

## 🔧 Development Setup

### 1. Frontend Development

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```bash
REACT_APP_API_URL=http://localhost:5000
REACT_APP_DEBUG=true
```

### 2. Backend Development

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your local database credentials:
```bash
NODE_ENV=development
PORT=5000
JWT_SECRET=your-development-secret-minimum-32-characters
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hiking_portal
DB_USER=postgres
DB_PASSWORD=your-local-password
FRONTEND_URL=http://localhost:3000
```

## 🏠 Local Development Setup

### 1. Environment Configuration

Copy the local environment template:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your local settings (all values are pre-configured for Docker):

```bash
# Database (Docker container)
HIKING_POSTGRES_DB=hiking_portal_dev
HIKING_POSTGRES_USER=hiking_user
HIKING_POSTGRES_PASSWORD=hiking_pass_dev_123

# Backend API
NODE_ENV=development
PORT=5000
JWT_SECRET=dev-jwt-secret-change-in-production-minimum-64-chars-required
FRONTEND_URL=http://localhost:3000

# Optional: Add your test API keys
SENDGRID_API_KEY=your_sendgrid_test_key
WEATHER_API_KEY=your_weather_api_test_key
MAPS_API_KEY=your_maps_api_test_key
```

### 2. Start Local Environment

```bash
cd docker
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Local Services

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | React application |
| Backend API | http://localhost:5000 | Node.js API server |
| Database | localhost:5433 | PostgreSQL database |
| Redis | localhost:6379 | Session storage |
| Nginx | http://localhost:8080 | Reverse proxy |

### 4. Database Connection

**Connection Details:**
- Host: `localhost`
- Port: `5433`
- Database: `hiking_portal_dev`
- Username: `hiking_user`
- Password: `hiking_pass_dev_123`

**Command Line:**
```bash
psql -h localhost -p 5433 -U hiking_user -d hiking_portal_dev
```

**Docker Exec:**
```bash
docker exec -it hiking_portal_db psql -U hiking_user -d hiking_portal_dev
```

## 🚀 Production Environment

### 1. Architecture

Production uses managed cloud services:

```
Frontend (Firebase/Netlify)
    ↓
Backend (Cloud Run)
    ↓
Database (Cloud SQL PostgreSQL)
    ↓
File Storage (Cloud Storage)
```

### 2. Environment Variables

Set these in your production environment (Cloud Run, etc.):

```bash
# Core Settings
NODE_ENV=production
DATABASE_URL=postgresql://[USER]:[PASS]@[HOST]:[PORT]/[DB]
JWT_SECRET=[MINIMUM_64_CHARACTER_SECRET]
FRONTEND_URL=https://your-domain.com

# Email Service
SENDGRID_API_KEY=[PRODUCTION_KEY]
FROM_EMAIL=noreply@your-domain.com

# External Services
WEATHER_API_KEY=[PRODUCTION_KEY]
MAPS_API_KEY=[PRODUCTION_KEY]
STRIPE_SECRET_KEY=sk_live_[PRODUCTION_KEY]
```

### 3. Security Checklist

- [ ] Use strong, unique passwords
- [ ] Enable SSL/TLS certificates
- [ ] Set up proper firewall rules
- [ ] Use secrets management service
- [ ] Enable monitoring and logging
- [ ] Configure automated backups
- [ ] Set up health checks

## 🔧 Configuration Files Reference

### Backend Configuration

| File | Purpose |
|------|---------|
| `backend/config/database.js` | Database connection handling |
| `backend/config/env.js` | Environment variable management |

### Docker Configuration

| File | Purpose |
|------|---------|
| `docker/docker-compose.dev.yml` | Local development services |
| `docker/docker-compose.prod.template.yml` | Production template (reference only) |

### Environment Templates

| File | Purpose |
|------|---------|
| `.env.local.example` | Local development configuration |
| `.env.production.example` | Production configuration template |

## 🐛 Troubleshooting

### Database Connection Issues

1. **"datlastsysoid" error**: Update your PostgreSQL client to version 12+
2. **Connection refused**: Ensure Docker containers are running
3. **Authentication failed**: Check username/password in environment files

### Environment Detection

Check which environment your application is using:

```bash
# Local development
docker exec hiking_portal_backend node -e "console.log('Environment:', process.env.NODE_ENV); console.log('Database:', process.env.DATABASE_URL);"

# Expected output:
# Environment: development
# Database: postgresql://hiking_user:hiking_pass_dev_123@hiking_postgres:5432/hiking_portal_dev
```

### Reset Local Environment

If you need to start fresh:

```bash
cd docker
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

## 📞 Support

For environment setup issues:

1. Check this README
2. Verify your `.env.local` file matches `.env.local.example`
3. Ensure Docker is running
4. Check container logs: `docker logs hiking_portal_backend`

## 🔐 Security Notes

- **Never commit** `.env.local` or production environment files
- Use **different passwords** for each environment
- **Rotate secrets** regularly in production
- Enable **2FA** on all cloud accounts
- Use **least privilege** access for service accounts