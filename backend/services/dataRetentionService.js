// services/dataRetentionService.js - POPIA Data Retention Compliance Service
const pool = require('../config/database');
const { sendEmail } = require('./notificationService');
const cron = require('node-cron');

/**
 * DataRetentionService handles automated POPIA compliance for data retention
 * - Tracks user activity to determine retention periods
 * - Sends 3-year inactivity warnings 
 * - Schedules and executes 4-year data deletions
 * - Maintains comprehensive audit logs
 */
class DataRetentionService {
  constructor() {
    this.isRunning = false;
    this.logger = console; // Can be replaced with proper logging service
    
    // POPIA retention periods (configurable)
    this.RETENTION_WARNING_PERIOD = 3 * 365; // 3 years in days
    this.RETENTION_DELETION_PERIOD = 4 * 365; // 4 years in days
    this.WARNING_GRACE_PERIOD = 90; // 90 days to respond to warning
  }

  /**
   * Start the automated retention service with scheduled jobs
   */
  start() {
    if (this.isRunning) {
      this.logger.warn('Data retention service is already running');
      return;
    }

    this.logger.info('Starting POPIA Data Retention Service...');
    
    // Daily check for users requiring retention warnings (runs at 02:00 UTC)
    this.warningJob = cron.schedule('0 2 * * *', async () => {
      await this.processRetentionWarnings();
    }, { scheduled: false });

    // Daily check for users scheduled for deletion (runs at 03:00 UTC) 
    this.deletionJob = cron.schedule('0 3 * * *', async () => {
      await this.processScheduledDeletions();
    }, { scheduled: false });

    // Weekly cleanup of old retention logs (runs Sundays at 04:00 UTC)
    this.cleanupJob = cron.schedule('0 4 * * 0', async () => {
      await this.cleanupOldLogs();
    }, { scheduled: false });

    // Start all scheduled jobs
    this.warningJob.start();
    this.deletionJob.start();
    this.cleanupJob.start();
    
    this.isRunning = true;
    this.logger.info('Data retention service started successfully');
  }

  /**
   * Stop the automated retention service
   */
  stop() {
    if (!this.isRunning) {
      this.logger.warn('Data retention service is not running');
      return;
    }

    this.logger.info('Stopping POPIA Data Retention Service...');
    
    if (this.warningJob) this.warningJob.stop();
    if (this.deletionJob) this.deletionJob.stop();
    if (this.cleanupJob) this.cleanupJob.stop();
    
    this.isRunning = false;
    this.logger.info('Data retention service stopped');
  }

