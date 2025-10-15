# 🚀 Hiking Portal Backend API

Node.js REST API server built with Express.js, providing comprehensive backend services for the Hiking Portal application.

## 🎯 Overview

This backend API provides:

- **User Authentication** - JWT-based auth with role management
- **Hike Management** - CRUD operations for hiking events
- **Payment Processing** - Stripe integration for event payments
- **Notification System** - Email/SMS notifications via SendGrid/Twilio
- **File Management** - Image upload and processing
- **Real-time Features** - WebSocket support via Socket.IO

## 🚀 Quick Start

### 1. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set your configuration values:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hiking_portal
DB_USER=postgres
DB_PASSWORD=your-password

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Frontend
FRONTEND_URL=http://localhost:3000

# External services (optional for development)
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@yourapp.com
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

### 2. Database Setup

Ensure PostgreSQL is running and create the database:

```sql
CREATE DATABASE hiking_portal;
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Database Migrations

```bash
npm run migrate
```

### 5. Start Development Server

```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your .env file).

## 🔧 Environment Configuration



### Development Environment### Development Environment

```bash```bash

# Install dependencies# Install dependencies

npm installnpm install



# Start development server (with hot reload)# Start development server (with hot reload)

npm run devnpm run dev



# Server runs on http://localhost:5000# Server runs on http://localhost:5000

``````



## 📁 Project Structure### Production Environment

```bash

```# Install production dependencies

backend/npm ci --only=production

├── 📂 api-docs/           # Postman collections & API documentation

├── 📂 config/             # Configuration files# Start production server

├── 📂 controllers/        # Request handlers & business logicnpm start

├── 📂 middleware/         # Express middleware (auth, validation, etc.)```

├── 📂 routes/             # API route definitions

├── 📂 services/           # External service integrations## 📁 Project Structure

├── 📂 utils/              # Utility functions & helpers

├── 📂 migrations/         # Database migration scripts```

├── 📂 tools/              # Deployment & utility scriptsbackend/

└── server.js             # Application entry point├── 📂 api-docs/           # Postman collections & API documentation

```├── 📂 config/             # Configuration files

│   ├── database.js        # Database connection setup

## 🔧 Environment Configuration│   └── env.js            # Environment variable management

├── 📂 controllers/        # Request handlers & business logic

The backend uses environment variables for configuration. See [Environment Setup Guide](../ENVIRONMENT_SETUP.md) for details.├── 📂 middleware/         # Express middleware (auth, validation, etc.)

├── 📂 routes/             # API route definitions

## 📡 API Documentation├── 📂 services/           # External service integrations

├── 📂 utils/              # Utility functions & helpers

Full API documentation available in [Postman Collections](./api-docs/).├── 📂 migrations/         # Database migration scripts

├── 📂 tools/              # Deployment & utility scripts

## 🗄️ Database├── 📂 uploads/            # File upload storage (development)

└── server.js             # Application entry point

The backend uses PostgreSQL with connection pooling for optimal performance.```

See [Database Schema Documentation](../docs/architecture/DATABASE_SCHEMA.md) for complete schema details.

## 🔧 Environment Configuration

## 🔐 Security

The backend uses environment variables for configuration. See [Environment Setup Guide](../ENVIRONMENT_SETUP.md) for details.

- JWT authentication with role-based access control

- Password hashing with Bcrypt### Key Environment Variables

- Input validation and sanitization```bash

- Rate limiting and CORS protection# Core Settings

NODE_ENV=development

## 📞 SupportPORT=5000

DATABASE_URL=postgresql://user:pass@host:port/db

For development support:

1. Check this README# Security

2. Review API documentation in `api-docs/`JWT_SECRET=your-super-secure-secret-minimum-64-characters

3. Consult [Architecture Guide](../docs/architecture/)

4. Create issue in repository# External Services

SENDGRID_API_KEY=your-sendgrid-key

---TWILIO_ACCOUNT_SID=your-twilio-sid

STRIPE_SECRET_KEY=your-stripe-key

Built with ❤️ using Node.js, Express, and PostgreSQL```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Hikes
- `GET /api/hikes` - List all hikes
- `POST /api/hikes` - Create new hike
- `GET /api/hikes/:id` - Get hike details
- `PUT /api/hikes/:id` - Update hike
- `DELETE /api/hikes/:id` - Delete hike

