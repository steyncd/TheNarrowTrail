# Hiking Portal - Docker Development Environment

This directory contains Docker configuration for local development of the complete Hiking Portal platform, including the backend API, frontend React app, PostgreSQL database, and Home Assistant integration.

## 🏗️ Architecture Overview

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Frontend      │  │    Backend      │  │   Database      │
│   React:3000    │  │   Node.js:5000  │  │ PostgreSQL:5433 │
│   Hot Reload    │  │   Nodemon       │  │   Dev Data      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
┌─────────────────┐  ┌─────────────────┐
│     Redis       │  │     Nginx       │
│   Cache:6379    │  │   Proxy:8080    │
│   Sessions      │  │  Load Balance   │
└─────────────────┘  └─────────────────┘
```

### Services
- **Frontend**: React development server with hot reload on `http://localhost:3000`
- **Backend**: Node.js API server with nodemon on `http://localhost:5000`
- **Database**: PostgreSQL database on `localhost:5433` (hiking_portal_dev)
- **Redis**: Caching and sessions on `localhost:6379`
- **Nginx**: Reverse proxy on `http://localhost:8080`

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Docker Compose v2.0+
- 8GB+ RAM recommended
- 20GB+ free disk space

### Start Development Environment

```bash
# Windows (PowerShell/CMD) - Run from docker folder
cd docker
.\start-dev.bat

# Linux/Mac/WSL - Run from docker folder
cd docker
./start-dev.sh

# Manual start from docker folder
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d
```

### Access Your Services
- 🌟 **Frontend**: http://localhost:3000
- 🚀 **Backend API**: http://localhost:5000
- 🗄️ **Database**: localhost:5433 (user: hiking_user, db: hiking_portal_dev)
- 📊 **Redis**: localhost:6379
- 🌐 **Nginx Proxy**: http://localhost:8080

## 📁 Directory Structure

```
hiking-portal/
├── docker/
│   ├── docker-compose.dev.yml # Development environment
│   ├── .env.dev               # Development environment variables
│   ├── README.md              # This file
│   ├── start-dev.bat          # Windows startup script
│   ├── start-dev.sh           # Linux/Mac startup script
│   ├── stop-dev.bat           # Windows stop script
│   ├── stop-dev.sh            # Linux/Mac stop script
│   ├── validate-env.bat       # Windows validation script
│   ├── validate-env.sh        # Linux/Mac validation script
│   ├── database/
│   │   └── init.sql           # Database initialization
│   └── nginx/
│       └── nginx.conf         # Nginx reverse proxy config
├── backend/
│   ├── Dockerfile.dev         # Backend development container
│   └── package.json
├── frontend/
│   ├── Dockerfile.dev         # Frontend development container
│   └── package.json
├── homeassistant/
│   ├── custom_components/     # HA integration files
│   ├── docker-compose.yml     # HA-only development setup
│   └── ha-config/             # HA configuration
└── docs/
    └── *.md                   # Documentation files
```

## 🔧 Environment Configuration

The `.env.dev` file contains development settings:

```bash
# Database Configuration
HIKING_POSTGRES_DB=hiking_portal_dev
HIKING_POSTGRES_USER=hiking_user
HIKING_POSTGRES_PASSWORD=hiking_pass_dev_123

# Backend Configuration
NODE_ENV=development
JWT_SECRET=your-jwt-secret-dev-change-in-production-very-long-secret-key
FRONTEND_URL=http://localhost:3000

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development

# Socket.IO Configuration
SOCKET_IO_ENABLED=true
SOCKET_IO_CORS_ORIGIN=http://localhost:3000
```

## �️ Development Workflow

### Daily Development
```bash
# Start environment (Windows)
.\docker\start-dev.bat

# View all logs
docker-compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker logs hiking_portal_backend -f
docker logs hiking_portal_frontend -f

# Restart specific service (after code changes)
docker-compose -f docker-compose.dev.yml restart hiking_backend

# Stop environment
.\docker\stop-dev.bat
```

