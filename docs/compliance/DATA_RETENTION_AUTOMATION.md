# Data Retention Automation Guide

## Overview
This guide provides a comprehensive approach to implementing automated data retention enforcement for POPIA compliance in The Narrow Trail hiking portal.

## POPIA Retention Requirements

According to our Privacy Policy, data is retained as follows:

### Active User Data
- **Account Information**: Retained while account is active
- **Hike Participation Records**: Retained while account is active
- **Payment Records**: Retained for 5 years (tax/financial compliance)
- **Emergency Contact Information**: Retained while account is active
- **Photos and Comments**: Retained while account is active

### Inactive User Data
- **Inactive Accounts**: After 3 years of inactivity, users will be notified
- **Final Deletion**: If no response to notification, data deleted after 4 years of inactivity

### Deleted Account Data
- **Deletion Timeline**: Completed within 30 days of request
- **Exceptions**: Payment records retained for 5 years (legal requirement)
- **Anonymized Data**: Aggregate analytics may be retained indefinitely

## Implementation Strategy

### 1. Database Schema Additions

First, we need to add tracking fields to monitor user activity and retention status:

```sql
-- Add retention tracking fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS retention_warning_sent_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS scheduled_deletion_at TIMESTAMP;

-- Create index for efficient retention queries
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at);
CREATE INDEX IF NOT EXISTS idx_users_scheduled_deletion ON users(scheduled_deletion_at) WHERE scheduled_deletion_at IS NOT NULL;

-- Create data retention log table
CREATE TABLE IF NOT EXISTS data_retention_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(50) NOT NULL, -- 'warning_sent', 'deletion_scheduled', 'data_deleted', 'retention_extended'
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX idx_retention_logs_user_id ON data_retention_logs(user_id);
CREATE INDEX idx_retention_logs_action ON data_retention_logs(action);
CREATE INDEX idx_retention_logs_created_at ON data_retention_logs(created_at);
```

### 2. Activity Tracking Updates

Update the `last_active_at` timestamp whenever users interact with the system:

**Backend: middleware/activityTracker.js** (NEW FILE)
```javascript
const pool = require('../config/database');

async function trackUserActivity(req, res, next) {
  // Only track for authenticated requests
  if (req.user && req.user.id) {
    try {
      // Update last_active_at asynchronously (don't block request)
      pool.query(
        'UPDATE users SET last_active_at = NOW() WHERE id = $1',
        [req.user.id]
      ).catch(err => {
        console.error('Failed to update last_active_at:', err);
      });
    } catch (error) {
      console.error('Activity tracking error:', error);
    }
  }
  next();
}

module.exports = trackUserActivity;
```

**Apply to all authenticated routes in server.js:**
```javascript
const trackUserActivity = require('./middleware/activityTracker');

// Apply after auth middleware
app.use('/api', authMiddleware, trackUserActivity);
```

### 3. Automated Retention Jobs

Create scheduled tasks to enforce retention policies:

