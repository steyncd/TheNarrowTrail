# Development Documentation

Documentation for developers working on the Hiking Portal project.

## 📖 Documentation in this Section

### Architecture
- **[backend-architecture.md](backend-architecture.md)** - Backend structure, controllers, and recent additions
- **[frontend-architecture.md](frontend-architecture.md)** - Frontend components and structure

### Development Guides
- **[refactoring-guide.md](refactoring-guide.md)** - Code refactoring history and guidelines
- **[email-configuration.md](email-configuration.md)** - Email service setup and troubleshooting
- **[quick-wins.md](quick-wins.md)** - Quick implementation wins and improvements
- **[profiles-analytics-plan.md](profiles-analytics-plan.md)** - Profile and analytics implementation plan

## 🏗️ Project Architecture

### Backend (Node.js + Express)
- **Controllers**: Business logic for hikes, users, payments, etc.
- **Routes**: API endpoints
- **Middleware**: Authentication, validation
- **Database**: PostgreSQL (Cloud SQL)

### Frontend (React)
- **Components**: Reusable UI components
- **Pages**: Route-level components
- **Services**: API integration
- **Contexts**: Global state management

## 🔧 Development Workflow

1. **Backend Changes**: Edit controllers/routes → Test locally → Deploy
2. **Frontend Changes**: Edit components → Build → Deploy to Firebase
3. **Database Changes**: Create migration → Test → Deploy to production

## 📚 Key Technologies

- **Backend**: Node.js 18, Express, PostgreSQL, JWT
- **Frontend**: React 18, Bootstrap 5, React Router
- **Infrastructure**: Google Cloud Run, Firebase Hosting, Cloud SQL

## 🧪 Testing

```bash
# Backend syntax check
cd backend
node -c server.js
node -c controllers/*.js
node -c routes/*.js

# Frontend build
cd frontend
npm run build
```

---

For deployment instructions, see [../deployment/README.md](../deployment/README.md).
