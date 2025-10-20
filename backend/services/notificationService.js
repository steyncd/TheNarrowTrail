// services/notificationService.js - Email and SMS notification services
const pool = require('../config/database');
const notificationPreferencesController = require('../controllers/notificationPreferencesController');
const { getNotificationSettings, isQuietHours } = require('./settingsService');

// Initialize SendGrid (optional)
let sgMail = null;
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'placeholder') {
  sgMail = require('@sendgrid/mail');
  const apiKey = process.env.SENDGRID_API_KEY.trim();
  sgMail.setApiKey(apiKey);
  console.log('SendGrid configured');
}

// Initialize Twilio for SMS (optional)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_ACCOUNT_SID !== 'placeholder' &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_AUTH_TOKEN !== 'placeholder') {
  const twilio = require('twilio');
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID.trim(),
    process.env.TWILIO_AUTH_TOKEN.trim()
  );
  console.log('Twilio configured for SMS');
}

// Log notification to database
async function logNotification(type, recipient, subject, message, status, error = null) {
  try {
    await pool.query(
      `INSERT INTO notification_log (type, recipient, subject, message, status, error, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [type, recipient, subject, message, status, error]
    );
  } catch (err) {
    console.error('Failed to log notification:', err);
  }
}

// Send Email with notification preference check
async function sendEmail(to, subject, html, userId = null, notificationType = null) {
  // Check global notification settings first
  const globalSettings = await getNotificationSettings();

  // Check if email notifications are globally enabled
  if (!globalSettings.email_enabled) {
    console.log(`Email to ${to} skipped - email notifications globally disabled`);
    await logNotification('email', to, subject, html, 'skipped', 'Email notifications globally disabled');
    return false;
  }

  // Check if we're in quiet hours
  if (await isQuietHours()) {
    console.log(`Email to ${to} skipped - quiet hours active`);
    await logNotification('email', to, subject, html, 'skipped', 'Quiet hours active');
    return false;
  }

  // Check notification type settings
  if (notificationType) {
    if (notificationType === 'new_hike' && !globalSettings.new_hike_enabled) {
      console.log(`Email to ${to} skipped - new hike notifications globally disabled`);
      await logNotification('email', to, subject, html, 'skipped', 'New hike notifications globally disabled');
      return false;
    }
    if (notificationType === 'hike_update' && !globalSettings.hike_update_enabled) {
      console.log(`Email to ${to} skipped - hike update notifications globally disabled`);
      await logNotification('email', to, subject, html, 'skipped', 'Hike update notifications globally disabled');
      return false;
    }
    if (notificationType === 'payment_reminder' && !globalSettings.payment_reminder_enabled) {
      console.log(`Email to ${to} skipped - payment reminder notifications globally disabled`);
      await logNotification('email', to, subject, html, 'skipped', 'Payment reminder notifications globally disabled');
      return false;
    }
  }

  // Check notification preferences if userId and notificationType provided
  if (userId && notificationType) {
    const shouldSend = await notificationPreferencesController.shouldSendNotification(userId, notificationType, 'email');
    if (!shouldSend) {
      console.log(`Email to ${to} skipped due to user preferences (type: ${notificationType})`);
      await logNotification('email', to, subject, html, 'skipped', 'User preference disabled');
      return false;
    }
  }

  if (!sgMail) {
    console.log('Email not configured, skipping email to:', to);
    await logNotification('email', to, subject, html, 'skipped', 'SendGrid not configured');
    return false;
  }

  const fromEmail = (process.env.SENDGRID_FROM_EMAIL || '').trim();

  if (!fromEmail) {
    console.error('SENDGRID_FROM_EMAIL environment variable is not set');
    await logNotification('email', to, subject, html, 'failed', 'SENDGRID_FROM_EMAIL not configured');
    return false;
  }

  try {
    const msg = {
      to,
      from: fromEmail,
      subject,
      html
    };
    await sgMail.send(msg);
    console.log(`Email sent to ${to} from ${fromEmail}`);
    await logNotification('email', to, subject, html, 'sent');
    return true;
  } catch (error) {
    console.error('Email error:', error);
    console.error('Error details:', JSON.stringify(error.response?.body || error));
    const errorMsg = error.response?.body?.errors?.[0]?.message || error.message || 'Unknown error';

    if (errorMsg.includes('from email address')) {
      console.error(`SendGrid error: The from email "${fromEmail}" must be verified in SendGrid.`);
    }

    await logNotification('email', to, subject, html, 'failed', errorMsg);
    return false;
  }
}

// Send SMS with notification preference check
async function sendSMS(to, message, userId = null, notificationType = null) {
  // Check global notification settings first
  const globalSettings = await getNotificationSettings();

  // Check if SMS notifications are globally enabled
  if (!globalSettings.sms_enabled) {
    console.log(`SMS to ${to} skipped - SMS notifications globally disabled`);
    await logNotification('sms', to, null, message, 'skipped', 'SMS notifications globally disabled');
    return false;
  }

  // Check if we're in quiet hours
  if (await isQuietHours()) {
    console.log(`SMS to ${to} skipped - quiet hours active`);
    await logNotification('sms', to, null, message, 'skipped', 'Quiet hours active');
    return false;
  }

  // Check notification type settings
  if (notificationType) {
    if (notificationType === 'new_hike' && !globalSettings.new_hike_enabled) {
      console.log(`SMS to ${to} skipped - new hike notifications globally disabled`);
      await logNotification('sms', to, null, message, 'skipped', 'New hike notifications globally disabled');
      return false;
    }
    if (notificationType === 'hike_update' && !globalSettings.hike_update_enabled) {
      console.log(`SMS to ${to} skipped - hike update notifications globally disabled`);
      await logNotification('sms', to, null, message, 'skipped', 'Hike update notifications globally disabled');
      return false;
    }
    if (notificationType === 'payment_reminder' && !globalSettings.payment_reminder_enabled) {
      console.log(`SMS to ${to} skipped - payment reminder notifications globally disabled`);
      await logNotification('sms', to, null, message, 'skipped', 'Payment reminder notifications globally disabled');
      return false;
    }
  }

  // Check notification preferences if userId and notificationType provided
  if (userId && notificationType) {
    const shouldSend = await notificationPreferencesController.shouldSendNotification(userId, notificationType, 'sms');
    if (!shouldSend) {
      console.log(`SMS to ${to} skipped due to user preferences (type: ${notificationType})`);
      await logNotification('sms', to, null, message, 'skipped', 'User preference disabled');
      return false;
    }
  }

  if (!twilioClient) {
    console.log('SMS not configured (Twilio required), skipping message to:', to);
    await logNotification('sms', to, null, message, 'skipped', 'Twilio not configured');
    return false;
  }

  if (!process.env.TWILIO_WHATSAPP_NUMBER) {
    console.log('TWILIO_WHATSAPP_NUMBER not configured, skipping SMS to:', to);
    await logNotification('sms', to, null, message, 'skipped', 'TWILIO_WHATSAPP_NUMBER not configured');
    return false;
  }

  try {
    // Format phone number for international dialing
    let formattedTo = to.trim();
    
    // If number starts with 0 (South African local format), replace with +27
    if (formattedTo.startsWith('0')) {
      formattedTo = '+27' + formattedTo.substring(1);
    } else if (!formattedTo.startsWith('+')) {
      // If no country code and doesn't start with 0, assume it needs +27
      formattedTo = '+27' + formattedTo;
    }
    
    const formattedFrom = process.env.TWILIO_WHATSAPP_NUMBER.startsWith('+')
      ? process.env.TWILIO_WHATSAPP_NUMBER
      : `+${process.env.TWILIO_WHATSAPP_NUMBER}`;

    await twilioClient.messages.create({
      body: message,
      from: formattedFrom,
      to: formattedTo
    });
    console.log(`SMS sent to ${formattedTo} (original: ${to}) via Twilio`);
    await logNotification('sms', to, null, message, 'sent');
    return true;
  } catch (error) {
    console.error('SMS error:', error);
    await logNotification('sms', to, null, message, 'failed', error.message);
    return false;
  }
}

// Send WhatsApp with notification preference check
async function sendWhatsApp(to, message, userId = null, notificationType = null) {
  // Check global notification settings first
  const globalSettings = await getNotificationSettings();

  // Check if WhatsApp notifications are globally enabled
  if (!globalSettings.whatsapp_enabled) {
    console.log(`WhatsApp to ${to} skipped - WhatsApp notifications globally disabled`);
    await logNotification('whatsapp', to, null, message, 'skipped', 'WhatsApp notifications globally disabled');
    return false;
  }

  // Check if we're in quiet hours
  if (await isQuietHours()) {
    console.log(`WhatsApp to ${to} skipped - quiet hours active`);
    await logNotification('whatsapp', to, null, message, 'skipped', 'Quiet hours active');
    return false;
  }

  // Check notification type settings
  if (notificationType) {
    if (notificationType === 'new_hike' && !globalSettings.new_hike_enabled) {
      console.log(`WhatsApp to ${to} skipped - new hike notifications globally disabled`);
      await logNotification('whatsapp', to, null, message, 'skipped', 'New hike notifications globally disabled');
      return false;
    }
    if (notificationType === 'hike_update' && !globalSettings.hike_update_enabled) {
      console.log(`WhatsApp to ${to} skipped - hike update notifications globally disabled`);
      await logNotification('whatsapp', to, null, message, 'skipped', 'Hike update notifications globally disabled');
      return false;
    }
    if (notificationType === 'payment_reminder' && !globalSettings.payment_reminder_enabled) {
      console.log(`WhatsApp to ${to} skipped - payment reminder notifications globally disabled`);
      await logNotification('whatsapp', to, null, message, 'skipped', 'Payment reminder notifications globally disabled');
      return false;
    }
  }

  // Check notification preferences if userId and notificationType provided
  if (userId && notificationType) {
    const shouldSend = await notificationPreferencesController.shouldSendNotification(userId, notificationType, 'whatsapp');
    if (!shouldSend) {
      console.log(`WhatsApp to ${to} skipped due to user preferences (type: ${notificationType})`);
      await logNotification('whatsapp', to, null, message, 'skipped', 'User preference disabled');
      return false;
    }
  }

  if (!twilioClient) {
    console.log('WhatsApp not configured (Twilio required), skipping message to:', to);
    await logNotification('whatsapp', to, null, message, 'skipped', 'Twilio not configured');
    return false;
  }

  if (!process.env.TWILIO_WHATSAPP_NUMBER) {
    console.log('TWILIO_WHATSAPP_NUMBER not configured, skipping WhatsApp to:', to);
    await logNotification('whatsapp', to, null, message, 'skipped', 'TWILIO_WHATSAPP_NUMBER not configured');
    return false;
  }

  try {
    // Format phone number for international dialing
    let formattedTo = to.trim();

    // If number starts with 0 (South African local format), replace with +27
    if (formattedTo.startsWith('0')) {
      formattedTo = '+27' + formattedTo.substring(1);
    } else if (!formattedTo.startsWith('+')) {
      // If no country code and doesn't start with 0, assume it needs +27
      formattedTo = '+27' + formattedTo;
    }

    // WhatsApp messages via Twilio need whatsapp: prefix
    const whatsappTo = `whatsapp:${formattedTo}`;
    const whatsappFrom = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;

    await twilioClient.messages.create({
      body: message,
      from: whatsappFrom,
      to: whatsappTo
    });
    console.log(`WhatsApp sent to ${formattedTo} (original: ${to}) via Twilio`);
    await logNotification('whatsapp', to, null, message, 'sent');
    return true;
  } catch (error) {
    console.error('WhatsApp error:', error);
    await logNotification('whatsapp', to, null, message, 'failed', error.message);
    return false;
  }
}

module.exports = {
  sendEmail,
  sendSMS,
  sendWhatsApp,
  logNotification
};
