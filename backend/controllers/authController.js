// controllers/authController.js - Authentication controller
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');
const { JWT_SECRET, FRONTEND_URL } = require('../config/env');
const { sendEmail, sendWhatsApp } = require('../services/notificationService');
const { logActivity } = require('../utils/activityLogger');

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Insert pending user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, role, status, email_verified, email_verification_token, email_verification_expiry, notifications_email, notifications_whatsapp, created_at)
       VALUES ($1, $2, $3, $4, 'hiker', 'pending', false, $5, $6, true, true, NOW())
       RETURNING id, name, email, phone, status`,
      [name, email, hashedPassword, phone, verificationToken, verificationExpiry]
    );

    // Send verification email
    const verificationUrl = `https://helloliam.web.app/verify-email?token=${verificationToken}`;
    await sendEmail(
      email,
      'Verify Your Email - Hiking Portal',
      `<h2>Welcome to the Hiking Portal!</h2>
       <p>Hi ${name},</p>
       <p>Thank you for registering! Please verify your email address by clicking the link below:</p>
       <p><a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
       <p>Or copy and paste this link into your browser:</p>
       <p>${verificationUrl}</p>
       <p>This link will expire in 24 hours.</p>
       <p>Once your email is verified, an admin will review your account for approval.</p>`
    );

    // Notify admins
    const admins = await pool.query(
      'SELECT email, phone, notifications_email, notifications_whatsapp FROM users WHERE role = $1 AND status = $2',
      ['admin', 'approved']
    );

    for (const admin of admins.rows) {
      if (admin.notifications_email) {
        await sendEmail(
          admin.email,
          'New Registration Pending',
          `<p><strong>${name}</strong> has registered and is awaiting approval.</p>
           <p>Email: ${email}</p>
           <p>Phone: ${phone}</p>`
        );
      }
      if (admin.notifications_whatsapp) {
        await sendWhatsApp(
          admin.phone,
          `New registration: ${name} (${email}) is awaiting approval.`
        );
      }
    }

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    await logActivity(result.rows[0].id, 'user_registration', 'user', result.rows[0].id, JSON.stringify({ email, name }), ipAddress);

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this token
    const result = await pool.query(
      'SELECT id, name, email, email_verification_expiry FROM users WHERE email_verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    const user = result.rows[0];

    // Check if token has expired
    if (new Date() > new Date(user.email_verification_expiry)) {
      return res.status(400).json({ error: 'Verification token has expired' });
    }

    // Mark email as verified
    await pool.query(
      `UPDATE users
       SET email_verified = true, email_verification_token = NULL, email_verification_expiry = NULL
       WHERE id = $1`,
      [user.id]
    );

    res.json({ message: 'Email verified successfully! Your account is pending admin approval.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed', details: error.message });
  }
};

// Request password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const result = await pool.query(
      'SELECT id, name, email, notifications_email FROM users WHERE email = $1',
      [email]
    );

    // Always return success to prevent email enumeration
    if (result.rows.length === 0) {
      return res.json({ message: 'If an account exists with this email, a password reset link will be sent.' });
    }

    const user = result.rows[0];

    // Generate reset token (6-digit code for simplicity, valid for 1 hour)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in database
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetToken, resetTokenExpiry, user.id]
    );

    // Send reset email
    if (user.notifications_email) {
      const resetLink = `${FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      await sendEmail(
        user.email,
        'Password Reset Request',
        `<h2>Password Reset Request</h2>
         <p>Hello ${user.name},</p>
         <p>You requested to reset your password. Use the code below or click the link:</p>
         <h3 style="color: #4CAF50; letter-spacing: 2px;">${resetToken}</h3>
         <p><a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
         <p>This code will expire in 1 hour.</p>
         <p>If you didn't request this, please ignore this email.</p>`
      );
    }

    res.json({ message: 'If an account exists with this email, a password reset link will be sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
};

// Verify reset token
exports.verifyResetToken = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and token are required' });
    }

    // Check if token is valid
    const result = await pool.query(
      'SELECT id, reset_token, reset_token_expiry FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const user = result.rows[0];

    if (!user.reset_token || user.reset_token !== token) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    if (new Date() > new Date(user.reset_token_expiry)) {
      return res.status(400).json({ error: 'Token has expired' });
    }

    res.json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, token, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if token is valid
    const result = await pool.query(
      'SELECT id, name, reset_token, reset_token_expiry FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const user = result.rows[0];

    if (!user.reset_token || user.reset_token !== token) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    if (new Date() > new Date(user.reset_token_expiry)) {
      return res.status(400).json({ error: 'Token has expired' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    // Send confirmation email
    await sendEmail(
      email,
      'Password Reset Successful',
      `<h2>Password Reset Successful</h2>
       <p>Hello ${user.name},</p>
       <p>Your password has been successfully reset.</p>
       <p>If you didn't make this change, please contact an administrator immediately.</p>`
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    // Get user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Log failed login attempt
      await pool.query(
        'INSERT INTO signin_log (user_id, signin_time, ip_address, user_agent, success) VALUES (NULL, NOW(), $1, $2, false)',
        [ipAddress, userAgent]
      );
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if user is approved
    if (user.status !== 'approved') {
      // Log failed login attempt
      await pool.query(
        'INSERT INTO signin_log (user_id, signin_time, ip_address, user_agent, success) VALUES ($1, NOW(), $2, $3, false)',
        [user.id, ipAddress, userAgent]
      );
      return res.status(403).json({ error: 'Account pending approval' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      // Log failed login attempt
      await pool.query(
        'INSERT INTO signin_log (user_id, signin_time, ip_address, user_agent, success) VALUES ($1, NOW(), $2, $3, false)',
        [user.id, ipAddress, userAgent]
      );
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Log successful login
    await pool.query(
      'INSERT INTO signin_log (user_id, signin_time, ip_address, user_agent, success) VALUES ($1, NOW(), $2, $3, true)',
      [user.id, ipAddress, userAgent]
    );

    // Log activity
    await pool.query(
      'INSERT INTO activity_log (user_id, action, entity_type, ip_address) VALUES ($1, $2, $3, $4)',
      [user.id, 'login', 'auth', ipAddress]
    );

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};
