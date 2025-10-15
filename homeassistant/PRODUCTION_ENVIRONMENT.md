# Production Environment Configuration

## Overview

This document provides the production environment configuration for The Narrow Trail Hiking Portal Home Assistant integration.

---

## Production URLs

### Frontend
**URL:** https://helloliam.web.app
**Hosting:** Firebase Hosting
**Project:** helloliam
**Region:** Global CDN

### Backend API
**URL:** https://backend-4kzqyywlqq-ew.a.run.app
**Service:** Google Cloud Run
**Project:** helloliam (ID: 554106646136)
**Region:** europe-west1
**Active Revision:** backend-00066-k2z (100% traffic)

### WebSocket
**URL:** wss://backend-4kzqyywlqq-ew.a.run.app
**Protocol:** Socket.IO over WebSocket
**Connection:** Upgraded from HTTPS

### Database
**Instance:** helloliam:us-central1:hiking-db
**Type:** Cloud SQL PostgreSQL
**Region:** us-central1
**Connection:** Unix socket (from Cloud Run)
**Database Name:** hiking_portal

---

## Home Assistant Integration Configuration

### Default Configuration

The integration comes pre-configured with production URLs:

```yaml
# In const.py
DEFAULT_API_URL = "https://backend-4kzqyywlqq-ew.a.run.app"
DOMAIN = "hiking_portal_v2"
```

### Setup Steps

1. **Install Integration**
   - Add via HACS or manual installation
   - Restart Home Assistant

2. **Configure Integration**
   - Go to **Settings** → **Devices & Services**
   - Click **Add Integration**
   - Search for "The Narrow Trail Hiking Portal"
   - Enter configuration:
     - **API URL:** `https://backend-4kzqyywlqq-ew.a.run.app` (pre-filled)
     - **Authentication Token:** Your JWT token from the portal

3. **Get Authentication Token**
   - Log into https://helloliam.web.app
   - Navigate to your **Profile** page
   - Click **Integration Tokens** tab
   - Generate a new Home Assistant token
   - Copy the token (starts with `eyJ...`)

---

## API Endpoints Used by Integration

### Public Endpoints (No Auth Required)
- `GET /health` - Health check
- `GET /api/hikes/public` - Public hikes list

### Authenticated Endpoints (Token Required)
- `GET /api/hikes` - All hikes
- `GET /api/hikes/my` - User's hikes
- `GET /api/admin/users/pending` - Pending users (admin only)
- `GET /api/notifications` - User notifications
- `POST /api/hikes/:id/interested` - Express interest
- `DELETE /api/hikes/:id/interested` - Remove interest
- `POST /api/notifications/:id/read` - Mark notification read
- `GET /api/weather/:hikeId` - Weather forecast
- `POST /api/payments` - Record payment

### WebSocket Events
- `connection` - Initial connection
- `authenticated` - Authentication success
- `hike:new` - New hike created
- `hike:updated` - Hike modified
- `hike:deleted` - Hike removed
- `user:interest` - User expressed interest
- `notification:new` - New notification
- `payment:recorded` - Payment recorded

---

## Environment Variables

### Backend Production Environment (Cloud Run)

These are set on the Cloud Run service:

```bash
NODE_ENV=production
DB_HOST=/cloudsql/helloliam:us-central1:hiking-db
DB_USER=postgres
DB_NAME=hiking_portal
DB_PASSWORD=[from Secret Manager: db-password]
JWT_SECRET=[from Secret Manager: jwt-secret]
SENDGRID_API_KEY=[from Secret Manager: sendgrid-api-key]
SENDGRID_FROM_EMAIL=noreply@thenarrowtrail.co.za
FRONTEND_URL=https://helloliam.web.app
PORT=8080
```

### Home Assistant Configuration

Set during integration setup:

```yaml
api_url: "https://backend-4kzqyywlqq-ew.a.run.app"
token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Your JWT token
```

---

## Integration Features

### Sensors (24 Total)

#### Core Sensors
- `sensor.next_hike` - Next upcoming hike details
- `sensor.upcoming_hikes` - Count of upcoming hikes
- `sensor.my_hikes` - Count of user's hikes
- `sensor.total_hikes` - Total hikes in system
- `sensor.days_until_next_hike` - Days until next hike

#### Notification Sensors
- `sensor.unread_notifications` - Unread notification count
- `sensor.notification_summary` - Notification summary

#### Weather Sensors
- `sensor.next_hike_weather` - Weather status for next hike
- `sensor.weather_alerts` - Active weather alerts count

#### Payment Sensors
- `sensor.outstanding_payments` - Outstanding payment amount
- `sensor.payment_summary` - Payment summary data
- `sensor.my_payment_status` - User's payment status

#### WebSocket Sensors
- `sensor.websocket_status` - WebSocket connection status
- `sensor.realtime_activity` - Real-time event count

#### Admin Sensors (Requires Admin Role)
- `sensor.pending_users` - Users awaiting approval

### Binary Sensors
- `binary_sensor.has_urgent_notifications` - Urgent notification flag
- `binary_sensor.weather_warning` - Weather warning active
- `binary_sensor.websocket_connected` - WebSocket connected

### Calendar
- `calendar.hiking_portal_events` - All hikes as calendar events

### Services