### User Management
- `GET /api/users` - List users (admin only)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### File Management
- `POST /api/upload` - Upload files
- `GET /api/photos/:id` - Get photo details
- `DELETE /api/photos/:id` - Delete photo

Full API documentation available in [Postman Collections](./api-docs/).

## 🗄️ Database

### Connection
The backend uses PostgreSQL with connection pooling for optimal performance.

### Migrations
```bash
# Run all pending migrations
npm run migrate

# Create new migration
npm run migrate:create -- migration_name

# Rollback last migration
npm run migrate:rollback
```

### Schema
See [Database Schema Documentation](../docs/architecture/DATABASE_SCHEMA.md) for complete schema details.

## 🔐 Authentication & Security

### JWT Authentication
- JWT tokens for stateless authentication
- Configurable token expiration
- Refresh token support
- Role-based access control

### Security Features
- **Password Hashing**: Bcrypt with salt rounds
- **Input Validation**: Joi schema validation
- **Rate Limiting**: Prevent API abuse
- **CORS**: Configurable cross-origin requests
- **Helmet**: Security headers
- **SQL Injection Protection**: Parameterized queries

## 📨 External Integrations

### Email Service (SendGrid)
```javascript
// Send notification email
await emailService.sendHikeNotification(userId, hikeId);
```

### SMS Service (Twilio)
```javascript
// Send SMS notification
await smsService.sendHikeReminder(phoneNumber, message);
```

### Payment Processing (Stripe)
```javascript
// Process payment
const paymentIntent = await paymentService.createPayment(amount, currency);
```

## 🔍 Monitoring & Logging

### Structured Logging
```javascript
// Log with context
logger.info('Hike created', { 
  hikeId: hike.id, 
  userId: req.user.id,
  location: hike.location 
});
```

### Health Checks
```bash
# Check API health
curl http://localhost:5000/api/health

# Check database connection
curl http://localhost:5000/api/health/db
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/auth.test.js
```

### Test Structure
```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── fixtures/       # Test data
└── helpers/        # Test utilities
```

## 🚀 Deployment

### Docker
```bash
# Build production image
docker build -t hiking-portal-backend .

# Run container
docker run -p 5000:5000 hiking-portal-backend
```

### Cloud Deployment
See [Deployment Guide](../docs/deployment/) for platform-specific instructions:
- Google Cloud Run
- Amazon ECS
- Heroku
- DigitalOcean App Platform

## 🔧 Development Tools

### Available Scripts
```bash
npm run dev          # Start development server with hot reload
npm run start        # Start production server
npm run test         # Run test suite
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run migrate      # Run database migrations
npm run seed         # Seed database with test data
```

### VS Code Integration
Recommended extensions:
- **REST Client** - Test API endpoints
- **PostgreSQL** - Database management
- **Thunder Client** - Alternative to Postman

## 📈 Performance

### Optimization Features
- **Connection Pooling** - PostgreSQL connection management
- **Response Compression** - Gzip compression
- **Query Optimization** - Indexed database queries
- **Caching** - Redis integration for session/data caching

### Monitoring
- **Response Times** - Track API performance
- **Error Rates** - Monitor application health
- **Database Performance** - Query execution tracking

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed:**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
npm run db:test
```

**Port Already in Use:**
```bash
# Find process using port 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000    # Windows
```

**Migration Errors:**
```bash
# Check migration status
npm run migrate:status

# Reset migrations (development only)
npm run migrate:reset
```

## 📞 Support

For development support:
1. Check this README
2. Review API documentation in `api-docs/`
3. Check application logs
4. Consult [Architecture Guide](../docs/architecture/)
5. Create issue in repository

## 🤝 Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation
4. Submit pull request with clear description

---

Built with ❤️ using Node.js, Express, and PostgreSQL