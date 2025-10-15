# 🏔️ Local Database Connection Guide

## 📊 Current Database Status

Your local development database is **ready and running** with:
- ✅ All essential tables created
- ✅ Sample data for testing
- ✅ Production-like schema structure
- ✅ Backend API connected and working

## 🔌 Connection Details

### **PostgreSQL Connection**
```
Host:     localhost
Port:     5433
Database: hiking_portal_dev
Username: hiking_user
Password: hiking_pass_dev_123
```

### **Connection String**
```
postgresql://hiking_user:hiking_pass_dev_123@localhost:5433/hiking_portal_dev
```

## 🛠️ Connection Methods

### **1. Direct Docker Command (Recommended)**
```bash
docker exec -it hiking_portal_db psql -U hiking_user -d hiking_portal_dev
```

### **2. GUI Database Tools**
Configure your favorite database tool:
- **DBeaver**: Create new PostgreSQL connection with above details
- **pgAdmin**: Add new server with above details
- **DataGrip**: New PostgreSQL data source
- **TablePlus**: New PostgreSQL connection

### **3. Command Line (if psql installed locally)**
```bash
psql -h localhost -p 5433 -U hiking_user -d hiking_portal_dev
```

### **4. VS Code Extensions**
- **PostgreSQL**: Use connection string above
- **Database Client**: Configure PostgreSQL connection

## 📊 Current Database Tables

| Table | Records | Description |
|-------|---------|-------------|
| `users` | 1 | User accounts (admin@hikingportal.com) |
| `hikes` | 3 | Sample hikes for testing |
| `hike_interest` | 0 | User interest in hikes |
| `photos` | 0 | Hike photos |
| `notification_log` | 0 | Notification history |
| `notification_preferences` | 0 | User notification settings |
| `feedback` | 0 | Hike feedback |
| `suggestions` | 0 | User suggestions |
| `site_content` | 2 | Dynamic site content |
| `long_lived_tokens` | 0 | API tokens |

## 🔑 Test Login Credentials

**Admin Account:**
- Email: `admin@hikingportal.com`
- Password: `admin123`

## 📥 Copying Production Data

Since your production database isn't directly accessible from your local machine, here are your options:

### **Option 1: Manual Export from Production Server**

1. **On your production server/machine with database access:**
   ```bash
   pg_dump -h 35.202.149.98 -p 5432 -U postgres -d hiking-db \
     --no-owner --no-privileges --clean --if-exists \
     -f hiking_portal_production.sql
   ```

2. **Copy the dump file to your local machine**

3. **Import to local development database:**
   ```bash
   # From the docker folder
   docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev < hiking_portal_production.sql
   ```

### **Option 2: Cloud SQL Proxy (if using Google Cloud)**

If your production database is Google Cloud SQL:
```bash
# Install and configure cloud_sql_proxy
./cloud_sql_proxy -instances=YOUR_PROJECT:REGION:INSTANCE=tcp:5432
```

### **Option 3: Database Backup/Export Tools**

Use your cloud provider's backup/export tools:
- **Google Cloud**: Cloud SQL export to Cloud Storage
- **AWS**: RDS snapshot export
- **Azure**: Database export to storage account

### **Option 4: Application-Level Data Export**

Create an admin endpoint in your backend to export data as JSON/CSV and import it locally.

## 🧪 Testing Your Database

### **Quick Database Check**
```sql
-- Check all tables and record counts
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables
ORDER BY tablename;
```

### **Sample Queries**
```sql
-- List all users
SELECT id, name, email, role, status FROM users;

-- List all hikes
SELECT id, name, date, difficulty, status FROM hikes;

-- Check hike interest
SELECT h.name, u.name as user_name, hi.attendance_status 
FROM hike_interest hi
JOIN hikes h ON hi.hike_id = h.id
JOIN users u ON hi.user_id = u.id;
```

## 🎯 Development Workflow

1. **Start Development Environment**
   ```bash
   cd docker
   ./start-dev.bat
   ```

2. **Make Database Changes**
   - Edit migration files in `backend/migrations/`
   - Apply: `Get-Content migration.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev`

3. **Test Changes**
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:3000

4. **Reset Database (if needed)**
   ```bash
   docker-compose -f docker-compose.dev.yml down -v
   docker-compose -f docker-compose.dev.yml up -d
   # Then run basic_schema.sql again
   ```

## 🔧 Troubleshooting

**Connection Refused:**
- Check if Docker container is running: `docker ps`
- Restart database: `docker-compose -f docker-compose.dev.yml restart hiking_postgres`

**Authentication Failed:**
- Double-check username/password
- Ensure you're using port 5433 (not 5432)

**Missing Tables:**
- Run migrations: `Get-Content basic_schema.sql | docker exec -i hiking_portal_db psql -U hiking_user -d hiking_portal_dev`

Your local development database is ready to use! 🎉