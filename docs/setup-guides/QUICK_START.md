# 🚀 Quick Start Guide

Get the Hiking Portal running locally in under 10 minutes!

## ⚡ Prerequisites

Before you begin, ensure you have:

- **Docker Desktop** installed and running
- **Git** for cloning the repository
- **Code Editor** (VS Code recommended)
- **8GB RAM** minimum for Docker containers

## 🎯 1-Minute Setup

### Clone and Start
```bash
# Clone the repository
git clone https://github.com/your-username/hiking-portal.git
cd hiking-portal

# Start all services
cd docker
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to start (about 2-3 minutes)
docker-compose -f docker-compose.dev.yml logs -f
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5433

## 🔧 Detailed Setup

### 1. Environment Configuration

Copy the environment template:
```bash
cp .env.local.example .env.local
```

The default values work out of the box for local development.

### 2. Docker Services

Start the development environment:
```bash
cd docker
docker-compose -f docker-compose.dev.yml up -d
```

This starts:
- **PostgreSQL** database with sample data
- **Redis** for session storage
- **Backend API** with hot reload
- **Frontend** React development server
- **Nginx** reverse proxy

### 3. Verify Installation

Check all services are running:
```bash
docker ps
```

You should see 5 containers running:
- `hiking_portal_frontend`
- `hiking_portal_backend`
- `hiking_portal_db`
- `hiking_portal_redis`
- `hiking_portal_nginx`

### 4. Test the Application

**Frontend Test:**
- Navigate to http://localhost:3000
- You should see the Hiking Portal homepage

**API Test:**
```bash
curl http://localhost:5000/api/hikes
```

**Database Test:**
```bash
docker exec -it hiking_portal_db psql -U hiking_user -d hiking_portal_dev -c "SELECT COUNT(*) FROM hikes;"
```

## 🎮 Sample Data

The local environment includes sample data:
- **Test users** with different roles
- **Sample hikes** with various statuses
- **Photos and feedback** for testing

### Test User Accounts
| Email | Password | Role |
|-------|----------|------|
| admin@test.com | admin123 | Administrator |
| user@test.com | user123 | Regular User |

## 🛠️ Development Workflow

### Hot Reload
Both frontend and backend support hot reload:
- **Frontend**: Changes in `frontend/src/` auto-refresh browser
- **Backend**: Changes in `backend/` auto-restart server

### Database Changes
```bash
# Run migrations
docker exec hiking_portal_backend npm run migrate

# Reset database (if needed)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker logs -f hiking_portal_backend
```

## 🔍 Database Access

### GUI Tools
Use any PostgreSQL client:
- **Connection**: localhost:5433
- **Database**: hiking_portal_dev
- **Username**: hiking_user
- **Password**: hiking_pass_dev_123

### Command Line
```bash
# Direct connection
psql -h localhost -p 5433 -U hiking_user -d hiking_portal_dev

# Via Docker
docker exec -it hiking_portal_db psql -U hiking_user -d hiking_portal_dev
```

## 🎯 API Testing

### Postman Collection
Import the provided Postman collections:
- `backend/Hiking-Portal-API.postman_collection.json`
- `backend/Hiking-Portal.postman_environment.json`

### cURL Examples
```bash
# Get all hikes
curl http://localhost:5000/api/hikes

# Health check
curl http://localhost:5000/api/health

# User registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Stop existing services
docker-compose -f docker-compose.dev.yml down

# Find and kill process using port
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000    # Windows
```

**Database Connection Failed:**
```bash
# Check if database is running
docker logs hiking_portal_db

# Restart database service
docker-compose -f docker-compose.dev.yml restart hiking_postgres
```

**Frontend Not Loading:**
```bash
# Check frontend logs
docker logs hiking_portal_frontend

# Rebuild frontend
docker-compose -f docker-compose.dev.yml up --build hiking_frontend
```

**API Errors:**
```bash
# Check backend logs
docker logs hiking_portal_backend

# Restart backend
docker-compose -f docker-compose.dev.yml restart hiking_backend
```

### Clean Reset
If you need to start completely fresh:
```bash
# Stop and remove all containers and volumes
docker-compose -f docker-compose.dev.yml down -v

# Remove all images (optional)
docker system prune -a

# Start fresh
docker-compose -f docker-compose.dev.yml up -d
```

## 🎉 Next Steps

Once your development environment is running:

1. **Explore the Code**: Check out the [Architecture Guide](../architecture/SYSTEM_ARCHITECTURE.md)
2. **API Documentation**: Review the [API Reference](../development/API.md)
3. **Database Schema**: Understand the [Database Design](../architecture/DATABASE_SCHEMA.md)
4. **Feature Development**: Read the [Development Guide](../development/DEVELOPMENT.md)

## 📞 Getting Help

If you encounter issues:
1. Check this troubleshooting guide
2. Review container logs
3. Check the [FAQ](./FAQ.md)
4. Create an issue in the repository

Happy coding! 🚀