**Backend: services/dataRetentionService.js** (NEW FILE)
```javascript
const pool = require('../config/database');
const nodemailer = require('nodemailer');

class DataRetentionService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      // Configure your email settings
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Step 1: Send warnings to users inactive for 3 years
   */
  async sendInactivityWarnings() {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    try {
      // Find users inactive for 3 years who haven't been warned
      const result = await pool.query(`
        SELECT id, email, name, last_active_at
        FROM users
        WHERE last_active_at < $1
          AND retention_warning_sent_at IS NULL
          AND scheduled_deletion_at IS NULL
          AND deleted_at IS NULL
      `, [threeYearsAgo]);

      console.log(`Found ${result.rows.length} users to warn about inactivity`);

      for (const user of result.rows) {
        await this.sendInactivityWarningEmail(user);
        
        // Mark warning as sent and schedule deletion for 1 year from now
        const scheduledDeletion = new Date();
        scheduledDeletion.setFullYear(scheduledDeletion.getFullYear() + 1);

        await pool.query(`
          UPDATE users
          SET retention_warning_sent_at = NOW(),
              scheduled_deletion_at = $1
          WHERE id = $2
        `, [scheduledDeletion, user.id]);

        // Log the action
        await pool.query(`
          INSERT INTO data_retention_logs (user_id, action, reason, metadata)
          VALUES ($1, 'warning_sent', 'User inactive for 3 years', $2)
        `, [user.id, JSON.stringify({
          last_active: user.last_active_at,
          scheduled_deletion: scheduledDeletion
        })]);
      }

      return result.rows.length;
    } catch (error) {
      console.error('Error sending inactivity warnings:', error);
      throw error;
    }
  }

  /**
   * Step 2: Delete data for users inactive for 4 years (who were warned)
   */
  async deleteInactiveUserData() {
    try {
      // Find users scheduled for deletion
      const result = await pool.query(`
        SELECT id, email, name, scheduled_deletion_at
        FROM users
        WHERE scheduled_deletion_at IS NOT NULL
          AND scheduled_deletion_at <= NOW()
          AND deleted_at IS NULL
      `);

      console.log(`Found ${result.rows.length} users scheduled for deletion`);

      for (const user of result.rows) {
        await this.performUserDataDeletion(user.id, 'retention_policy');
      }

      return result.rows.length;
    } catch (error) {
      console.error('Error deleting inactive user data:', error);
      throw error;
    }
  }

  /**
   * Step 3: Purge old payment records (older than 5 years)
   */
  async purgeOldPaymentRecords() {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    try {
      const result = await pool.query(`
        DELETE FROM user_payments
        WHERE created_at < $1
        RETURNING id
      `, [fiveYearsAgo]);

      console.log(`Purged ${result.rowCount} payment records older than 5 years`);

      // Log the action
      if (result.rowCount > 0) {
        await pool.query(`
          INSERT INTO data_retention_logs (user_id, action, reason, metadata)
          VALUES (NULL, 'payments_purged', 'Payment records older than 5 years', $1)
        `, [JSON.stringify({ count: result.rowCount, cutoff_date: fiveYearsAgo })]);
      }

      return result.rowCount;
    } catch (error) {
      console.error('Error purging old payment records:', error);
      throw error;
    }
  }

  /**
   * Helper: Send inactivity warning email
   */
  async sendInactivityWarningEmail(user) {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@thenarrowtrail.co.za',
      to: user.email,
      subject: 'The Narrow Trail - Account Inactivity Notice',
      html: `
        <h2>Account Inactivity Notice</h2>
        <p>Dear ${user.name},</p>
        <p>We noticed that your account on The Narrow Trail has been inactive for 3 years.</p>
        <p><strong>Last Activity:</strong> ${new Date(user.last_active_at).toLocaleDateString()}</p>
        <p>In accordance with South Africa's Protection of Personal Information Act (POPIA), 
        we are required to delete personal information that is no longer necessary.</p>
        <p><strong>Action Required:</strong></p>
        <ul>
          <li>If you wish to keep your account, simply log in within the next year</li>
          <li>If you don't log in within 1 year, your account and data will be permanently deleted</li>
        </ul>
        <p>You can log in at: <a href="https://helloliam.web.app">https://helloliam.web.app</a></p>
        <p>If you have any questions, please contact us at steyncd@gmail.com</p>
        <p>Best regards,<br>The Narrow Trail Team</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Inactivity warning sent to ${user.email}`);
    } catch (error) {
      console.error(`Failed to send warning email to ${user.email}:`, error);
      throw error;
    }
  }

  /**
   * Helper: Perform cascading deletion of user data
   */
  async performUserDataDeletion(userId, reason) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Keep payment records for 5 years (already handled by purgeOldPaymentRecords)
      // Delete all other user data
      const tables = [
        'hike_interest',
        'hike_attendees', 
        'emergency_contacts',
        'hike_photos',
        'hike_comments',
        'feedback',
        'suggestions',
        'long_lived_tokens'
      ];

      const deletionCounts = {};
      for (const table of tables) {
        const result = await client.query(`DELETE FROM ${table} WHERE user_id = $1`, [userId]);
        deletionCounts[table] = result.rowCount;
      }

      // Soft delete the user (mark as deleted but keep record)
      await client.query(`
        UPDATE users 
        SET deleted_at = NOW(),
            email = 'deleted_' || id || '@deleted.local',
            name = 'Deleted User',
            phone = NULL,
            password_hash = NULL
        WHERE id = $1
      `, [userId]);

      // Log the deletion
      await client.query(`
        INSERT INTO data_retention_logs (user_id, action, reason, metadata)
        VALUES ($1, 'data_deleted', $2, $3)
      `, [userId, reason, JSON.stringify(deletionCounts)]);

      await client.query('COMMIT');
      console.log(`Deleted data for user ${userId}. Reason: ${reason}`);
      
      return deletionCounts;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error deleting user ${userId} data:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate retention compliance report
   */
  async generateRetentionReport(startDate, endDate) {
    try {
      const report = await pool.query(`
        SELECT 
          action,
          COUNT(*) as count,
          DATE_TRUNC('day', created_at) as date
        FROM data_retention_logs
        WHERE created_at BETWEEN $1 AND $2
        GROUP BY action, DATE_TRUNC('day', created_at)
        ORDER BY date DESC, action
      `, [startDate, endDate]);

      const stats = await pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE last_active_at < NOW() - INTERVAL '3 years') as inactive_3y,
          COUNT(*) FILTER (WHERE last_active_at < NOW() - INTERVAL '4 years') as inactive_4y,
          COUNT(*) FILTER (WHERE scheduled_deletion_at IS NOT NULL) as scheduled_deletions,
          COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_users
        FROM users
      `);

      return {
        activity_log: report.rows,
        current_stats: stats.rows[0]
      };
    } catch (error) {
      console.error('Error generating retention report:', error);
      throw error;
    }
  }
}

