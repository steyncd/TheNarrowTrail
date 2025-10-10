// services/emailTemplates.js - Professional email templates for The Narrow Trail

/**
 * Get frontend URL from environment or default
 */
function getFrontendUrl() {
  return process.env.FRONTEND_URL || 'https://www.thenarrowtrail.co.za';
}

/**
 * Base email template with branding and styling
 * Uses the portal's gradient color scheme: #2d5a7c (blue) to #4a7c59 (green)
 */
function getEmailTemplate(title, content, footerText = '') {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <!-- Main container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 100%;">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #2d5a7c 0%, #4a7c59 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                The Narrow Trail
              </h1>
              <p style="margin: 8px 0 0 0; color: #e8f4f8; font-size: 14px; letter-spacing: 0.5px;">
                Hiking Portal
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              ${footerText ? `<p style="margin: 0 0 15px 0; color: #6c757d; font-size: 14px; line-height: 1.5;">${footerText}</p>` : ''}
              <p style="margin: 0; color: #adb5bd; font-size: 12px;">
                &copy; ${new Date().getFullYear()} The Narrow Trail. All rights reserved.
              </p>
              <p style="margin: 8px 0 0 0; color: #adb5bd; font-size: 12px;">
                This email was sent from The Narrow Trail Hiking Portal.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Create a styled button
 */
function createButton(text, url, color = '#4a7c59') {
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
      <tr>
        <td style="background-color: ${color}; border-radius: 6px; text-align: center;">
          <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Create an info box
 */
function createInfoBox(content, type = 'info') {
  const colors = {
    info: { bg: '#e7f3ff', border: '#2d5a7c' },
    success: { bg: '#e8f5e9', border: '#4a7c59' },
    warning: { bg: '#fff8e1', border: '#f9a825' },
    error: { bg: '#ffebee', border: '#d32f2f' }
  };

  const style = colors[type] || colors.info;

  return `
    <div style="background-color: ${style.bg}; border-left: 4px solid ${style.border}; padding: 16px; margin: 20px 0; border-radius: 4px;">
      ${content}
    </div>
  `;
}

/**
 * Welcome email for approved users
 */
function welcomeEmail(userName) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #2d5a7c; font-size: 24px; font-weight: 600;">
      Welcome ${userName}!
    </h2>
    <p style="margin: 0 0 16px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      Your hiking group registration has been approved. We're excited to have you join us on the trail!
    </p>
    <p style="margin: 0 0 16px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      You can now log in to:
    </p>
    <ul style="margin: 0 0 24px 0; color: #495057; font-size: 16px; line-height: 1.8; padding-left: 20px;">
      <li>View upcoming hikes and events</li>
      <li>Express interest in hikes</li>
      <li>Manage your profile and preferences</li>
      <li>Connect with other hikers</li>
    </ul>
    ${createButton('Go to Portal', getFrontendUrl())}
    <p style="margin: 24px 0 0 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
      See you on the trail! 🥾
    </p>
  `;

  return getEmailTemplate(
    'Welcome to The Narrow Trail',
    content,
    'If you have any questions, please contact your group administrator.'
  );
}

/**
 * Registration rejection email
 */
function rejectionEmail(userName) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #2d5a7c; font-size: 24px; font-weight: 600;">
      Registration Update
    </h2>
    <p style="margin: 0 0 16px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      Hello ${userName},
    </p>
    <p style="margin: 0 0 16px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      Thank you for your interest in joining The Narrow Trail. Unfortunately, your registration request could not be approved at this time.
    </p>
    <p style="margin: 0; color: #495057; font-size: 16px; line-height: 1.6;">
      If you believe this is an error or would like more information, please contact the group administrator.
    </p>
  `;

  return getEmailTemplate('Registration Update', content);
}

/**
 * Email verification email
 */
function verificationEmail(userName, verificationUrl) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #2d5a7c; font-size: 24px; font-weight: 600;">
      Verify Your Email Address
    </h2>
    <p style="margin: 0 0 16px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      Hi ${userName},
    </p>
    <p style="margin: 0 0 24px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      Thank you for registering with The Narrow Trail! Please verify your email address by clicking the button below:
    </p>
    ${createButton('Verify Email', verificationUrl, '#2d5a7c')}
    ${createInfoBox(`
      <p style="margin: 0; color: #495057; font-size: 14px;">
        <strong>Note:</strong> This verification link will expire in 24 hours. Once verified, an admin will review your account for approval.
      </p>
    `, 'info')}
    <p style="margin: 20px 0 0 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin: 8px 0 0 0; word-break: break-all;">
      <a href="${verificationUrl}" style="color: #2d5a7c; font-size: 14px;">${verificationUrl}</a>
    </p>
  `;

  return getEmailTemplate(
    'Verify Your Email - The Narrow Trail',
    content,
    'If you didn\'t create an account, please ignore this email.'
  );
}

/**
 * Password reset email
 */
function passwordResetEmail(userName, resetToken, resetLink) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #2d5a7c; font-size: 24px; font-weight: 600;">
      Password Reset Request
    </h2>
    <p style="margin: 0 0 16px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      Hello ${userName},
    </p>
    <p style="margin: 0 0 24px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      You requested to reset your password. Use the code below or click the button:
    </p>
    ${createInfoBox(`
      <p style="margin: 0; text-align: center;">
        <span style="font-size: 32px; font-weight: 700; color: #2d5a7c; letter-spacing: 4px; font-family: monospace;">
          ${resetToken}
        </span>
      </p>
    `, 'info')}
    ${createButton('Reset Password', resetLink, '#2d5a7c')}
    ${createInfoBox(`
      <p style="margin: 0; color: #856404; font-size: 14px;">
        <strong>Important:</strong> This code will expire in 1 hour.
      </p>
    `, 'warning')}
    <p style="margin: 20px 0 0 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
      If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
    </p>
  `;

  return getEmailTemplate(
    'Password Reset Request',
    content
  );
}

