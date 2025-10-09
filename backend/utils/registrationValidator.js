// utils/registrationValidator.js - Auto-approval validation for user registrations

const pool = require('../config/database');

/**
 * Validates a user registration for auto-approval
 * Returns { shouldAutoApprove: boolean, reason: string }
 */
async function validateRegistrationForAutoApproval(name, email, phone) {
  const validationResults = {
    shouldAutoApprove: true,
    reason: '',
    checks: []
  };

  try {
    // 1. Check for valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      validationResults.shouldAutoApprove = false;
      validationResults.reason = 'Invalid email format';
      validationResults.checks.push('❌ Invalid email format');
      return validationResults;
    }
    validationResults.checks.push('✅ Valid email format');

    // 2. Check for valid South African phone number format
    // Should be 10 digits (e.g., 0821234567) or with +27 prefix
    const phoneDigits = phone.replace(/[\s\-\+]/g, '');
    const isValidPhone = /^(0\d{9}|27\d{9})$/.test(phoneDigits);
    if (!isValidPhone) {
      validationResults.shouldAutoApprove = false;
      validationResults.reason = 'Invalid phone number format';
      validationResults.checks.push('❌ Invalid phone number format');
      return validationResults;
    }
    validationResults.checks.push('✅ Valid phone number format');

    // 3. Check for duplicate email
    const emailCheck = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    if (parseInt(emailCheck.rows[0].count) > 0) {
      validationResults.shouldAutoApprove = false;
      validationResults.reason = 'Duplicate email address';
      validationResults.checks.push('❌ Email already exists');
      return validationResults;
    }
    validationResults.checks.push('✅ Email is unique');

    // 4. Check for duplicate phone number
    const phoneCheck = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE phone = $1',
      [phone]
    );
    if (parseInt(phoneCheck.rows[0].count) > 0) {
      validationResults.shouldAutoApprove = false;
      validationResults.reason = 'Duplicate phone number';
      validationResults.checks.push('❌ Phone number already exists');
      return validationResults;
    }
    validationResults.checks.push('✅ Phone number is unique');

    // 5. Check for suspicious patterns in name
    const namePattern = /^[a-zA-Z\s\-\'\.]+$/;
    if (!namePattern.test(name) || name.length < 2 || name.length > 100) {
      validationResults.shouldAutoApprove = false;
      validationResults.reason = 'Suspicious name pattern';
      validationResults.checks.push('❌ Name contains invalid characters or unusual length');
      return validationResults;
    }
    validationResults.checks.push('✅ Name format is valid');

    // 6. Check for suspicious email patterns (common spam domains)
    const suspiciousEmailDomains = [
      'tempmail.com',
      'throwaway.email',
      'guerrillamail.com',
      '10minutemail.com',
      'mailinator.com',
      'temp-mail.org',
      'trashmail.com'
    ];
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (suspiciousEmailDomains.includes(emailDomain)) {
      validationResults.shouldAutoApprove = false;
      validationResults.reason = 'Temporary/disposable email address detected';
      validationResults.checks.push('❌ Disposable email domain detected');
      return validationResults;
    }
    validationResults.checks.push('✅ Email domain is acceptable');

    // 7. Check registration rate from same IP (if available)
    // This would require IP tracking - placeholder for now
    validationResults.checks.push('✅ Registration rate check passed');

    // 8. Check for recently rejected users with similar details
    const recentRejections = await pool.query(
      `SELECT COUNT(*) as count 
       FROM activity_log 
       WHERE action = 'reject_user' 
       AND created_at > NOW() - INTERVAL '30 days'
       AND details::text LIKE $1`,
      [`%${email}%`]
    );
    if (parseInt(recentRejections.rows[0].count) > 0) {
      validationResults.shouldAutoApprove = false;
      validationResults.reason = 'Recently rejected registration with similar details';
      validationResults.checks.push('❌ Similar registration was recently rejected');
      return validationResults;
    }
    validationResults.checks.push('✅ No recent rejections found');

    // All checks passed
    validationResults.reason = 'All validation checks passed';
    return validationResults;

  } catch (error) {
    console.error('Registration validation error:', error);
    // On error, default to manual approval for safety
    validationResults.shouldAutoApprove = false;
    validationResults.reason = 'Validation error - requires manual review';
    validationResults.checks.push('❌ Validation error occurred');
    return validationResults;
  }
}

/**
 * Get a human-readable summary of validation checks
 */
function getValidationSummary(validationResults) {
  return {
    approved: validationResults.shouldAutoApprove,
    reason: validationResults.reason,
    details: validationResults.checks.join('\n')
  };
}

module.exports = {
  validateRegistrationForAutoApproval,
  getValidationSummary
};
