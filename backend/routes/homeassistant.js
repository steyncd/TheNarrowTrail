// routes/homeassistant.js - Home Assistant webhook routes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');
const axios = require('axios');

// Store webhook URLs (in production, store in database)
let webhookUrls = new Set();

// Register webhook URL
router.post('/webhook/register', authenticateToken, async (req, res) => {
  try {
    const { webhook_url } = req.body;

    if (!webhook_url) {
      return res.status(400).json({ error: 'webhook_url is required' });
    }

    webhookUrls.add(webhook_url);

    res.json({
      message: 'Webhook registered successfully',
      webhook_url
    });
  } catch (error) {
    console.error('Register webhook error:', error);
    res.status(500).json({ error: 'Failed to register webhook' });
  }
});

// Unregister webhook URL
router.delete('/webhook/unregister', authenticateToken, async (req, res) => {
  try {
    const { webhook_url } = req.body;

    webhookUrls.delete(webhook_url);

    res.json({ message: 'Webhook unregistered successfully' });
  } catch (error) {
    console.error('Unregister webhook error:', error);
    res.status(500).json({ error: 'Failed to unregister webhook' });
  }
});

// Send webhook notification
async function sendWebhookNotification(event, data) {
  const payload = {
    event,
    data,
    timestamp: new Date().toISOString()
  };

  const promises = Array.from(webhookUrls).map(async (url) => {
    try {
      await axios.post(url, payload, { timeout: 5000 });
    } catch (error) {
      console.error(`Failed to send webhook to ${url}:`, error.message);
    }
  });

  await Promise.allSettled(promises);
}

module.exports = router;
module.exports.sendWebhookNotification = sendWebhookNotification;