#### User Services
- `hiking_portal_v2.express_interest` - Join a hike
- `hiking_portal_v2.remove_interest` - Leave a hike
- `hiking_portal_v2.mark_attendance` - Mark attendance
- `hiking_portal_v2.mark_notification_read` - Mark notification read

#### Admin Services
- `hiking_portal_v2.send_notification` - Send notification to participants
- `hiking_portal_v2.record_payment` - Record a payment

#### Utility Services
- `hiking_portal_v2.get_weather` - Fetch weather forecast

---

## Authentication & Security

### JWT Token Authentication

The integration uses JWT (JSON Web Token) authentication:

1. **Token Generation**
   - Generated via the web portal at https://helloliam.web.app
   - Navigate to Profile → Integration Tokens
   - Create a new token with description "Home Assistant"
   - Token is long-lived (configurable expiration)

2. **Token Format**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzM5NTIwMDAwfQ.signature
   ```

3. **Token Usage**
   - Sent in `Authorization: Bearer <token>` header
   - Required for all authenticated endpoints
   - Validated by backend using JWT_SECRET

4. **Token Security**
   - Stored securely in Home Assistant configuration
   - Never logged or exposed in UI
   - Can be revoked from web portal
   - Rotated regularly for security

### Permission Levels

- **User:** Access to own hikes, express interest, view notifications
- **Admin:** All user permissions + manage users, send notifications, record payments

---

## Network Configuration

### Firewall Rules

Ensure Home Assistant can reach:
- **https://backend-4kzqyywlqq-ew.a.run.app** (port 443)
- **wss://backend-4kzqyywlqq-ew.a.run.app** (port 443)

### SSL/TLS

- All connections use HTTPS/WSS (TLS 1.2+)
- Certificates managed by Google Cloud
- No certificate configuration needed

### Polling Interval

- **Default:** 5 minutes (300 seconds)
- **Configurable:** Set `DEFAULT_SCAN_INTERVAL` in `const.py`
- **WebSocket:** Real-time updates (no polling)

---

## Monitoring & Troubleshooting

### Health Check

Test backend connectivity:
```bash
curl https://backend-4kzqyywlqq-ew.a.run.app/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-10-15T12:00:00.000Z"}
```

### Test Authentication

Test token validity:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://backend-4kzqyywlqq-ew.a.run.app/api/hikes
```

Should return hikes list or 401 if token invalid.

### Home Assistant Logs

View integration logs:
1. **Settings** → **System** → **Logs**
2. Search for `hiking_portal_v2`
3. Look for connection errors or authentication failures

### Common Issues

#### 1. Authentication Failed
- **Cause:** Invalid or expired token
- **Solution:** Generate new token from web portal

#### 2. Cannot Connect
- **Cause:** Network firewall blocking Cloud Run
- **Solution:** Allow HTTPS traffic to `*.run.app` domains

#### 3. Sensors Not Updating
- **Cause:** Backend API not responding
- **Solution:** Check backend health, verify token, restart integration

#### 4. WebSocket Disconnected
- **Cause:** Network instability or backend restart
- **Solution:** WebSocket auto-reconnects, check logs for persistent errors

---

## Update Procedures

### Integration Updates

1. **Check for Updates**
   - HACS will notify when new version available
   - Or check: https://github.com/steyncd/TheNarrowTrail/releases

2. **Update via HACS**
   - Open HACS → Integrations
   - Find "The Narrow Trail Hiking Portal"
   - Click "Update"
   - Restart Home Assistant

3. **Manual Update**
   - Download latest release
   - Replace `custom_components/hiking_portal` folder
   - Restart Home Assistant

### Breaking Changes

Always check release notes for breaking changes:
- Domain changes (e.g., `hiking_portal` → `hiking_portal_v2`)
- Entity ID changes
- Required configuration updates
- New dependencies

---

## Version Information

### Current Version
**Integration:** v2.5.0
**Home Assistant:** Minimum 2023.1.0
**Backend API:** Production (October 2025)

### Compatibility Matrix

| Integration Version | Backend API Version | Home Assistant Version |
|---------------------|---------------------|------------------------|
| v2.5.0              | Production          | 2023.1.0+              |
| v2.4.0              | Production          | 2023.1.0+              |
| v2.3.x              | Production          | 2023.1.0+              |

---

## Support & Resources

### Documentation
- **Integration README:** `/homeassistant/README.md`
- **Installation Guide:** `/homeassistant/INSTALLATION.md`
- **Features:** `/homeassistant/FEATURES.md`
- **Web Portal:** https://helloliam.web.app

### Issue Reporting

**GitHub Issues:** https://github.com/steyncd/TheNarrowTrail/issues

When reporting issues, include:
1. Home Assistant version
2. Integration version
3. Error logs from Home Assistant
4. Steps to reproduce

### Contact

**Project Maintainer:** @steyncd
**Web Portal:** https://helloliam.web.app
**Backend Status:** https://backend-4kzqyywlqq-ew.a.run.app/health

---

## Quick Reference

```yaml
# Production Configuration Summary
Domain: hiking_portal_v2
API URL: https://backend-4kzqyywlqq-ew.a.run.app
WebSocket: wss://backend-4kzqyywlqq-ew.a.run.app
Frontend: https://helloliam.web.app
Database: helloliam:us-central1:hiking-db
Region: europe-west1 (Backend), Global (Frontend)
Project: helloliam (554106646136)
```

**Last Updated:** October 15, 2025
**Status:** ✅ Production Ready
