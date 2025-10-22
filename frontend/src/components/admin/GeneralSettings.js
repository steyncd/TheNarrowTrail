import React, { useState, useEffect, useCallback } from 'react';
import {
  Save, RefreshCw, Bell, DollarSign, Mountain, UserPlus,
  ChevronDown, ChevronUp, Palette, Image, Lock, Car,
  Cloud, BarChart3, Settings
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import SettingToggle from '../settings/SettingToggle';
import SettingNumber from '../settings/SettingNumber';
import SettingText from '../settings/SettingText';
import SettingSelect from '../settings/SettingSelect';
import SettingTime from '../settings/SettingTime';
import SettingColor from '../settings/SettingColor';

const GeneralSettings = () => {
  const { token } = useAuth();
  const [settings, setSettings] = useState({});
  const [originalSettings, setOriginalSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [openSections, setOpenSections] = useState({ notifications: true }); // Start with notifications open
  const [hasChanges, setHasChanges] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAllSettings(token);
      
      const settingsObj = {};
      response.forEach(setting => {
        let value = setting.setting_value;
        
        if (setting.setting_type === 'boolean') {
          value = value === 'true' || value === true;
        } else if (setting.setting_type === 'number') {
          value = parseFloat(value);
        } else if (setting.setting_type === 'json') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            console.warn(`Failed to parse JSON for ${setting.setting_key}:`, e);
          }
        }
        
        settingsObj[setting.setting_key] = value;
      });
      
      setSettings(settingsObj);
      setOriginalSettings(settingsObj);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const updates = [];
      Object.keys(settings).forEach(key => {
        if (settings[key] !== originalSettings[key]) {
          let value = settings[key];
          
          if (typeof value === 'boolean') {
            value = value.toString();
          } else if (typeof value === 'object') {
            value = JSON.stringify(value);
          } else if (typeof value === 'number') {
            value = value.toString();
          }
          
          updates.push({ setting_key: key, setting_value: value });
        }
      });

      if (updates.length === 0) {
        setSuccess(true);
        return;
      }

      await api.updateSettingsBatch(updates, token);
      
      setSuccess(true);
      setOriginalSettings({ ...settings });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({ ...originalSettings });
    setError(null);
    setSuccess(false);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getSetting = (key, defaultValue = '') => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleClearWeatherCache = async () => {
    try {
      setClearingCache(true);
      setError(null);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/clear-weather-cache`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clear weather cache');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error clearing weather cache:', err);
      setError('Failed to clear weather cache: ' + err.message);
    } finally {
      setClearingCache(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setError(null);
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/upload-logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }

      const data = await response.json();
      updateSetting('branding_logo_url', data.url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError('Failed to upload logo: ' + err.message);
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setError(null);
      const formData = new FormData();
      formData.append('favicon', file);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/upload-favicon`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload favicon');
      }

      const data = await response.json();
      updateSetting('branding_favicon_url', data.url);

      // Update favicon in document head
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = data.url;
      document.getElementsByTagName('head')[0].appendChild(link);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error uploading favicon:', err);
      setError('Failed to upload favicon: ' + err.message);
    }
  };

  const SettingSection = ({ id, icon: Icon, title, children, color }) => (
    <div className="card mb-3">
      <div 
        className="card-header" 
        style={{ cursor: 'pointer', backgroundColor: `${color}15` }}
        onClick={() => toggleSection(id)}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Icon size={18} className="me-2" style={{ color }} />
            <strong>{title}</strong>
          </div>
          {openSections[id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
      {openSections[id] && (
        <div className="card-body">
          {children}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading settings...</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          Settings saved successfully!
          <button type="button" className="btn-close" onClick={() => setSuccess(false)}></button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <small className="text-muted">
          Configure portal-wide settings and policies
        </small>
        <div className="d-flex gap-2">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleReset}
            disabled={saving || !hasChanges}
          >
            <RefreshCw size={16} className="me-1" />
            Reset
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="me-1" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* NOTIFICATION SETTINGS */}
      <SettingSection id="notifications" icon={Bell} title="Notification Settings" color="#4a90e2">
        <h6 className="text-muted mb-3">Email Settings</h6>
        <SettingToggle
          label="Enable Email Notifications"
          description="Enable or disable email notifications globally"
          value={getSetting('notifications_email_enabled', true)}
          onChange={(val) => updateSetting('notifications_email_enabled', val)}
        />
        <SettingText
          label="Email Sender Name"
          description="Default sender name for outgoing emails"
          value={getSetting('notifications_email_sender_name', 'The Narrow Trail')}
          onChange={(val) => updateSetting('notifications_email_sender_name', val)}
        />
        <SettingText
          label="Reply-To Email"
          description="Email address for replies"
          value={getSetting('notifications_email_reply_to', 'info@thenarrowtrail.co.za')}
          onChange={(val) => updateSetting('notifications_email_reply_to', val)}
          type="email"
        />
        <SettingNumber
          label="Email Rate Limit"
          description="Maximum emails to send per hour"
          value={getSetting('notifications_email_rate_limit', 100)}
          onChange={(val) => updateSetting('notifications_email_rate_limit', val)}
          min={1}
          max={1000}
          unit="emails/hour"
        />

        <h6 className="text-muted mb-3 mt-4">SMS & WhatsApp</h6>
        <SettingToggle
          label="Enable SMS Notifications"
          value={getSetting('notifications_sms_enabled', true)}
          onChange={(val) => updateSetting('notifications_sms_enabled', val)}
        />
        <SettingToggle
          label="Enable WhatsApp Notifications"
          value={getSetting('notifications_whatsapp_enabled', false)}
          onChange={(val) => updateSetting('notifications_whatsapp_enabled', val)}
        />

        <h6 className="text-muted mb-3 mt-4">Notification Types</h6>
        <SettingToggle
          label="New Event Announcements"
          value={getSetting('notifications_new_hike_enabled', true)}
          onChange={(val) => updateSetting('notifications_new_hike_enabled', val)}
        />
        <SettingToggle
          label="Event Updates"
          value={getSetting('notifications_hike_update_enabled', true)}
          onChange={(val) => updateSetting('notifications_hike_update_enabled', val)}
        />
        <SettingToggle
          label="Payment Reminders"
          value={getSetting('notifications_payment_reminder_enabled', true)}
          onChange={(val) => updateSetting('notifications_payment_reminder_enabled', val)}
        />

        <h6 className="text-muted mb-3 mt-4">Notification Timing</h6>
        <SettingTime
          label="Quiet Hours Start"
          description="Start time for quiet hours (no notifications sent)"
          value={getSetting('notifications_quiet_hours_start', '22:00')}
          onChange={(val) => updateSetting('notifications_quiet_hours_start', val)}
        />
        <SettingTime
          label="Quiet Hours End"
          description="End time for quiet hours"
          value={getSetting('notifications_quiet_hours_end', '07:00')}
          onChange={(val) => updateSetting('notifications_quiet_hours_end', val)}
        />
        <SettingNumber
          label="Hike Reminder (hours before)"
          value={getSetting('notifications_hike_reminder_hours', 24)}
          onChange={(val) => updateSetting('notifications_hike_reminder_hours', val)}
          min={1}
          max={168}
          unit="hours"
        />
      </SettingSection>

      {/* PAYMENT SETTINGS */}
      <SettingSection id="payment" icon={DollarSign} title="Payment & Financial Settings" color="#27ae60">
        <h6 className="text-muted mb-3">Payment Methods</h6>
        <SettingToggle
          label="Accept Cash Payments"
          value={getSetting('payment_cash_enabled', true)}
          onChange={(val) => updateSetting('payment_cash_enabled', val)}
        />
        <SettingToggle
          label="Accept Bank Transfers"
          value={getSetting('payment_bank_transfer_enabled', true)}
          onChange={(val) => updateSetting('payment_bank_transfer_enabled', val)}
        />
        <SettingSelect
          label="Preferred Payment Method"
          value={getSetting('payment_preferred_method', 'bank_transfer')}
          onChange={(val) => updateSetting('payment_preferred_method', val)}
          options={[
            { value: 'cash', label: 'Cash' },
            { value: 'bank_transfer', label: 'Bank Transfer' },
            { value: 'online', label: 'Online Payment' }
          ]}
        />

        <h6 className="text-muted mb-3 mt-4">Payment Policies</h6>
        <SettingNumber
          label="Default Hike Cost"
          value={getSetting('payment_default_hike_cost', 150)}
          onChange={(val) => updateSetting('payment_default_hike_cost', val)}
          min={0}
          unit="ZAR"
        />
        <SettingNumber
          label="Payment Deadline (days before hike)"
          value={getSetting('payment_deadline_days', 7)}
          onChange={(val) => updateSetting('payment_deadline_days', val)}
          min={1}
          max={30}
          unit="days"
        />
        <SettingSelect
          label="Cancellation Refund Policy"
          value={getSetting('payment_cancellation_policy', 'partial')}
          onChange={(val) => updateSetting('payment_cancellation_policy', val)}
          options={[
            { value: 'full', label: 'Full Refund' },
            { value: 'partial', label: 'Partial Refund' },
            { value: 'none', label: 'No Refund' }
          ]}
        />

        <h6 className="text-muted mb-3 mt-4">Banking Details</h6>
        <SettingText
          label="Bank Name"
          value={getSetting('payment_bank_name', 'Standard Bank')}
          onChange={(val) => updateSetting('payment_bank_name', val)}
        />
        <SettingText
          label="Account Holder"
          value={getSetting('payment_account_holder', 'The Narrow Trail Hiking Club')}
          onChange={(val) => updateSetting('payment_account_holder', val)}
        />
        <SettingText
          label="Account Number"
          value={getSetting('payment_account_number', '')}
          onChange={(val) => updateSetting('payment_account_number', val)}
        />
        <SettingText
          label="Branch Code"
          value={getSetting('payment_branch_code', '')}
          onChange={(val) => updateSetting('payment_branch_code', val)}
        />
      </SettingSection>

      {/* HIKE MANAGEMENT SETTINGS */}
      <SettingSection id="hike" icon={Mountain} title="Hike Management Settings" color="#e67e22">
        <h6 className="text-muted mb-3">Default Settings</h6>
        <SettingNumber
          label="Default Capacity"
          value={getSetting('hike_default_capacity', 20)}
          onChange={(val) => updateSetting('hike_default_capacity', val)}
          min={1}
          max={100}
          unit="participants"
        />
        <SettingSelect
          label="Default Difficulty"
          value={getSetting('hike_default_difficulty', 'moderate')}
          onChange={(val) => updateSetting('hike_default_difficulty', val)}
          options={['easy', 'moderate', 'hard', 'extreme']}
        />
        <SettingToggle
          label="Enable Waitlist"
          value={getSetting('hike_waitlist_enabled', true)}
          onChange={(val) => updateSetting('hike_waitlist_enabled', val)}
        />

        <h6 className="text-muted mb-3 mt-4">Registration Policies</h6>
        <SettingNumber
          label="Registration Deadline (hours before)"
          value={getSetting('hike_registration_deadline_hours', 24)}
          onChange={(val) => updateSetting('hike_registration_deadline_hours', val)}
          min={1}
          max={168}
          unit="hours"
        />
        <SettingNumber
          label="Cancellation Deadline (hours before)"
          value={getSetting('hike_cancellation_deadline_hours', 48)}
          onChange={(val) => updateSetting('hike_cancellation_deadline_hours', val)}
          min={1}
          max={168}
          unit="hours"
        />

        <h6 className="text-muted mb-3 mt-4">Attendance Tracking</h6>
        <SettingToggle
          label="Auto-Mark No-Shows"
          value={getSetting('hike_auto_mark_no_shows', true)}
          onChange={(val) => updateSetting('hike_auto_mark_no_shows', val)}
        />
        <SettingNumber
          label="No-Show Threshold"
          description="Number of no-shows before suspension"
          value={getSetting('hike_no_show_threshold', 3)}
          onChange={(val) => updateSetting('hike_no_show_threshold', val)}
          min={1}
          max={10}
          unit="no-shows"
        />
      </SettingSection>

      {/* USER REGISTRATION & ONBOARDING */}
      <SettingSection id="registration" icon={UserPlus} title="User Registration & Onboarding" color="#9b59b6">
        <h6 className="text-muted mb-3">Registration Policy</h6>
        <SettingToggle
          label="Allow Self-Registration"
          value={getSetting('registration_allow_self_registration', true)}
          onChange={(val) => updateSetting('registration_allow_self_registration', val)}
        />
        <SettingToggle
          label="Require Admin Approval"
          value={getSetting('registration_require_admin_approval', true)}
          onChange={(val) => updateSetting('registration_require_admin_approval', val)}
        />
        <SettingToggle
          label="Require Email Verification"
          value={getSetting('registration_require_email_verification', true)}
          onChange={(val) => updateSetting('registration_require_email_verification', val)}
        />

        <h6 className="text-muted mb-3 mt-4">Required Fields</h6>
        <SettingToggle
          label="Phone Number Required"
          value={getSetting('registration_phone_required', true)}
          onChange={(val) => updateSetting('registration_phone_required', val)}
        />
        <SettingToggle
          label="Emergency Contact Required"
          value={getSetting('registration_emergency_contact_required', false)}
          onChange={(val) => updateSetting('registration_emergency_contact_required', val)}
        />

        <h6 className="text-muted mb-3 mt-4">Welcome Experience</h6>
        <SettingToggle
          label="Send Welcome Email"
          value={getSetting('registration_send_welcome_email', true)}
          onChange={(val) => updateSetting('registration_send_welcome_email', val)}
        />
        <SettingToggle
          label="Show Onboarding Tour"
          value={getSetting('registration_show_onboarding_tour', true)}
          onChange={(val) => updateSetting('registration_show_onboarding_tour', val)}
        />
      </SettingSection>

      {/* BRANDING & CUSTOMIZATION */}
      <SettingSection id="branding" icon={Palette} title="Branding & Customization" color="#e91e63">
        <h6 className="text-muted mb-3">Portal Information</h6>
        <SettingText
          label="Portal Name"
          value={getSetting('branding_portal_name', 'The Narrow Trail')}
          onChange={(val) => updateSetting('branding_portal_name', val)}
        />
        <SettingText
          label="Portal Tagline"
          value={getSetting('branding_portal_tagline', 'Hiking Community & Adventure')}
          onChange={(val) => updateSetting('branding_portal_tagline', val)}
        />
        <SettingText
          label="Contact Email"
          type="email"
          value={getSetting('branding_contact_email', 'info@thenarrowtrail.co.za')}
          onChange={(val) => updateSetting('branding_contact_email', val)}
        />

        <h6 className="text-muted mb-3 mt-4">Visual Settings</h6>

        <div className="mb-3">
          <label className="form-label text-muted small">Portal Logo</label>
          <div>
            {getSetting('branding_logo_url') && (
              <div className="mb-2">
                <img
                  src={getSetting('branding_logo_url')}
                  alt="Portal Logo"
                  style={{ maxHeight: '60px', maxWidth: '200px' }}
                  className="border rounded p-2"
                />
              </div>
            )}
            <input
              type="file"
              className="form-control form-control-sm"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleLogoUpload}
            />
            <small className="text-muted d-block mt-1">
              Upload a logo (PNG, JPG, or SVG). Recommended: 200x60px
            </small>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label text-muted small">Favicon</label>
          <div>
            {getSetting('branding_favicon_url') && (
              <div className="mb-2">
                <img
                  src={getSetting('branding_favicon_url')}
                  alt="Favicon"
                  style={{ maxHeight: '32px', maxWidth: '32px' }}
                  className="border rounded p-1"
                />
              </div>
            )}
            <input
              type="file"
              className="form-control form-control-sm"
              accept="image/x-icon,image/png"
              onChange={handleFaviconUpload}
            />
            <small className="text-muted d-block mt-1">
              Upload a favicon (ICO or PNG). Recommended: 32x32px
            </small>
          </div>
        </div>

        <SettingColor
          label="Primary Color"
          description="Main brand color used throughout the portal"
          value={getSetting('branding_primary_color', '#4a7c7c')}
          onChange={(val) => updateSetting('branding_primary_color', val)}
        />
        <SettingColor
          label="Secondary Color"
          description="Secondary brand color for accents"
          value={getSetting('branding_secondary_color', '#2d5a7c')}
          onChange={(val) => updateSetting('branding_secondary_color', val)}
        />
        <SettingSelect
          label="Default Theme"
          value={getSetting('branding_default_theme', 'light')}
          onChange={(val) => updateSetting('branding_default_theme', val)}
          options={[
            { value: 'light', label: 'Light Theme' },
            { value: 'dark', label: 'Dark Theme' },
            { value: 'auto', label: 'Auto (System)' }
          ]}
        />

        <h6 className="text-muted mb-3 mt-4">Landing Page</h6>
        <SettingToggle
          label="Show Upcoming Hikes"
          value={getSetting('branding_show_upcoming_hikes', true)}
          onChange={(val) => updateSetting('branding_show_upcoming_hikes', val)}
        />
        <SettingToggle
          label="Show Statistics"
          value={getSetting('branding_show_statistics', true)}
          onChange={(val) => updateSetting('branding_show_statistics', val)}
        />
      </SettingSection>

      {/* MEDIA & CONTENT */}
      <SettingSection id="media" icon={Image} title="Media & Content Settings" color="#ff9800">
        <h6 className="text-muted mb-3">Photo Upload Settings</h6>
        <SettingToggle
          label="Enable Photo Uploads"
          value={getSetting('media_photo_uploads_enabled', true)}
          onChange={(val) => updateSetting('media_photo_uploads_enabled', val)}
        />
        <SettingNumber
          label="Max File Size"
          value={getSetting('media_max_file_size_mb', 10)}
          onChange={(val) => updateSetting('media_max_file_size_mb', val)}
          min={1}
          max={50}
          unit="MB"
        />
        <SettingNumber
          label="Max Photos per Hike"
          value={getSetting('media_max_photos_per_hike', 50)}
          onChange={(val) => updateSetting('media_max_photos_per_hike', val)}
          min={10}
          max={200}
          unit="photos"
        />
        <SettingToggle
          label="Auto-Compress Images"
          description="Automatically compress uploaded images to save storage"
          value={getSetting('media_auto_compress', true)}
          onChange={(val) => updateSetting('media_auto_compress', val)}
        />

        <h6 className="text-muted mb-3 mt-4">Content Policies</h6>
        <SettingToggle
          label="Enable Comments"
          value={getSetting('media_comments_enabled', true)}
          onChange={(val) => updateSetting('media_comments_enabled', val)}
        />
        <SettingToggle
          label="Require Comment Moderation"
          value={getSetting('media_comments_require_moderation', false)}
          onChange={(val) => updateSetting('media_comments_require_moderation', val)}
        />
        <SettingToggle
          label="Enable Profanity Filter"
          value={getSetting('media_profanity_filter_enabled', true)}
          onChange={(val) => updateSetting('media_profanity_filter_enabled', val)}
        />
        <SettingNumber
          label="Max Comment Length"
          value={getSetting('media_max_comment_length', 500)}
          onChange={(val) => updateSetting('media_max_comment_length', val)}
          min={100}
          max={2000}
          unit="characters"
        />
      </SettingSection>

      {/* PRIVACY & SECURITY */}
      <SettingSection id="privacy" icon={Lock} title="Privacy & Security Settings" color="#673ab7">
        <h6 className="text-muted mb-3">Data Retention</h6>
        <SettingNumber
          label="Inactive User Threshold"
          description="Months before user considered inactive"
          value={getSetting('privacy_inactive_user_months', 12)}
          onChange={(val) => updateSetting('privacy_inactive_user_months', val)}
          min={3}
          max={36}
          unit="months"
        />
        <SettingToggle
          label="Auto-Delete Inactive Users"
          value={getSetting('privacy_auto_delete_inactive', false)}
          onChange={(val) => updateSetting('privacy_auto_delete_inactive', val)}
        />
        <SettingNumber
          label="Log Retention Period"
          value={getSetting('privacy_log_retention_days', 90)}
          onChange={(val) => updateSetting('privacy_log_retention_days', val)}
          min={30}
          max={365}
          unit="days"
        />

        <h6 className="text-muted mb-3 mt-4">Security Policies</h6>
        <SettingNumber
          label="Password Minimum Length"
          value={getSetting('security_password_min_length', 8)}
          onChange={(val) => updateSetting('security_password_min_length', val)}
          min={6}
          max={20}
          unit="characters"
        />
        <SettingNumber
          label="Max Login Attempts"
          value={getSetting('security_max_login_attempts', 5)}
          onChange={(val) => updateSetting('security_max_login_attempts', val)}
          min={3}
          max={10}
          unit="attempts"
        />
        <SettingNumber
          label="Session Timeout"
          description="Session timeout duration (8 hours = 480 minutes)"
          value={getSetting('security_session_timeout_minutes', 480)}
          onChange={(val) => updateSetting('security_session_timeout_minutes', val)}
          min={30}
          max={1440}
          unit="minutes"
        />

        <h6 className="text-muted mb-3 mt-4">Privacy Settings</h6>
        <SettingSelect
          label="Show Attendance Lists To"
          value={getSetting('privacy_show_attendance_lists', 'members')}
          onChange={(val) => updateSetting('privacy_show_attendance_lists', val)}
          options={[
            { value: 'public', label: 'Everyone (Public)' },
            { value: 'members', label: 'Members Only' },
            { value: 'admins', label: 'Admins Only' }
          ]}
        />
        <SettingToggle
          label="Allow Profile Search"
          value={getSetting('privacy_allow_profile_search', true)}
          onChange={(val) => updateSetting('privacy_allow_profile_search', val)}
        />
      </SettingSection>

      {/* CARPOOL & TRANSPORT */}
      <SettingSection id="carpool" icon={Car} title="Carpool & Transport Settings" color="#00bcd4">
        <h6 className="text-muted mb-3">Carpool Features</h6>
        <SettingToggle
          label="Enable Carpooling"
          value={getSetting('carpool_enabled', true)}
          onChange={(val) => updateSetting('carpool_enabled', val)}
        />
        <SettingToggle
          label="Suggest Fuel Cost Split"
          value={getSetting('carpool_suggest_fuel_split', true)}
          onChange={(val) => updateSetting('carpool_suggest_fuel_split', val)}
        />
        <SettingNumber
          label="Max Passengers per Car"
          value={getSetting('carpool_max_passengers', 4)}
          onChange={(val) => updateSetting('carpool_max_passengers', val)}
          min={1}
          max={8}
          unit="passengers"
        />

        <h6 className="text-muted mb-3 mt-4">Cost Sharing</h6>
        <SettingSelect
          label="Cost Calculation Method"
          value={getSetting('carpool_cost_method', 'equal')}
          onChange={(val) => updateSetting('carpool_cost_method', val)}
          options={[
            { value: 'equal', label: 'Equal Split' },
            { value: 'distance-based', label: 'Distance-Based' }
          ]}
        />
        <SettingNumber
          label="Average Fuel Price"
          value={getSetting('carpool_fuel_price_per_liter', 22.50)}
          onChange={(val) => updateSetting('carpool_fuel_price_per_liter', val)}
          min={10}
          max={50}
          step={0.10}
          unit="ZAR/liter"
        />
        <SettingNumber
          label="Average Fuel Consumption"
          value={getSetting('carpool_avg_consumption', 8.0)}
          onChange={(val) => updateSetting('carpool_avg_consumption', val)}
          min={5}
          max={20}
          step={0.1}
          unit="L/100km"
        />
        <SettingToggle
          label="Include Toll Fees"
          value={getSetting('carpool_include_toll_fees', true)}
          onChange={(val) => updateSetting('carpool_include_toll_fees', val)}
        />
      </SettingSection>

      {/* WEATHER & ENVIRONMENTAL */}
      <SettingSection id="weather_enhanced" icon={Cloud} title="Weather & Environmental Settings" color="#03a9f4">
        <h6 className="text-muted mb-3">Display Options</h6>
        <SettingToggle
          label="Show Extended Forecast"
          description="Display 7-day forecast instead of 3-day"
          value={getSetting('weather_show_extended_forecast', true)}
          onChange={(val) => updateSetting('weather_show_extended_forecast', val)}
        />
        <SettingToggle
          label="Show UV Index"
          value={getSetting('weather_show_uv_index', true)}
          onChange={(val) => updateSetting('weather_show_uv_index', val)}
        />
        <SettingToggle
          label="Show Sunrise/Sunset Times"
          value={getSetting('weather_show_sun_times', true)}
          onChange={(val) => updateSetting('weather_show_sun_times', val)}
        />
        <SettingToggle
          label="Show Moon Phase"
          value={getSetting('weather_show_moon_phase', true)}
          onChange={(val) => updateSetting('weather_show_moon_phase', val)}
        />

        <h6 className="text-muted mb-3 mt-4">Units</h6>
        <SettingSelect
          label="Temperature Unit"
          value={getSetting('weather_temperature_unit', 'celsius')}
          onChange={(val) => updateSetting('weather_temperature_unit', val)}
          options={[
            { value: 'celsius', label: 'Celsius (°C)' },
            { value: 'fahrenheit', label: 'Fahrenheit (°F)' }
          ]}
        />
        <SettingSelect
          label="Wind Speed Unit"
          value={getSetting('weather_wind_speed_unit', 'km/h')}
          onChange={(val) => updateSetting('weather_wind_speed_unit', val)}
          options={[
            { value: 'km/h', label: 'km/h' },
            { value: 'm/s', label: 'm/s' },
            { value: 'mph', label: 'mph' }
          ]}
        />
      </SettingSection>

      {/* ANALYTICS & REPORTING */}
      <SettingSection id="analytics" icon={BarChart3} title="Analytics & Reporting Settings" color="#8bc34a">
        <h6 className="text-muted mb-3">Data Collection</h6>
        <SettingToggle
          label="Track Page Views"
          value={getSetting('analytics_track_page_views', true)}
          onChange={(val) => updateSetting('analytics_track_page_views', val)}
        />
        <SettingToggle
          label="Track User Actions"
          value={getSetting('analytics_track_user_actions', true)}
          onChange={(val) => updateSetting('analytics_track_user_actions', val)}
        />
        <SettingToggle
          label="Anonymize IP Addresses"
          description="POPIA compliance - anonymize user IP addresses"
          value={getSetting('analytics_anonymize_ips', true)}
          onChange={(val) => updateSetting('analytics_anonymize_ips', val)}
        />

        <h6 className="text-muted mb-3 mt-4">Public Statistics</h6>
        <SettingToggle
          label="Show Total Hikers"
          description="Display total hikers count on landing page"
          value={getSetting('analytics_show_total_hikers', true)}
          onChange={(val) => updateSetting('analytics_show_total_hikers', val)}
        />
        <SettingToggle
          label="Show Total Hikes"
          description="Display completed hikes count on landing page"
          value={getSetting('analytics_show_total_hikes', true)}
          onChange={(val) => updateSetting('analytics_show_total_hikes', val)}
        />
        <SettingToggle
          label="Show Total Distance"
          description="Display total distance hiked"
          value={getSetting('analytics_show_total_distance', false)}
          onChange={(val) => updateSetting('analytics_show_total_distance', val)}
        />
      </SettingSection>

      {/* SYSTEM & MAINTENANCE */}
      <SettingSection id="system" icon={Settings} title="System & Maintenance Settings" color="#607d8b">
        <h6 className="text-muted mb-3">Performance</h6>
        <SettingNumber
          label="Page Size"
          description="Default items per page in lists"
          value={getSetting('system_page_size', 20)}
          onChange={(val) => updateSetting('system_page_size', val)}
          min={10}
          max={100}
          unit="items"
        />
        <SettingToggle
          label="Enable Caching"
          value={getSetting('system_cache_enabled', true)}
          onChange={(val) => updateSetting('system_cache_enabled', val)}
        />
        <SettingNumber
          label="Cache Duration"
          value={getSetting('system_cache_duration_seconds', 300)}
          onChange={(val) => updateSetting('system_cache_duration_seconds', val)}
          min={60}
          max={3600}
          unit="seconds"
        />

        <div className="mb-3">
          <label className="form-label text-muted small">Cache Management</label>
          <div>
            <button
              className="btn btn-outline-warning btn-sm"
              onClick={handleClearWeatherCache}
              disabled={clearingCache}
            >
              {clearingCache ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                  Clearing...
                </>
              ) : (
                <>
                  <RefreshCw size={14} className="me-1" />
                  Clear Weather Cache
                </>
              )}
            </button>
            <small className="text-muted d-block mt-1">
              Clears cached weather data to force refresh from weather API
            </small>
          </div>
        </div>

        <h6 className="text-muted mb-3 mt-4">Maintenance Mode</h6>
        <SettingToggle
          label="Enable Maintenance Mode"
          description="Show maintenance page to all users except admins"
          value={getSetting('system_maintenance_mode', false)}
          onChange={(val) => updateSetting('system_maintenance_mode', val)}
        />
        <SettingText
          label="Maintenance Message"
          description="Message displayed during maintenance"
          value={getSetting('system_maintenance_message', 'The portal is currently undergoing maintenance. Please check back soon.')}
          onChange={(val) => updateSetting('system_maintenance_message', val)}
          multiline
        />

        <h6 className="text-muted mb-3 mt-4">Error Handling</h6>
        <SettingSelect
          label="Log Level"
          value={getSetting('system_log_level', 'info')}
          onChange={(val) => updateSetting('system_log_level', val)}
          options={[
            { value: 'error', label: 'Error Only' },
            { value: 'warn', label: 'Warnings & Errors' },
            { value: 'info', label: 'Info, Warnings & Errors' },
            { value: 'debug', label: 'Debug (All)' }
          ]}
        />
      </SettingSection>
    </div>
  );
};

export default GeneralSettings;