/**
 * Password reset confirmation email
 */
function passwordResetConfirmationEmail(userName) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #4a7c59; font-size: 24px; font-weight: 600;">
      Password Reset Successful
    </h2>
    <p style="margin: 0 0 16px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      Hello ${userName},
    </p>
    <p style="margin: 0 0 24px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      Your password has been successfully reset. You can now log in with your new password.
    </p>
    ${createButton('Go to Login', getFrontendUrl(), '#4a7c59')}
    ${createInfoBox(`
      <p style="margin: 0; color: #721c24; font-size: 14px;">
        <strong>Security Alert:</strong> If you didn't make this change, please contact an administrator immediately.
      </p>
    `, 'error')}
  `;

  return getEmailTemplate(
    'Password Reset Successful',
    content
  );
}

/**
 * Admin password reset notification
 */
function adminPasswordResetEmail(userName, newPassword) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #2d5a7c; font-size: 24px; font-weight: 600;">
      Password Reset by Administrator
    </h2>
    <p style="margin: 0 0 16px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      Hello ${userName},
    </p>
    <p style="margin: 0 0 24px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      Your password has been reset by an administrator. Your new temporary password is:
    </p>
    ${createInfoBox(`
      <p style="margin: 0; text-align: center;">
        <span style="font-size: 28px; font-weight: 700; color: #2d5a7c; letter-spacing: 2px; font-family: monospace;">
          ${newPassword}
        </span>
      </p>
    `, 'warning')}
    ${createButton('Sign In Now', getFrontendUrl(), '#2d5a7c')}
    ${createInfoBox(`
      <p style="margin: 0; color: #856404; font-size: 14px;">
        <strong>Security Tip:</strong> Please sign in and change your password immediately for security reasons.
      </p>
    `, 'warning')}
  `;

  return getEmailTemplate(
    'Password Reset by Administrator',
    content
  );
}

/**
 * Admin promotion email
 */
