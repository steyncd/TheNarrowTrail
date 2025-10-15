# 🗄️ Database Schema Documentation

## Overview

The Hiking Portal uses PostgreSQL as its primary database with a normalized relational schema designed for scalability and data integrity.

## 📊 Entity Relationship Diagram

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│    Users    │    │  Hike Interest  │    │    Hikes    │
├─────────────┤    ├─────────────────┤    ├─────────────┤
│ id (PK)     │◄──►│ user_id (FK)    │◄──►│ id (PK)     │
│ email       │    │ hike_id (FK)    │    │ name        │
│ name        │    │ status          │    │ date        │
│ password    │    │ payment_status  │    │ location    │
│ phone       │    │ created_at      │    │ difficulty  │
│ created_at  │    └─────────────────┘    │ cost        │
│ updated_at  │                           │ status      │
└─────────────┘                           └─────────────┘
       │                                         │
       │                                         │
       ▼                                         ▼
┌─────────────┐                           ┌─────────────┐
│   Photos    │                           │  Feedback   │
├─────────────┤                           ├─────────────┤
│ id (PK)     │                           │ id (PK)     │
│ hike_id(FK) │                           │ hike_id(FK) │
│ filename    │                           │ user_id(FK) │
│ caption     │                           │ rating      │
│ created_at  │                           │ comment     │
└─────────────┘                           └─────────────┘
```

## 🗂️ Core Tables

### Users Table
Primary user account information and authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| `name` | VARCHAR(255) | NOT NULL | Full name |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `phone` | VARCHAR(20) | | Phone number for SMS |
| `emergency_contact` | VARCHAR(255) | | Emergency contact info |
| `medical_info` | TEXT | | Medical conditions/allergies |
| `status` | VARCHAR(20) | DEFAULT 'active' | Account status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_status` on `status`

### Hikes Table
Hiking events and trip information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique hike identifier |
| `name` | VARCHAR(255) | NOT NULL | Hike name/title |
| `date` | DATE | NOT NULL | Hike date |
| `location` | VARCHAR(255) | | Hike location |
| `gps_coordinates` | VARCHAR(50) | | GPS coordinates |
| `difficulty` | VARCHAR(20) | DEFAULT 'Easy' | Difficulty level |
| `distance` | VARCHAR(50) | | Distance description |
| `description` | TEXT | | Detailed description |
| `cost` | DECIMAL(10,2) | DEFAULT 0 | Cost per person |
| `type` | VARCHAR(20) | DEFAULT 'day' | day/multi-day |
| `group_type` | VARCHAR(20) | DEFAULT 'family' | family/mens |
| `status` | VARCHAR(30) | DEFAULT 'gathering_interest' | Event status |
| `image_url` | TEXT | | Featured image |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Check Constraints:**
- `difficulty IN ('Easy', 'Moderate', 'Hard', 'Extreme')`
- `type IN ('day', 'multi')`
- `group_type IN ('family', 'mens')`
- `status IN ('gathering_interest', 'confirmed', 'completed', 'cancelled')`

**Indexes:**
- `idx_hikes_date` on `date`
- `idx_hikes_status` on `status`

### Hike Interest Table
User registrations and attendance tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique record identifier |
| `user_id` | INTEGER | FOREIGN KEY → users(id) | User reference |
| `hike_id` | INTEGER | FOREIGN KEY → hikes(id) | Hike reference |
| `status` | VARCHAR(20) | DEFAULT 'interested' | Interest status |
| `payment_status` | VARCHAR(20) | DEFAULT 'pending' | Payment status |
| `attendance_status` | VARCHAR(20) | | Actual attendance |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Registration time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Check Constraints:**
- `status IN ('interested', 'confirmed', 'cancelled')`
- `payment_status IN ('pending', 'paid', 'refunded')`
- `attendance_status IN ('attended', 'no_show', 'cancelled')`

**Indexes:**
- `idx_hike_interest_user_hike` on `(user_id, hike_id)` (UNIQUE)
- `idx_hike_interest_hike_id` on `hike_id`

## 🔔 Notification System

### Notification Log Table
Message delivery tracking and history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique log identifier |
| `user_id` | INTEGER | FOREIGN KEY → users(id) | Recipient user |
| `type` | VARCHAR(50) | NOT NULL | Notification type |
| `channel` | VARCHAR(20) | NOT NULL | email/sms |
| `message` | TEXT | | Message content |
| `status` | VARCHAR(20) | DEFAULT 'pending' | Delivery status |
| `sent_at` | TIMESTAMP | | Send timestamp |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Log creation |

### Notification Preferences Table
User notification settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique preference ID |
| `user_id` | INTEGER | FOREIGN KEY → users(id) | User reference |
| `type` | VARCHAR(50) | NOT NULL | Notification type |
| `email_enabled` | BOOLEAN | DEFAULT true | Email notifications |
| `sms_enabled` | BOOLEAN | DEFAULT false | SMS notifications |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

## 💰 Payment System

### Hike Payments Table
Payment tracking for hiking events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique payment ID |
| `user_id` | INTEGER | FOREIGN KEY → users(id) | Paying user |
| `hike_id` | INTEGER | FOREIGN KEY → hikes(id) | Related hike |
| `amount` | DECIMAL(10,2) | NOT NULL | Payment amount |
| `status` | VARCHAR(20) | DEFAULT 'pending' | Payment status |
| `payment_method` | VARCHAR(50) | | Payment method |
| `transaction_id` | VARCHAR(255) | | External transaction ID |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Payment time |

## 📸 Media Management

### Photos Table
Image storage and metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique photo ID |
| `hike_id` | INTEGER | FOREIGN KEY → hikes(id) | Related hike |
| `filename` | VARCHAR(255) | NOT NULL | File name |
| `original_filename` | VARCHAR(255) | | Original upload name |
| `caption` | TEXT | | Photo caption |
| `file_size` | INTEGER | | File size in bytes |
| `mime_type` | VARCHAR(100) | | File MIME type |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Upload time |

## 📝 Content Management

### Site Content Table
Dynamic content management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `key` | VARCHAR(255) | PRIMARY KEY | Content identifier |
| `content` | TEXT | NOT NULL | Content body |
| `content_type` | VARCHAR(50) | DEFAULT 'text' | Content type |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

### Feedback Table
User feedback and ratings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique feedback ID |
| `user_id` | INTEGER | FOREIGN KEY → users(id) | Feedback author |
| `hike_id` | INTEGER | FOREIGN KEY → hikes(id) | Related hike |
| `rating` | INTEGER | CHECK (1-5) | Star rating |
| `comment` | TEXT | | Feedback comment |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Feedback time |

## 🔐 Security & Compliance

### Long Lived Tokens Table
API token management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique token ID |
| `user_id` | INTEGER | FOREIGN KEY → users(id) | Token owner |
| `name` | VARCHAR(255) | NOT NULL | Token name/purpose |
| `token_hash` | VARCHAR(255) | NOT NULL | Hashed token value |
| `expires_at` | TIMESTAMP | | Expiration time |
| `last_used_at` | TIMESTAMP | | Last usage time |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |

### Data Retention Logs Table
POPIA compliance tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique log ID |
| `table_name` | VARCHAR(255) | NOT NULL | Affected table |
| `record_id` | INTEGER | NOT NULL | Affected record |
| `action` | VARCHAR(50) | NOT NULL | Action taken |
| `reason` | TEXT | | Retention reason |
| `executed_at` | TIMESTAMP | DEFAULT NOW() | Execution time |

## 📈 Performance Optimization

### Indexes
- **Primary Keys**: Automatic B-tree indexes
- **Foreign Keys**: Indexes for join performance
- **Query Optimization**: Indexes on frequently queried columns
- **Composite Indexes**: Multi-column indexes for complex queries

### Constraints
- **Data Integrity**: Foreign key relationships
- **Business Rules**: Check constraints for valid values
- **Uniqueness**: Unique constraints for data consistency

## 🔄 Migration System

The database uses a sequential migration system:

1. **000_initial_schema.sql** - Base schema
2. **001-999** - Feature additions and modifications
3. **999_performance** - Performance optimizations

Each migration is tracked in the `schema_migrations` table to ensure proper deployment order and prevent duplicate execution.

## 🔍 Monitoring Queries

```sql
-- Active users
SELECT COUNT(*) FROM users WHERE status = 'active';

-- Upcoming hikes
SELECT * FROM hikes WHERE date >= CURRENT_DATE AND status = 'confirmed';

-- Payment summary
SELECT 
    status, 
    COUNT(*) as count, 
    SUM(amount) as total 
FROM hike_payments 
GROUP BY status;

-- Notification delivery rates
SELECT 
    channel,
    status,
    COUNT(*) as count
FROM notification_log 
WHERE sent_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY channel, status;
```

This schema design supports the current application requirements while providing flexibility for future enhancements and scalability needs.