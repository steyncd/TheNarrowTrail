// services/settingsService.js - System settings service
const pool = require('../config/database');

// Cache for settings (in-memory cache with 5-minute TTL)
let settingsCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get all system settings from database
 * @returns {Object} Settings object with key-value pairs
 */
async function getAllSettings() {
  try {
    // Check cache first
    if (settingsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
      return settingsCache;
    }

    const result = await pool.query('SELECT setting_key, setting_value, setting_type FROM system_settings');

    const settings = {};
    result.rows.forEach(row => {
      let value = row.setting_value;

      // Parse based on type
      if (row.setting_type === 'boolean') {
        value = value === 'true' || value === true;
      } else if (row.setting_type === 'number') {
        value = parseFloat(value);
      } else if (row.setting_type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.warn(`Failed to parse JSON for ${row.setting_key}:`, e);
        }
      }

      settings[row.setting_key] = value;
    });

    // Update cache
    settingsCache = settings;
    cacheTimestamp = Date.now();

    return settings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {};
  }
}

/**
 * Get a specific setting value
 * @param {string} key - Setting key
 * @param {*} defaultValue - Default value if setting not found
 * @returns {*} Setting value or default value
 */
async function getSetting(key, defaultValue = null) {
  try {
    const settings = await getAllSettings();
    return settings[key] !== undefined ? settings[key] : defaultValue;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Update a setting value
 * @param {string} key - Setting key
 * @param {*} value - Setting value
 * @param {number} updatedBy - User ID who updated the setting
 * @returns {boolean} Success status
 */
async function updateSetting(key, value, updatedBy = null) {
  try {
    // Convert value to string for storage
    let stringValue = value;
    if (typeof value === 'boolean') {
      stringValue = value.toString();
    } else if (typeof value === 'object') {
      stringValue = JSON.stringify(value);
    } else if (typeof value === 'number') {
      stringValue = value.toString();
    }

    await pool.query(
      `UPDATE system_settings
       SET setting_value = $1, updated_at = NOW(), updated_by = $2
       WHERE setting_key = $3`,
      [stringValue, updatedBy, key]
    );

    // Clear cache to force refresh
    settingsCache = null;
    cacheTimestamp = null;

    return true;
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error);
    return false;
  }
}

/**
 * Clear the settings cache (call after bulk updates)
 */
function clearCache() {
  settingsCache = null;
  cacheTimestamp = null;
}

/**
 * Get registration-related settings
 * @returns {Object} Registration settings
 */
async function getRegistrationSettings() {
  const settings = await getAllSettings();
  return {
    allow_self_registration: settings['registration_allow_self_registration'] ?? true,
    require_admin_approval: settings['registration_require_admin_approval'] ?? true,
    require_email_verification: settings['registration_require_email_verification'] ?? true,
    require_phone_verification: settings['registration_require_phone_verification'] ?? false,
    phone_required: settings['registration_phone_required'] ?? true,
    emergency_contact_required: settings['registration_emergency_contact_required'] ?? false,
    send_welcome_email: settings['registration_send_welcome_email'] ?? true,
    show_onboarding_tour: settings['registration_show_onboarding_tour'] ?? true,
    auto_approve_domains: settings['registration_auto_approve_domains'] ?? []
  };
}

/**
 * Get notification-related settings
 * @returns {Object} Notification settings
 */
async function getNotificationSettings() {
  const settings = await getAllSettings();
  return {
    email_enabled: settings['notifications_email_enabled'] ?? true,
    email_sender_name: settings['notifications_email_sender_name'] ?? 'The Narrow Trail',
    email_reply_to: settings['notifications_email_reply_to'] ?? 'info@thenarrowtrail.co.za',
    sms_enabled: settings['notifications_sms_enabled'] ?? true,
    whatsapp_enabled: settings['notifications_whatsapp_enabled'] ?? false,
    quiet_hours_start: settings['notifications_quiet_hours_start'] ?? '22:00',
    quiet_hours_end: settings['notifications_quiet_hours_end'] ?? '07:00',
    new_hike_enabled: settings['notifications_new_hike_enabled'] ?? true,
    hike_update_enabled: settings['notifications_hike_update_enabled'] ?? true,
    payment_reminder_enabled: settings['notifications_payment_reminder_enabled'] ?? true,
    hike_reminder_hours: settings['notifications_hike_reminder_hours'] ?? 24
  };
}

/**
 * Get payment-related settings
 * @returns {Object} Payment settings
 */
async function getPaymentSettings() {
  const settings = await getAllSettings();
  return {
    cash_enabled: settings['payment_cash_enabled'] ?? true,
    bank_transfer_enabled: settings['payment_bank_transfer_enabled'] ?? true,
    online_enabled: settings['payment_online_enabled'] ?? false,
    preferred_method: settings['payment_preferred_method'] ?? 'bank_transfer',
    default_hike_cost: settings['payment_default_hike_cost'] ?? 150,
    deadline_days: settings['payment_deadline_days'] ?? 7,
    cancellation_policy: settings['payment_cancellation_policy'] ?? 'partial',
    bank_name: settings['payment_bank_name'] ?? 'Standard Bank',
    account_holder: settings['payment_account_holder'] ?? 'The Narrow Trail Hiking Club',
    account_number: settings['payment_account_number'] ?? '',
    branch_code: settings['payment_branch_code'] ?? ''
  };
}

/**
 * Get hike management settings
 * @returns {Object} Hike settings
 */
async function getHikeSettings() {
  const settings = await getAllSettings();
  return {
    default_capacity: settings['hike_default_capacity'] ?? 20,
    default_difficulty: settings['hike_default_difficulty'] ?? 'moderate',
    waitlist_enabled: settings['hike_waitlist_enabled'] ?? true,
    registration_deadline_hours: settings['hike_registration_deadline_hours'] ?? 24,
    cancellation_deadline_hours: settings['hike_cancellation_deadline_hours'] ?? 48,
    auto_mark_no_shows: settings['hike_auto_mark_no_shows'] ?? true,
    no_show_threshold: settings['hike_no_show_threshold'] ?? 3
  };
}

/**
 * Check if current time is within quiet hours
 * @returns {boolean} True if within quiet hours
 */
async function isQuietHours() {
  try {
    const settings = await getNotificationSettings();
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = settings.quiet_hours_start.split(':').map(Number);
    const [endHour, endMin] = settings.quiet_hours_end.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 - 07:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime;
    }

    return currentTime >= startTime && currentTime < endTime;
  } catch (error) {
    console.error('Error checking quiet hours:', error);
    return false; // Default to not quiet hours on error
  }
}

module.exports = {
  getAllSettings,
  getSetting,
  updateSetting,
  clearCache,
  getRegistrationSettings,
  getNotificationSettings,
  getPaymentSettings,
  getHikeSettings,
  isQuietHours
};