  /**
   * Find users who need 3-year inactivity warnings
   * Users who have been inactive for 3+ years but haven't received a warning yet
   */
  async findUsersForWarning() {
    const client = await pool.connect();
    try {
      const query = `
        SELECT id, email, name, last_active_at, created_at
        FROM users 
        WHERE 
          -- User hasn't been active for 3+ years
          (last_active_at IS NULL AND created_at <= NOW() - INTERVAL '${this.RETENTION_WARNING_PERIOD} days')
          OR (last_active_at <= NOW() - INTERVAL '${this.RETENTION_WARNING_PERIOD} days')
          -- No warning sent yet
          AND retention_warning_sent_at IS NULL
          -- User is not already scheduled for deletion
          AND scheduled_deletion_at IS NULL
          -- Only include active users (not already deleted/deactivated)
          AND status IN ('approved', 'pending')
        ORDER BY 
          COALESCE(last_active_at, created_at) ASC
      `;
      
      const result = await client.query(query);
      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Send retention warning email to user using existing SendGrid integration
   */
  async sendRetentionWarning(user) {
    const lastActiveDate = user.last_active_at || user.created_at;
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + this.WARNING_GRACE_PERIOD);

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Important: Data Retention Notice</h2>
        <p>Dear ${user.name},</p>
        
        <p>We hope this message finds you well. We're reaching out regarding your account with our hiking platform.</p>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>⚠️ Account Inactivity Notice</h3>
          <p>Your account has been inactive since <strong>${new Date(lastActiveDate).toLocaleDateString()}</strong>.</p>
          <p>In compliance with POPIA (Protection of Personal Information Act), we will delete inactive accounts and associated data after 4 years of inactivity.</p>
        </div>
        
        <h3>What happens next?</h3>
        <ul>
          <li>Your data is currently scheduled for deletion on <strong>${deletionDate.toLocaleDateString()}</strong></li>
          <li>To keep your account active, simply log in to our platform before this date</li>
          <li>If you no longer wish to use our services, no action is required</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://hiking-portal-connected.web.app'}/login" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login to Keep Account Active
          </a>
        </div>
        
        <p><strong>What data will be deleted?</strong></p>
        <ul>
          <li>Your user profile and account information</li>
          <li>Hike participation history</li>
          <li>Photos and feedback you've shared</li>
          <li>Payment records (anonymized after deletion)</li>
        </ul>
        
        <p>If you have any questions or concerns, please contact us at ${process.env.SUPPORT_EMAIL || 'support@hiking.com'}.</p>
        
        <p>Thank you for being part of our hiking community.</p>
        <p>Best regards,<br>The Hiking Portal Team</p>
        
        <div style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
          <p>This notice is sent in compliance with POPIA (Protection of Personal Information Act). 
          You received this email because you have an account with us that has been inactive for 3+ years.</p>
        </div>
      </div>
    `;

    // Use existing SendGrid integration - no user ID passed as this is a system notification
    const emailSent = await sendEmail(
      user.email,
      'Important: Data Retention Notice - Action Required',
      emailHTML
    );

    if (!emailSent) {
      throw new Error('Failed to send retention warning email via SendGrid');
    }

    return true;
  }

  /**
   * Process users who need retention warnings
   */
  async processRetentionWarnings() {
    this.logger.info('Starting retention warnings process...');
    
    try {
      const usersForWarning = await this.findUsersForWarning();
      this.logger.info(`Found ${usersForWarning.length} users requiring retention warnings`);

      let successCount = 0;
      let errorCount = 0;

      for (const user of usersForWarning) {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          // Send warning email
          await this.sendRetentionWarning(user);

          // Update user record with warning sent date and schedule deletion
          const deletionDate = new Date();
          deletionDate.setDate(deletionDate.getDate() + this.WARNING_GRACE_PERIOD);

          await client.query(`
            UPDATE users 
            SET 
              retention_warning_sent_at = NOW(),
              scheduled_deletion_at = $1
            WHERE id = $2
          `, [deletionDate, user.id]);

          // Log the warning action
          await client.query(`
            INSERT INTO data_retention_logs (user_id, action, reason, metadata, performed_by)
            VALUES ($1, 'warning_sent', 'automatic_3_year_inactivity', $2, 'system')
          `, [user.id, JSON.stringify({
            last_active_at: user.last_active_at,
            warning_sent_at: new Date().toISOString(),
            scheduled_deletion_at: deletionDate.toISOString(),
            grace_period_days: this.WARNING_GRACE_PERIOD
          })]);

          await client.query('COMMIT');
          successCount++;
          
          this.logger.info(`Warning sent to user ${user.email} (ID: ${user.id})`);
        } catch (error) {
          await client.query('ROLLBACK');
          errorCount++;
          this.logger.error(`Failed to process warning for user ${user.email}:`, error);
        } finally {
          client.release();
        }
      }

      this.logger.info(`Retention warnings completed: ${successCount} sent, ${errorCount} errors`);
    } catch (error) {
      this.logger.error('Error in retention warnings process:', error);
    }
  }

  /**
   * Find users scheduled for deletion
   */
  async findUsersForDeletion() {
    const client = await pool.connect();
    try {
      const query = `
        SELECT id, email, name, scheduled_deletion_at, retention_warning_sent_at
        FROM users 
        WHERE 
          scheduled_deletion_at IS NOT NULL 
          AND scheduled_deletion_at <= NOW()
          AND status NOT IN ('deleted', 'archived')
        ORDER BY scheduled_deletion_at ASC
      `;
      
      const result = await client.query(query);
      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Delete user data while preserving anonymized payment records for compliance
   */
  async deleteUserData(userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Anonymize payment records (preserve for tax/audit purposes)
      await client.query(`
        UPDATE hike_payments 
        SET 
          user_email = 'deleted-user-' || user_id || '@anonymized.local',
          metadata = jsonb_set(
            COALESCE(metadata, '{}'),
            '{original_deleted_at}',
            to_jsonb(NOW())
          )
        WHERE user_id = $1
      `, [userId]);

      // 2. Delete user-generated content
      const deletionQueries = [
        'DELETE FROM feedback WHERE user_id = $1',
        'DELETE FROM suggestions WHERE user_id = $1', 
        'DELETE FROM hike_interest WHERE user_id = $1',
        'DELETE FROM photos WHERE user_id = $1',
        'DELETE FROM notification_log WHERE user_id = $1',
        'DELETE FROM signin_log WHERE user_id = $1',
        'DELETE FROM activity_log WHERE user_id = $1',
        'DELETE FROM long_lived_tokens WHERE user_id = $1'
      ];

      for (const query of deletionQueries) {
        await client.query(query, [userId]);
      }

      // 3. Update user record to mark as deleted (preserve for audit trail)
      await client.query(`
        UPDATE users SET 
          status = 'deleted',
          email = 'deleted-user-' || id || '@anonymized.local',
          name = 'Deleted User',
          phone = NULL,
          password = NULL,
          email_verification_token = NULL,
          profile_picture = NULL,
          emergency_contact = NULL,
          medical_conditions = NULL,
          dietary_requirements = NULL,
          last_active_at = NULL,
          retention_warning_sent_at = NULL,
          scheduled_deletion_at = NULL
        WHERE id = $1
      `, [userId]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process users scheduled for deletion
   */
  async processScheduledDeletions() {
    this.logger.info('Starting scheduled deletions process...');
    
    try {
      const usersForDeletion = await this.findUsersForDeletion();
      this.logger.info(`Found ${usersForDeletion.length} users scheduled for deletion`);

      let successCount = 0;
      let errorCount = 0;

      for (const user of usersForDeletion) {
        try {
          // Delete user data
          await this.deleteUserData(user.id);

          // Log the deletion action
          const client = await pool.connect();
          try {
            await client.query(`
              INSERT INTO data_retention_logs (user_id, action, reason, metadata, performed_by)
              VALUES ($1, 'data_deleted', 'automatic_4_year_retention_policy', $2, 'system')
            `, [user.id, JSON.stringify({
              deletion_date: new Date().toISOString(),
              warning_sent_at: user.retention_warning_sent_at,
              scheduled_deletion_at: user.scheduled_deletion_at,
              grace_period_expired: true
            })]);
          } finally {
            client.release();
          }

          successCount++;
          this.logger.info(`User data deleted for ${user.email} (ID: ${user.id})`);
        } catch (error) {
          errorCount++;
          this.logger.error(`Failed to delete data for user ${user.email}:`, error);
        }
      }

      this.logger.info(`Scheduled deletions completed: ${successCount} processed, ${errorCount} errors`);
    } catch (error) {
      this.logger.error('Error in scheduled deletions process:', error);
    }
  }

  /**
   * Update user's last activity timestamp
   */
  async updateUserActivity(userId) {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          UPDATE users 
          SET last_active_at = NOW()
          WHERE id = $1 AND status NOT IN ('deleted', 'archived')
        `, [userId]);
      } finally {
        client.release();
      }
    } catch (error) {
      this.logger.error(`Failed to update activity for user ${userId}:`, error);
    }
  }

  /**
   * Extend retention for a user (admin action)
   */
  async extendUserRetention(userId, extensionDays, reason, adminId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const newDeletionDate = new Date();
      newDeletionDate.setDate(newDeletionDate.getDate() + extensionDays);

      await client.query(`
        UPDATE users 
        SET 
          scheduled_deletion_at = $1,
          last_active_at = NOW()
        WHERE id = $2
      `, [newDeletionDate, userId]);

      // Log the retention extension
      await client.query(`
        INSERT INTO data_retention_logs (user_id, action, reason, metadata, performed_by)
        VALUES ($1, 'retention_extended', $2, $3, $4)
      `, [userId, reason, JSON.stringify({
        extension_days: extensionDays,
        new_deletion_date: newDeletionDate.toISOString(),
        extended_at: new Date().toISOString()
      }), `admin:${adminId}`]);

      await client.query('COMMIT');
      this.logger.info(`Retention extended for user ${userId} by ${extensionDays} days`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get retention statistics for admin dashboard
   */
  async getRetentionStatistics() {
    const client = await pool.connect();
    try {
      const stats = {};

      // Users needing warnings
      const warningQuery = `
        SELECT COUNT(*) as count
        FROM users 
        WHERE 
          ((last_active_at IS NULL AND created_at <= NOW() - INTERVAL '${this.RETENTION_WARNING_PERIOD} days')
          OR (last_active_at <= NOW() - INTERVAL '${this.RETENTION_WARNING_PERIOD} days'))
          AND retention_warning_sent_at IS NULL
          AND scheduled_deletion_at IS NULL
          AND status IN ('approved', 'pending')
      `;
      const warningResult = await client.query(warningQuery);
      stats.usersNeedingWarning = parseInt(warningResult.rows[0].count);

      // Users with warnings sent
      const warnedQuery = `
        SELECT COUNT(*) as count
        FROM users 
        WHERE retention_warning_sent_at IS NOT NULL 
        AND scheduled_deletion_at > NOW()
        AND status IN ('approved', 'pending')
      `;
      const warnedResult = await client.query(warnedQuery);
      stats.usersWithWarningsSent = parseInt(warnedResult.rows[0].count);

      // Users scheduled for deletion
      const scheduledQuery = `
        SELECT COUNT(*) as count
        FROM users 
        WHERE scheduled_deletion_at IS NOT NULL 
        AND scheduled_deletion_at <= NOW()
        AND status NOT IN ('deleted', 'archived')
      `;
      const scheduledResult = await client.query(scheduledQuery);
      stats.usersScheduledForDeletion = parseInt(scheduledResult.rows[0].count);

      // Total deleted users
      const deletedQuery = `
        SELECT COUNT(*) as count
        FROM users 
        WHERE status = 'deleted'
      `;
      const deletedResult = await client.query(deletedQuery);
      stats.totalDeletedUsers = parseInt(deletedResult.rows[0].count);

      // Recent retention actions (last 30 days)
      const recentActionsQuery = `
        SELECT action, COUNT(*) as count
        FROM data_retention_logs 
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY action
        ORDER BY count DESC
      `;
      const actionsResult = await client.query(recentActionsQuery);
      stats.recentActions = actionsResult.rows;

      return stats;
    } finally {
      client.release();
    }
  }

  /**
   * Clean up old retention logs (keep last 2 years)
   */
  async cleanupOldLogs() {
    this.logger.info('Starting retention logs cleanup...');
    
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          DELETE FROM data_retention_logs 
          WHERE created_at < NOW() - INTERVAL '2 years'
        `);
        
        this.logger.info(`Cleaned up ${result.rowCount} old retention log entries`);
      } finally {
        client.release();
      }
    } catch (error) {
      this.logger.error('Error cleaning up retention logs:', error);
    }
  }

  /**
   * Manual run of retention processes (for testing/admin use)
   */
  async runManualCheck() {
    this.logger.info('Running manual retention check...');
    
    await this.processRetentionWarnings();
    await this.processScheduledDeletions();
    
    const stats = await this.getRetentionStatistics();
    this.logger.info('Manual retention check completed', stats);
    
    return stats;
  }
}

// Export singleton instance
module.exports = new DataRetentionService();