module.exports = new DataRetentionService();
```

### 4. Scheduled Job Runner

Use a job scheduler to run retention tasks automatically:

**Option A: Node-Cron (Simple, runs within app)**
```javascript
// Backend: server.js (add this section)
const cron = require('node-cron');
const dataRetentionService = require('./services/dataRetentionService');

// Run retention checks daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running daily data retention checks...');
  
  try {
    // Send warnings to 3-year inactive users
    const warningsSent = await dataRetentionService.sendInactivityWarnings();
    console.log(`Sent ${warningsSent} inactivity warnings`);

    // Delete data for 4-year inactive users
    const deletions = await dataRetentionService.deleteInactiveUserData();
    console.log(`Deleted data for ${deletions} inactive users`);

    // Purge payment records older than 5 years
    const purged = await dataRetentionService.purgeOldPaymentRecords();
    console.log(`Purged ${purged} old payment records`);
  } catch (error) {
    console.error('Data retention job failed:', error);
    // Optionally send alert email to admin
  }
});

console.log('Data retention scheduler initialized');
```

**Install node-cron:**
```bash
npm install node-cron
```

**Option B: Cloud Scheduler (Recommended for Cloud Run)**

Create a dedicated endpoint for retention jobs:

```javascript
// Backend: routes/cron.js (NEW FILE)
const express = require('express');
const router = express.Router();
const dataRetentionService = require('../services/dataRetentionService');