function adminPromotionEmail(userName) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #4a7c59; font-size: 24px; font-weight: 600;">
      Admin Access Granted
    </h2>
    <p style="margin: 0 0 16px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      Hello ${userName},
    </p>
    <p style="margin: 0 0 16px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      Congratulations! You have been promoted to administrator.
    </p>
    <p style="margin: 0 0 16px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      You now have full access to:
    </p>
    <ul style="margin: 0 0 24px 0; color: #495057; font-size: 16px; line-height: 1.8; padding-left: 20px;">
      <li>Manage users and approvals</li>
      <li>Create and edit hikes</li>
      <li>View analytics and reports</li>
      <li>Access system logs</li>
      <li>Manage feedback and suggestions</li>
    </ul>
    ${createButton('Access Admin Panel', `${getFrontendUrl()}/admin`, '#4a7c59')}
  `;

  return getEmailTemplate(
    'Admin Access Granted',
    content,
    'With great power comes great responsibility. Use your admin privileges wisely!'
  );
}

/**
 * New hike notification
 */
function newHikeEmail(hikeName, hikeDate, difficulty, distance, description, cost, groupType) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #2d5a7c; font-size: 24px; font-weight: 600;">
      New ${groupType} Hike: ${hikeName}
    </h2>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
      <tr>
        <td style="padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
          <table width="100%" cellpadding="8" cellspacing="0" border="0">
            <tr>
              <td style="color: #6c757d; font-size: 14px; font-weight: 600; width: 120px;">📅 DATE</td>
              <td style="color: #495057; font-size: 16px;">${hikeDate}</td>
            </tr>
            <tr>
              <td style="color: #6c757d; font-size: 14px; font-weight: 600; padding-top: 8px;">⛰️ DIFFICULTY</td>
              <td style="color: #495057; font-size: 16px; padding-top: 8px;">${difficulty}</td>
            </tr>
            <tr>
              <td style="color: #6c757d; font-size: 14px; font-weight: 600; padding-top: 8px;">📏 DISTANCE</td>
              <td style="color: #495057; font-size: 16px; padding-top: 8px;">${distance}</td>
            </tr>
            ${cost > 0 ? `
            <tr>
              <td style="color: #6c757d; font-size: 14px; font-weight: 600; padding-top: 8px;">💰 COST</td>
              <td style="color: #495057; font-size: 16px; padding-top: 8px;">R${cost}</td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
    <p style="margin: 0 0 24px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      ${description}
    </p>
    ${createButton('Express Interest', `${getFrontendUrl()}/hikes`, '#4a7c59')}
  `;

  return getEmailTemplate(
    'New Hike Added!',
    content,
    'Log in to the portal to express your interest and see more details.'
  );
}

/**
 * Admin notification for new registration
 */
function newRegistrationAdminEmail(userName, email, phone) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #2d5a7c; font-size: 24px; font-weight: 600;">
      New Registration Pending Approval
    </h2>
    <p style="margin: 0 0 20px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      A new user has registered and is awaiting approval:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
          <table width="100%" cellpadding="8" cellspacing="0" border="0">
            <tr>
              <td style="color: #6c757d; font-size: 14px; font-weight: 600; width: 100px;">NAME</td>
              <td style="color: #495057; font-size: 16px; font-weight: 600;">${userName}</td>
            </tr>
            <tr>
              <td style="color: #6c757d; font-size: 14px; font-weight: 600; padding-top: 8px;">EMAIL</td>
              <td style="color: #495057; font-size: 16px; padding-top: 8px;">${email}</td>
            </tr>
            <tr>
              <td style="color: #6c757d; font-size: 14px; font-weight: 600; padding-top: 8px;">PHONE</td>
              <td style="color: #495057; font-size: 16px; padding-top: 8px;">${phone}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${createButton('Review in Admin Panel', `${getFrontendUrl()}/admin/users`, '#2d5a7c')}
  `;

  return getEmailTemplate(
    'New Registration Pending',
    content
  );
}

/**
 * Admin notification for hike interest
 */
