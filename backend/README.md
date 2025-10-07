# Hiking Portal Backend

RESTful API server for The Narrow Trail hiking portal built with Node.js, Express, and PostgreSQL.

## Features

- User authentication with JWT
- Hike management (CRUD operations)
- Interest tracking and attendance
- Photo uploads with Cloudinary
- Admin controls and user management
- Analytics and activity logging
- Weather forecast integration
- Email notifications via SendGrid
- Home Assistant integration endpoints
- iCalendar export

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: SendGrid
- **Image Storage**: Cloudinary
- **Weather**: OpenWeatherMap API
- **Deployment**: Google Cloud Run

## Prerequisites

- Node.js 14+
- PostgreSQL 12+
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/hiking_portal

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-super-secret-jwt-key-change-this

# Server
PORT=8081

# SendGrid (optional - for email notifications)
SENDGRID_API_KEY=SG.your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=The Narrow Trail

# OpenWeatherMap (optional - for weather forecasts)
OPENWEATHER_API_KEY=your-openweathermap-api-key

# Cloudinary (optional - for photo uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Setup Database

Create the database:

```bash
createdb hiking_portal
```

Run migrations:

```bash
psql hiking_portal < schema.sql
psql hiking_portal < migrations/001_add_notification_log.sql
psql hiking_portal < migrations/002_add_user_profile_fields.sql
psql hiking_portal < migrations/003_add_attendance_status_to_hike_interest.sql
psql hiking_portal < migrations/004_add_signin_and_activity_logs.sql
psql hiking_portal < migrations/005_add_hike_estimate_and_links.sql
psql hiking_portal < migrations/006_add_feedback_table.sql
psql hiking_portal < migrations/007_add_suggestions_table.sql
psql hiking_portal < migrations/008_add_long_lived_tokens.sql
```

Or run all at once:

```bash
for file in migrations/*.sql; do psql hiking_portal < "$file"; done
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:8081`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset

### Hikes
- `GET /api/hikes` - List all hikes
- `GET /api/hikes/:id` - Get hike details
- `POST /api/hikes` - Create hike (admin)
- `PUT /api/hikes/:id` - Update hike (admin)
- `DELETE /api/hikes/:id` - Delete hike (admin)

### Interest & Attendance
- `POST /api/hikes/:id/interest` - Toggle interest
- `POST /api/hikes/:id/attendance` - Mark attendance
- `GET /api/my-hikes` - Get user's interested hikes

### Photos
- `POST /api/photos` - Upload photo
- `GET /api/photos/:hikeId` - Get hike photos
- `DELETE /api/photos/:id` - Delete photo

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/pending-users` - List pending users
- `PUT /api/users/:id/approve` - Approve user
- `PUT /api/users/:id/promote` - Promote to admin
- `DELETE /api/admin/users/:id` - Delete user

### Analytics
- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/users` - User analytics
- `GET /api/analytics/hikes` - Hike analytics
- `GET /api/analytics/engagement` - Engagement metrics

### Feedback & Suggestions
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - List feedback (admin)
- `POST /api/suggestions` - Submit hike suggestion
- `GET /api/suggestions` - List suggestions (admin)

### Weather
- `GET /api/weather/hike/:hikeId` - Get weather for hike
- `GET /api/weather/forecast?location=X&date=Y` - Get weather forecast

### Tokens
- `POST /api/tokens/generate` - Generate long-lived token
- `GET /api/tokens` - List user's tokens
- `DELETE /api/tokens/:id` - Revoke token

### Calendar
- `GET /api/calendar/my-hikes.ics` - Export hikes as iCalendar

## API Keys Setup

### OpenWeatherMap (Weather Forecasts)

1. Go to https://openweathermap.org/api
2. Sign up for free account
3. Get API key from dashboard
4. Add to `.env`: `OPENWEATHER_API_KEY=your_key`
5. Free tier: 1,000 calls/day, 5-day forecast

### SendGrid (Email Notifications)

1. Go to https://sendgrid.com/
2. Sign up for free account (100 emails/day)
3. Create API key with "Mail Send" permissions
4. Add to `.env`: `SENDGRID_API_KEY=your_key`
5. Verify sender email address

### Cloudinary (Photo Storage)

1. Go to https://cloudinary.com/
2. Sign up for free account
3. Get credentials from dashboard
4. Add to `.env`

## Database Migrations

To create a new migration:

```bash
# Create file: migrations/XXX_description.sql
# Add SQL commands
# Run: psql hiking_portal < migrations/XXX_description.sql
```

## Deployment

### Google Cloud Run

```bash
gcloud run deploy hiking-portal-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars OPENWEATHER_API_KEY=your_key,JWT_SECRET=your_secret
```

Set environment variables in Cloud Console:
1. Go to Cloud Run service
2. Edit & Deploy New Revision
3. Variables & Secrets → Add Variable
4. Add all required environment variables

## Development

### Run with nodemon (auto-restart)

```bash
npm run dev
```

### Run tests

```bash
npm test
```

### Check for syntax errors

```bash
node -c server.js
node -c controllers/*.js
node -c routes/*.js
```

## Project Structure

```
backend/
├── config/
│   ├── database.js      # Database connection
│   └── env.js           # Environment variables
├── controllers/         # Request handlers
│   ├── authController.js
│   ├── hikeController.js
│   ├── adminController.js
│   └── ...
├── middleware/
│   └── auth.js          # JWT authentication
├── routes/              # API routes
│   ├── auth.js
│   ├── hikes.js
│   └── ...
├── services/            # Business logic
│   ├── notificationService.js
│   ├── weatherService.js
│   └── ...
├── utils/
│   └── activityLogger.js
├── migrations/          # Database migrations
│   └── *.sql
├── server.js            # Main server file
├── schema.sql           # Initial database schema
└── package.json
```

## Troubleshooting

### Database connection issues

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT NOW();"
```

### Port already in use

```bash
# Find process using port 8081
lsof -i :8081  # Mac/Linux
netstat -ano | findstr :8081  # Windows

# Kill the process or change PORT in .env
```

### JWT errors

```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT
