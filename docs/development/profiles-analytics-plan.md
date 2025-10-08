# User Profiles & Analytics Dashboard Implementation Plan

## Overview
Implementation of user profile pages with statistics and an admin analytics dashboard for data-driven decision making.

---

## Phase 1: User Profile Enhancement

### 1.1 Database Schema Updates

**New columns for `users` table:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hiking_since DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_level VARCHAR(20) DEFAULT 'beginner'
  CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_difficulty VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) DEFAULT 'public'
  CHECK (profile_visibility IN ('public', 'members_only', 'private'));
```

**Create user_statistics view (calculated in real-time):**
- Total hikes attended
- Total distance covered
- Hikes confirmed vs interested
- Completion rate
- Favorite hike types
- Most recent hike
- Upcoming hikes count

### 1.2 Backend API Endpoints

**Profile Management:**
- `GET /api/profile/:userId` - Get user profile
- `PUT /api/profile` - Update own profile
- `POST /api/profile/photo` - Upload profile photo
- `GET /api/profile/:userId/stats` - Get user statistics

### 1.3 Frontend Components

**Components to create:**
- `UserProfile.js` - Main profile page
- `ProfileHeader.js` - Photo, name, bio section
- `ProfileStats.js` - Statistics cards (hikes, distance, etc.)
- `ProfileSettings.js` - Edit profile form
- `ProfilePhotoUpload.js` - Photo upload component

**Features:**
- View own profile and other users' profiles
- Edit profile (photo, bio, preferences)
- Privacy controls
- Hiking statistics dashboard
- Badge display (future)
- Recent activity feed

---

## Phase 2: Analytics Dashboard

### 2.1 Analytics Data Collection

**Metrics to track:**

**User Metrics:**
- Total users (active/inactive)
- New registrations (daily/weekly/monthly)
- User retention rate
- Active users (30/60/90 days)
- User growth trend

**Hike Metrics:**
- Total hikes created
- Hikes by status (gathering_interest, pre_planning, final_planning, trip_booked, cancelled)
- Average attendance per hike
- Hikes by difficulty distribution
- Hikes by type (day/multi-day)
- Cancellation rate
- Fill rate (confirmed vs max_capacity)

**Engagement Metrics:**
- Comments per hike average
- Photos uploaded
- Carpool participation rate
- Interest-to-confirmation conversion rate
- Average time from interest to confirmation

**Financial Metrics:**
- Total revenue collected
- Average hike cost
- Revenue by month
- Outstanding payments

### 2.2 Backend API Endpoints

**Analytics Endpoints:**
- `GET /api/admin/analytics/overview` - Key metrics summary
- `GET /api/admin/analytics/users` - User analytics
- `GET /api/admin/analytics/hikes` - Hike analytics
- `GET /api/admin/analytics/engagement` - Engagement metrics
- `GET /api/admin/analytics/financial` - Financial data
- `GET /api/admin/analytics/trends?period=30d` - Trend data
- `GET /api/admin/analytics/export` - Export analytics to CSV

### 2.3 Frontend Components

**Components to create:**
- `AnalyticsDashboard.js` - Main dashboard page
- `MetricCard.js` - Single metric display card
- `TrendChart.js` - Line chart for trends
- `DistributionChart.js` - Pie/bar charts
- `DateRangeSelector.js` - Date range picker
- `ExportButton.js` - Export analytics data

**Visualizations:**
- Key metrics cards (total users, hikes, revenue)
- User growth chart (line chart)
- Hike distribution charts (pie/bar)
- Engagement heatmap (calendar view)
- Monthly revenue chart
- Top participants leaderboard

---

## Phase 3: Implementation Steps

### Step 1: Database Migration (30 min)
1. Create migration file for user profile columns
2. Test migration on local database
3. Apply to production after testing

### Step 2: Backend - User Profile APIs (2 hours)
1. Add profile controller methods
2. Add profile routes
3. Implement statistics calculation queries
4. Add photo upload endpoint (if using cloud storage)
5. Test all endpoints

### Step 3: Backend - Analytics APIs (3 hours)
1. Create analytics controller
2. Implement SQL queries for each metric
3. Add caching for expensive queries
4. Add date range filtering
5. Test all endpoints

### Step 4: Frontend - User Profile (4 hours)
1. Create profile components
2. Add profile page route
3. Implement profile editing
4. Add photo upload UI
5. Create statistics cards
6. Style and polish

### Step 5: Frontend - Analytics Dashboard (5 hours)
1. Create dashboard components
2. Add charts library (recharts or chart.js)
3. Implement data visualization
4. Add filtering and date ranges
5. Create export functionality
6. Style and polish

### Step 6: Testing & Deployment (2 hours)
1. Test all new features
2. Fix bugs
3. Update documentation
4. Deploy backend
5. Deploy frontend

**Total Estimated Time: 16-18 hours**

---

## Technical Decisions

### Chart Library
**Recommendation: recharts**
- React-native compatible
- Good documentation
- Responsive
- Modern design
- `npm install recharts`

### Photo Storage
**Options:**
1. **Cloud Storage (Recommended):** Google Cloud Storage or AWS S3
   - Scalable
   - CDN support
   - Secure URLs
2. **Base64 in database:** Simple but not scalable
3. **Local file system:** Not recommended for Cloud Run

### Caching Strategy
- Use in-memory caching for analytics (5-10 min TTL)
- Cache user stats (1 hour TTL)
- Invalidate on relevant data changes

---

## Database Query Examples

### User Statistics Query
```sql
SELECT
  u.id,
  u.name,
  COUNT(DISTINCT CASE WHEN hi.attendance_status = 'confirmed' THEN hi.hike_id END) as hikes_completed,
  COUNT(DISTINCT CASE WHEN hi.attendance_status = 'interested' THEN hi.hike_id END) as hikes_interested,
  STRING_AGG(DISTINCT h.difficulty, ', ') as favorite_difficulties,
  MAX(h.date) FILTER (WHERE hi.attendance_status = 'confirmed') as last_hike_date
FROM users u
LEFT JOIN hike_interest hi ON u.id = hi.user_id
LEFT JOIN hikes h ON hi.hike_id = h.id
WHERE u.id = $1
GROUP BY u.id, u.name;
```

### Analytics Overview Query
```sql
SELECT
  (SELECT COUNT(*) FROM users WHERE status = 'approved') as total_users,
  (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM hikes) as total_hikes,
  (SELECT COUNT(*) FROM hikes WHERE date >= CURRENT_DATE) as upcoming_hikes,
  (SELECT COUNT(DISTINCT user_id) FROM hike_interest WHERE created_at > NOW() - INTERVAL '30 days') as active_users_30d,
  (SELECT SUM(cost) FROM hikes WHERE status = 'trip_booked') as total_revenue;
```

---

## UI Mockup Ideas

### User Profile Layout
```
┌─────────────────────────────────────────────────┐
│  [Profile Photo]  Name                          │
│                   Bio text here                 │
│                   [Edit Profile Button]         │
├─────────────────────────────────────────────────┤
│  Statistics Cards                               │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │ 15   │  │ 250  │  │ Mod  │  │ 85%  │       │
│  │Hikes │  │ km   │  │Level │  │Rate  │       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
├─────────────────────────────────────────────────┤
│  Recent Activity                                │
│  - Confirmed: Table Mountain Hike (Dec 15)     │
│  - Interested: Drakensberg Trail (Jan 20)      │
└─────────────────────────────────────────────────┘
```

### Analytics Dashboard Layout
```
┌─────────────────────────────────────────────────┐
│  Analytics Dashboard        [Export] [30 Days▼] │
├─────────────────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐ │
│  │120  │  │ 15  │  │ 25  │  │R15k │  │ 68% │ │
│  │Users│  │Hikes│  │New  │  │Rev  │  │Fill │ │
│  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘ │
├─────────────────────────────────────────────────┤
│  [User Growth Chart - Line Chart]              │
│  [Hike Distribution - Pie Chart]               │
│  [Monthly Revenue - Bar Chart]                 │
└─────────────────────────────────────────────────┘
```

---

## Priority Order

### Must-Have (MVP)
1. ✅ User profile viewing
2. ✅ Basic statistics (hikes completed, interested)
3. ✅ Analytics overview (total users, hikes, revenue)
4. ✅ User growth chart
5. ✅ Hike distribution charts

### Should-Have (Phase 2)
6. Profile photo upload
7. Bio editing
8. Advanced analytics (retention, engagement)
9. Export functionality
10. Date range filtering

### Nice-to-Have (Phase 3)
11. Privacy controls
12. Badge system
13. Activity feed
14. Leaderboards
15. Scheduled reports

---

## Success Metrics

**User Profiles:**
- 80%+ users complete their profile
- Average 2+ profile views per user per month
- Profile edit rate: 20%+ within first week

**Analytics Dashboard:**
- Admins check dashboard 3+ times per week
- Data-driven decisions for 50%+ of new hikes
- Export analytics 1+ time per month

---

## Next Steps

1. Review and approve this plan
2. Create database migration
3. Implement backend APIs
4. Build frontend components
5. Test thoroughly
6. Deploy to production
7. Gather user feedback
8. Iterate based on feedback

---

**Document Status:** Draft for Review
**Created:** October 7, 2025
**Estimated Completion:** 2-3 days full-time work
