// controllers/tokenController.js - Long-lived token management
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { JWT_SECRET } = require('../config/env');
const { logActivity } = require('../utils/activityLogger');

// Generate long-lived token (365 days)
exports.generateLongLivedToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body; // Optional name for the token

    // Get user info
    const userResult = await pool.query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Create long-lived token (365 days)
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        type: 'long_lived'
      },
      JWT_SECRET,
      { expiresIn: '365d' }
    );

    // Store token info in database for tracking
    const tokenName = name || `Long-lived token ${new Date().toLocaleDateString()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 365);

    const insertResult = await pool.query(
      `INSERT INTO long_lived_tokens (user_id, token_name, token_hash, expires_at, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, token_name, created_at, expires_at`,
      [userId, tokenName, token.substring(token.length - 10), expiresAt]
    );

    const tokenRecord = insertResult.rows[0];

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(
      userId,
      'generate_long_lived_token',
      'token',
      tokenRecord.id,
      JSON.stringify({ name: tokenName }),
      ipAddress
    );

    res.json({
      message: 'Long-lived token generated successfully',
      token,
      token_info: {
        id: tokenRecord.id,
        name: tokenRecord.token_name,
        created_at: tokenRecord.created_at,
        expires_at: tokenRecord.expires_at
      },
      warning: 'Store this token securely! It will not be shown again.'
    });
  } catch (error) {
    console.error('Generate token error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
};

// List user's long-lived tokens
exports.listTokens = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, token_name, token_hash, created_at, expires_at, last_used_at
       FROM long_lived_tokens
       WHERE user_id = $1 AND revoked = false
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      tokens: result.rows.map(token => ({
        id: token.id,
        name: token.token_name,
        token_preview: `...${token.token_hash}`,
        created_at: token.created_at,
        expires_at: token.expires_at,
        last_used_at: token.last_used_at
      }))
    });
  } catch (error) {
    console.error('List tokens error:', error);
    res.status(500).json({ error: 'Failed to list tokens' });
  }
};

// Revoke a long-lived token
exports.revokeToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE long_lived_tokens
       SET revoked = true, revoked_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, token_name`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(
      userId,
      'revoke_long_lived_token',
      'token',
      id,
      JSON.stringify({ name: result.rows[0].token_name }),
      ipAddress
    );

    res.json({
      message: 'Token revoked successfully',
      token_name: result.rows[0].token_name
    });
  } catch (error) {
    console.error('Revoke token error:', error);
    res.status(500).json({ error: 'Failed to revoke token' });
  }
};

// Update last_used_at timestamp (called by auth middleware)
exports.updateTokenLastUsed = async (tokenHash) => {
  try {
    await pool.query(
      `UPDATE long_lived_tokens
       SET last_used_at = NOW()
       WHERE token_hash = $1 AND revoked = false`,
      [tokenHash]
    );
  } catch (error) {
    console.error('Update token last used error:', error);
  }
};