### Database Operations
```bash
# Access database directly
docker exec -it hiking_portal_db psql -U hiking_user -d hiking_portal_dev

# Run migrations manually
docker exec hiking_portal_backend npm run migrate

# Reset database (CAUTION: Deletes all data)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up hiking_postgres -d
```



### Backend Development
```bash
# Install new npm packages
docker exec hiking_portal_backend npm install <package-name>

# Run tests
docker exec hiking_portal_backend npm test

# Access backend shell
docker exec -it hiking_portal_backend sh
```

### Frontend Development
```bash
# Install new React packages
docker exec hiking_portal_frontend npm install <package-name>

# Run tests
docker exec hiking_portal_frontend npm test

# Build for production testing
docker exec hiking_portal_frontend npm run build
```

## 🛠️ Useful Commands

### Service Management
```bash
# Rebuild specific service
docker-compose -f docker-compose.dev.yml build hiking_backend
docker-compose -f docker-compose.dev.yml up -d hiking_backend

# Scale services (if needed)
docker-compose -f docker-compose.dev.yml up -d --scale hiking_backend=2

# Clean up unused resources
docker system prune -f
docker volume prune -f
```

### Health Checks
```bash
# Check all service health
docker-compose -f docker-compose.dev.yml ps

# Test backend health endpoint
curl http://localhost:5000/health

# Test frontend
curl http://localhost:3000

# Test database connection
docker exec hiking_portal_db pg_isready -U hiking_user -d hiking_portal_dev
```

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port
netstat -tulpn | grep :5000  # Linux/Mac
netstat -ano | findstr :5000  # Windows

# Kill process (if needed)
sudo kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

**Database Connection Issues**
```bash
# Check database is running
docker logs hiking_portal_db

# Reset database
docker-compose -f docker-compose.dev.yml down
docker volume rm hiking-portal_hiking_postgres_data
docker-compose -f docker-compose.dev.yml up hiking_postgres -d
```



**Frontend Hot Reload Not Working**
```bash
# Enable polling (already configured in Dockerfile.dev)
CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true

# Restart frontend container
docker-compose -f docker-compose.dev.yml restart hiking_frontend
```

### Performance Optimization

**Reduce Resource Usage**
```bash
# Disable unused services in docker-compose.dev.yml
# Comment out redis, nginx if not needed

# Limit container resources
docker update --memory="1g" --cpus="1.0" hiking_portal_backend
```

**Speed Up Builds**
```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose -f docker-compose.dev.yml build

# Use multi-stage builds for smaller images
# Already configured in Dockerfile.dev files
```

## 🔒 Security Notes

- This environment is for **development only**
- Default passwords are insecure - change for production
- All services run with elevated privileges for development ease
- Database data persists in Docker volumes
- SSL/TLS not configured (use nginx-proxy for SSL in development if needed)

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Home Assistant Development](https://developers.home-assistant.io/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Development](https://reactjs.org/docs/getting-started.html)

## 🤝 Contributing

1. Make changes to your code
2. Test in local Docker environment
3. Update migrations if database changes
4. Update this README if setup changes
5. Commit and push changes

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. View service logs: `docker logs <container_name> -f`
3. Check Docker resources: `docker system df`
4. Restart the environment: `.\docker\stop-dev.bat && .\docker\start-dev.bat`

# Run database migrations
docker-compose exec backend npm run migrate

# Access database shell
docker-compose exec postgres psql -U hiking_user -d hiking_portal_dev

# View container logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Clean up everything
docker-compose down -v --remove-orphans
```

## 🐛 Debugging

```bash
# Enter container shell
docker-compose exec backend bash
docker-compose exec frontend bash

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart backend
```

## 🚀 Production Testing

```bash
# Test production build locally
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up

# Build production images
docker-compose -f docker-compose.prod.yml build
```