function hikeInterestAdminEmail(userName, hikeName, hikeDate) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #4a7c59; font-size: 24px; font-weight: 600;">
      Hike Interest Notification
    </h2>
    <p style="margin: 0 0 20px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      <strong>${userName}</strong> has expressed interest in:
    </p>
    <div style="padding: 20px; background-color: #e8f5e9; border-left: 4px solid #4a7c59; border-radius: 4px;">
      <p style="margin: 0; color: #2d3748; font-size: 18px; font-weight: 600;">
        ${hikeName}
      </p>
      <p style="margin: 8px 0 0 0; color: #4a5568; font-size: 14px;">
        📅 ${hikeDate}
      </p>
    </div>
    ${createButton('View Hike Details', `${getFrontendUrl()}/admin`, '#4a7c59')}
  `;

  return getEmailTemplate(
    'Hike Interest',
    content
  );
}

/**
 * Admin notification for confirmed attendance
 */
function attendanceConfirmedAdminEmail(userName, hikeName, hikeDate) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #4a7c59; font-size: 24px; font-weight: 600;">
      Attendance Confirmed
    </h2>
    <p style="margin: 0 0 20px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      <strong>${userName}</strong> has confirmed attendance for:
    </p>
    <div style="padding: 20px; background-color: #e8f5e9; border-left: 4px solid #4a7c59; border-radius: 4px;">
      <p style="margin: 0; color: #2d3748; font-size: 18px; font-weight: 600;">
        ${hikeName}
      </p>
      <p style="margin: 8px 0 0 0; color: #4a5568; font-size: 14px;">
        📅 ${hikeDate}
      </p>
    </div>
    ${createButton('View Confirmed Hikers', `${getFrontendUrl()}/admin`, '#4a7c59')}
  `;

  return getEmailTemplate(
    'Hike Attendance Confirmed',
    content
  );
}

/**
 * Feedback notification for admins
 */
function feedbackAdminEmail(userName, userEmail, feedbackType, message) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #2d5a7c; font-size: 24px; font-weight: 600;">
      New Feedback: ${feedbackType}
    </h2>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 20px 0;">
      <tr>
        <td style="padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
          <table width="100%" cellpadding="8" cellspacing="0" border="0">
            <tr>
              <td style="color: #6c757d; font-size: 14px; font-weight: 600; width: 100px;">FROM</td>
              <td style="color: #495057; font-size: 16px;">${userName}</td>
            </tr>
            <tr>
              <td style="color: #6c757d; font-size: 14px; font-weight: 600; padding-top: 8px;">EMAIL</td>
              <td style="color: #495057; font-size: 16px; padding-top: 8px;">${userEmail}</td>
            </tr>
            <tr>
              <td style="color: #6c757d; font-size: 14px; font-weight: 600; padding-top: 8px;">TYPE</td>
              <td style="color: #495057; font-size: 16px; padding-top: 8px;">${feedbackType}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin: 0 0 8px 0; color: #6c757d; font-size: 14px; font-weight: 600;">
      MESSAGE:
    </p>
    <div style="padding: 16px; background-color: #f8f9fa; border-radius: 4px; border-left: 4px solid #2d5a7c;">
      <p style="margin: 0; color: #495057; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
        ${message}
      </p>
    </div>
    ${createButton('View in Admin Panel', `${getFrontendUrl()}/admin/feedback`, '#2d5a7c')}
  `;

  return getEmailTemplate(
    `New Feedback: ${feedbackType}`,
    content
  );
}

/**
 * Hike announcement email template
 * Used when admin sends announcements to hike attendees
 */
function hikeAnnouncementEmail(userName, hikeName, hikeDate, subject, message) {
  const formattedDate = new Date(hikeDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const content = `
    <h2 style="margin: 0 0 10px 0; color: #2d5a7c; font-size: 24px; font-weight: 600;">
      ${subject}
    </h2>

    <p style="margin: 0 0 20px 0; color: #495057; font-size: 16px; line-height: 1.6;">
      Hi ${userName},
    </p>

    ${createInfoBox(`
      <strong style="color: #2d5a7c;">Hike:</strong> ${hikeName}<br>
      <strong style="color: #2d5a7c;">Date:</strong> ${formattedDate}
    `)}

    <div style="margin: 24px 0; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #4a7c59; border-radius: 4px;">
      <p style="margin: 0; color: #495057; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
${message}
      </p>
    </div>

    <p style="margin: 24px 0 0 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
      If you have any questions or concerns, please reply to this email or contact the hike organizers.
    </p>
  `;

  return getEmailTemplate(
    subject,
    content,
    'This announcement was sent to all confirmed attendees of this hike.'
  );
}

module.exports = {
  welcomeEmail,
  rejectionEmail,
  verificationEmail,
  passwordResetEmail,
  passwordResetConfirmationEmail,
  adminPasswordResetEmail,
  adminPromotionEmail,
  newHikeEmail,
  newRegistrationAdminEmail,
  hikeInterestAdminEmail,
  attendanceConfirmedAdminEmail,
  feedbackAdminEmail,
  hikeAnnouncementEmail,
  getEmailTemplate,
  createButton,
  createInfoBox
};