// Verify requests are from Cloud Scheduler
function verifyCloudScheduler(req, res, next) {
  const authHeader = req.headers['x-cloudscheduler'];
  const secret = process.env.CRON_SECRET;
  
  if (!secret || authHeader !== secret) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

router.post('/retention/warnings', verifyCloudScheduler, async (req, res) => {
  try {
    const count = await dataRetentionService.sendInactivityWarnings();
    res.json({ success: true, warnings_sent: count });
  } catch (error) {
    console.error('Warning job failed:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/retention/deletions', verifyCloudScheduler, async (req, res) => {
  try {
    const count = await dataRetentionService.deleteInactiveUserData();
    res.json({ success: true, deletions: count });
  } catch (error) {
    console.error('Deletion job failed:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/retention/purge-payments', verifyCloudScheduler, async (req, res) => {
  try {
    const count = await dataRetentionService.purgeOldPaymentRecords();
    res.json({ success: true, purged: count });
  } catch (error) {
    console.error('Purge job failed:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

**Configure Cloud Scheduler:**
```bash
# Create a secret for authentication
CRON_SECRET=$(openssl rand -hex 32)
echo "CRON_SECRET=$CRON_SECRET" >> .env

# Deploy updated backend with cron routes

# Create Cloud Scheduler jobs (run in Google Cloud Shell)
gcloud scheduler jobs create http retention-warnings \
  --schedule="0 2 * * *" \
  --uri="https://backend-554106646136.europe-west1.run.app/api/cron/retention/warnings" \
  --http-method=POST \
  --headers="x-cloudscheduler=$CRON_SECRET" \
  --location=europe-west1 \
  --time-zone="Africa/Johannesburg"

gcloud scheduler jobs create http retention-deletions \
  --schedule="0 3 * * *" \
  --uri="https://backend-554106646136.europe-west1.run.app/api/cron/retention/deletions" \
  --http-method=POST \
  --headers="x-cloudscheduler=$CRON_SECRET" \
  --location=europe-west1 \
  --time-zone="Africa/Johannesburg"

gcloud scheduler jobs create http retention-purge-payments \
  --schedule="0 4 1 * *" \
  --uri="https://backend-554106646136.europe-west1.run.app/api/cron/retention/purge-payments" \
  --http-method=POST \
  --headers="x-cloudscheduler=$CRON_SECRET" \
  --location=europe-west1 \
  --time-zone="Africa/Johannesburg"
```

### 5. Admin Dashboard Integration

Add retention monitoring to the admin panel:

**Backend: controllers/adminController.js - Add method:**
```javascript
exports.getRetentionStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE last_active_at < NOW() - INTERVAL '3 years' AND retention_warning_sent_at IS NULL) as needs_warning,
        COUNT(*) FILTER (WHERE retention_warning_sent_at IS NOT NULL AND scheduled_deletion_at > NOW()) as warned_active,
        COUNT(*) FILTER (WHERE scheduled_deletion_at IS NOT NULL AND scheduled_deletion_at <= NOW()) as ready_for_deletion,
        COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_total
      FROM users
    `);

    const recentActivity = await pool.query(`
      SELECT action, COUNT(*) as count
      FROM data_retention_logs
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY action
    `);

    res.json({
      stats: stats.rows[0],
      recent_activity: recentActivity.rows
    });
  } catch (error) {
    console.error('Error fetching retention stats:', error);
    res.status(500).json({ error: 'Failed to fetch retention statistics' });
  }
};
```

**Frontend: Create components/admin/RetentionDashboard.js:**
```javascript
import React, { useState, useEffect } from 'react';
import { Clock, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

function RetentionDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetchRetentionStats();
  }, []);

  const fetchRetentionStats = async () => {
    try {
      const response = await api.get('/admin/retention-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch retention stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <h2>Data Retention Monitoring</h2>
      
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <AlertTriangle className="text-warning mb-2" size={32} />
              <h5>Needs Warning</h5>
              <h2>{stats.stats.needs_warning}</h2>
              <small>Inactive 3+ years</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <Clock className="text-info mb-2" size={32} />
              <h5>Warned Users</h5>
              <h2>{stats.stats.warned_active}</h2>
              <small>Deletion scheduled</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <Trash2 className="text-danger mb-2" size={32} />
              <h5>Ready to Delete</h5>
              <h2>{stats.stats.ready_for_deletion}</h2>
              <small>Scheduled deletion passed</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <CheckCircle className="text-success mb-2" size={32} />
              <h5>Deleted Total</h5>
              <h2>{stats.stats.deleted_total}</h2>
              <small>All time</small>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h5>Recent Activity (Last 30 Days)</h5>
        </div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_activity.map((activity, idx) => (
                <tr key={idx}>
                  <td>{activity.action.replace('_', ' ').toUpperCase()}</td>
                  <td>{activity.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RetentionDashboard;
```

### 6. Email Configuration

Configure SMTP settings for sending retention warning emails:

**Add to backend/.env:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=steyncd@gmail.com
SMTP_PASS=your_app_password_here
SMTP_FROM=noreply@thenarrowtrail.co.za
CRON_SECRET=your_generated_secret_here
```

**For Gmail, create an App Password:**
1. Go to Google Account settings
2. Security → 2-Step Verification
3. App passwords → Generate new password
4. Copy the generated password to `SMTP_PASS`

### 7. Testing the Implementation

**Manual Testing Scripts:**

```javascript
// Backend: scripts/test-retention.js (NEW FILE)
const dataRetentionService = require('../services/dataRetentionService');

async function testRetention() {
  console.log('Testing data retention service...\n');

  // Test 1: Generate report
  console.log('1. Generating retention report...');
  const report = await dataRetentionService.generateRetentionReport(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    new Date()
  );
  console.log('Report:', JSON.stringify(report, null, 2));

  // Test 2: Check for users needing warnings (dry run)
  console.log('\n2. Checking for users needing warnings...');
  const result = await pool.query(`
    SELECT COUNT(*) as count
    FROM users
    WHERE last_active_at < NOW() - INTERVAL '3 years'
      AND retention_warning_sent_at IS NULL
      AND deleted_at IS NULL
  `);
  console.log(`Found ${result.rows[0].count} users needing warnings`);

  process.exit(0);
}

testRetention().catch(console.error);
```

**Run the test:**
```bash
node backend/scripts/test-retention.js
```

## Monitoring and Compliance

### Logging Strategy
- Log all retention actions to `data_retention_logs` table
- Include timestamp, user ID, action type, and metadata
- Retain logs for 7 years (POPIA compliance)

### Alert Notifications
Configure alerts for retention job failures:

```javascript
async function sendAdminAlert(subject, message) {
  const transporter = nodemailer.createTransporter({/* config */});
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: 'steyncd@gmail.com',
    subject: `[Retention Alert] ${subject}`,
    html: message
  });
}

// Use in cron jobs
try {
  await dataRetentionService.sendInactivityWarnings();
} catch (error) {
  await sendAdminAlert('Warning Job Failed', error.message);
}
```

### Compliance Checklist

- ✅ Inactive users warned after 3 years
- ✅ User data deleted after 4 years of inactivity
- ✅ Payment records retained for 5 years
- ✅ All deletion actions logged
- ✅ Users can reactivate account before deletion
- ✅ Admin dashboard for monitoring
- ✅ Email notifications sent
- ✅ Automated daily checks
- ✅ Manual deletion still available (user-initiated)

## Implementation Timeline

### Phase 1: Database Setup (Week 1)
1. Run database migration to add tracking fields
2. Create data_retention_logs table
3. Test with sample data

### Phase 2: Activity Tracking (Week 1)
1. Implement activity tracker middleware
2. Deploy and verify last_active_at updates
3. Monitor for 1 week

### Phase 3: Retention Service (Week 2)
1. Create DataRetentionService class
2. Implement warning email functionality
3. Test email delivery
4. Implement deletion logic
5. Test on staging/test users

### Phase 4: Automation (Week 3)
1. Choose scheduling method (node-cron vs Cloud Scheduler)
2. Configure scheduled jobs
3. Set up monitoring and alerts
4. Run first test execution

### Phase 5: Admin Dashboard (Week 4)
1. Create retention statistics endpoint
2. Build admin UI component
3. Add to admin navigation
4. Deploy and verify

### Phase 6: Monitoring (Ongoing)
1. Review logs weekly for first month
2. Monitor email deliverability
3. Check for false positives
4. Adjust thresholds if needed

## Backup Strategy

Before implementing automated deletion:

1. **Database Backups**: Ensure daily automated backups are configured
2. **Retention of Backups**: Keep backups for at least 90 days
3. **Test Restoration**: Verify backup restoration process works
4. **Pre-Deletion Snapshots**: Consider creating manual snapshot before first automated deletion run

## Compliance Documentation

Maintain records of:
- When retention policies were activated
- Number of warnings sent each month
- Number of accounts deleted each month
- Any retention policy changes
- User complaints or data restoration requests

## Future Enhancements

1. **User Self-Service**: Allow users to see their retention status in profile
2. **Flexible Retention**: Allow admins to adjust retention periods
3. **Data Export Before Deletion**: Automatically create and archive user data export before deletion
4. **Anonymization Option**: Instead of deletion, anonymize user data for analytics
5. **Compliance Reports**: Generate monthly POPIA compliance reports automatically

## Support and Troubleshooting

### Common Issues

**Emails not sending:**
- Check SMTP configuration in .env
- Verify Gmail app password is correct
- Check firewall allows SMTP port 465
- Review email logs for errors

**Jobs not running:**
- For node-cron: Check server uptime (Cloud Run may scale to zero)
- For Cloud Scheduler: Verify jobs are enabled in Cloud Console
- Check cron secret matches in both places
- Review Cloud Scheduler logs

**Too many false positives:**
- Review activity tracking implementation
- Verify last_active_at updates correctly
- Consider what counts as "activity"
- Adjust retention period if needed

## Contact

For questions about this implementation:
- **Email**: steyncd@gmail.com
- **Documentation**: See other docs in `/docs` folder

---

**Last Updated**: October 9, 2025  
**Version**: 1.0  
**Author**: The Narrow Trail Development Team
