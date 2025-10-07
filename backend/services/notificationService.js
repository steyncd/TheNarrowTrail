// services/notificationService.js - Email and WhatsApp notification services
const pool = require('../config/database');

// Initialize SendGrid (optional)
let sgMail = null;
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'placeholder') {
  sgMail = require('@sendgrid/mail');
  const apiKey = process.env.SENDGRID_API_KEY.trim();
  sgMail.setApiKey(apiKey);
  console.log('SendGrid configured');
}

// Initialize Twilio (optional)
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
  console.log('Twilio configured');
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

// Send Email
async function sendEmail(to, subject, html) {
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

// Send WhatsApp
async function sendWhatsApp(to, message) {
  if (!twilioClient) {
    console.log('WhatsApp not configured, skipping message to:', to);
    await logNotification('whatsapp', to, null, message, 'skipped', 'Twilio not configured');
    return false;
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`
    });
    console.log(`WhatsApp sent to ${to}`);
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
  sendWhatsApp,
  logNotification
};
