-- Migration: Add Privacy Policy and Terms & Conditions to editable content
-- Description: Adds privacy policy and terms & conditions to site_content table
-- Created: 2025-10-09

-- Insert Privacy Policy content
INSERT INTO site_content (content_key, title, content) VALUES
('privacy_policy', 'Privacy Policy',
'# Privacy Policy

**Last Updated:** October 9, 2025
**Effective Date:** October 9, 2025

This privacy policy complies with South Africa''s Protection of Personal Information Act (POPIA).

## 1. Introduction

Welcome to The Narrow Trail. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our hiking club platform.

By registering and using our services, you consent to the collection and use of information in accordance with this policy.

## 2. Responsible Party

**Entity:** The Narrow Trail
**Purpose:** Hiking club and outdoor activity coordination
**Contact:** steyncd@gmail.com

## 3. Information We Collect

### Required Information (Registration)
- **Name:** To identify you as a member
- **Email Address:** For account access and communications
- **Phone Number:** For SMS notifications and emergency contact
- **Password:** To secure your account (stored encrypted)

### Optional Information
- **Emergency Contact:** For safety during hikes
- **Profile Information:** Additional details you choose to share

### Automatically Collected
- **Usage Data:** Sign-in logs, activity logs
- **Hike Participation:** Interest expressions, attendance confirmations
- **Payment Records:** Transaction history for hike costs
- **Photos:** Images you upload to the platform

## 4. How We Use Your Information

We use your information for the following purposes:
- **Account Management:** Create and maintain your account
- **Service Provision:** Coordinate hikes, manage attendance, process payments
- **Communications:** Send notifications about hikes, announcements, and updates
- **Safety:** Emergency contact in case of incidents during hikes
- **Administration:** Manage membership, resolve disputes, provide support
- **Legal Compliance:** Meet regulatory requirements

**Lawful Basis:** Consent (you explicitly agree), Contractual Necessity (to provide services), and Legitimate Interest (club administration and safety).

## 5. Data Protection & Security

We implement robust security measures:
- **Encryption:** HTTPS for all data transmission
- **Password Security:** Passwords hashed using bcrypt
- **Authentication:** Secure token-based access (JWT)
- **Email Verification:** Confirm ownership before account activation
- **Admin Review:** New registrations reviewed for legitimacy
- **Access Controls:** Role-based permissions (admin vs. hiker)
- **Secure Hosting:** Cloud infrastructure with security certifications

## 6. Your Rights Under POPIA

You have the following rights:

| Right | How to Exercise |
|-------|----------------|
| **Access** - View your data | Profile page, Data Export feature |
| **Correction** - Update inaccurate data | Edit profile, Update emergency contacts |
| **Deletion** - Remove your data | Account Deletion feature in settings |
| **Object/Withdraw Consent** - Opt-out of processing | Notification preferences, Unsubscribe links |
| **Data Portability** - Export your data | Data Export feature (JSON format) |

## 7. Data Retention

| Data Type | Retention Period | Reason |
|-----------|-----------------|--------|
| Active account data | While account is active | Service provision |
| Deleted account data | Immediately removed | User right to deletion |
| Activity logs | 12 months | Security and audit |
| Payment records | 5 years | Financial compliance |
| Email/SMS logs | 6 months | Delivery verification |

## 8. Third-Party Services

We use the following third-party services:
- **Google Cloud Platform:** Hosting and database services
- **Firebase:** Frontend hosting and authentication
- **Email Service Provider:** Transactional email delivery
- **SMS Service Provider:** WhatsApp/SMS notifications

All third-party processors are required to maintain POPIA-compliant security standards.

## 9. Communications

Types of communications you may receive:
- **Critical:** Email verification, password resets (cannot be disabled)
- **Administrative:** Account approval, membership updates
- **Hike-Related:** New hikes, announcements, reminders
- **Optional:** Marketing and promotional content (opt-in)

You can manage your notification preferences in your profile settings. Some critical security notifications cannot be disabled to protect your account.

## 10. Data Breach Notification

In the unlikely event of a data breach that affects your personal information, we will:
1. Notify affected users within 72 hours
2. Report to the Information Regulator if required
3. Provide details about the breach and steps taken
4. Offer guidance on protecting yourself

## 11. Changes to This Policy

We may update this privacy policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Significant changes will be communicated via email. Your continued use of our services after changes constitutes acceptance of the updated policy.

## 12. Contact Us

For privacy-related questions or to exercise your rights:

**Email:** steyncd@gmail.com
**Information Officer:** [Name of responsible person]
**Response Time:** We will respond to your request within 30 days

---

**POPIA Compliance Commitment**

The Narrow Trail is committed to protecting your personal information in accordance with the Protection of Personal Information Act (POPIA). We implement appropriate technical and organizational measures to ensure data security and respect your privacy rights.'),

('terms_conditions', 'Terms and Conditions',
'# Terms and Conditions

**Last Updated:** October 9, 2025

Please read these terms carefully before using our services. By registering and using The Narrow Trail platform, you agree to be bound by these terms.

## 1. Acceptance of Terms

By accessing and using The Narrow Trail platform ("Service"), you accept and agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you may not use the Service.

These Terms apply to all users of the Service, including registered members, hikers, and administrators.

## 2. Membership & Registration

### Eligibility
- You must be at least 18 years old to register
- Minors may participate with parental/guardian consent
- You must provide accurate and complete information

### Account Responsibilities
- You are responsible for maintaining the confidentiality of your account
- You must notify us immediately of any unauthorized access
- You are responsible for all activities under your account
- One account per person only

### Account Approval
New registrations may require admin approval. We reserve the right to reject any registration that we believe may be fraudulent, violates these Terms, or for any other reason.

## 3. Privacy & Data Protection

Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which complies with South Africa''s Protection of Personal Information Act (POPIA).

**By using the Service, you consent to:**
- Collection of your name, email, phone number, and other provided information
- Use of your data for service provision and communications
- Storage of your data on secure cloud infrastructure
- Receipt of service-related communications (which cannot be opted out)

## 4. Hike Participation

### Expressing Interest
- Expressing interest is not a commitment to attend
- You can withdraw interest at any time before confirming attendance
- Interest helps organizers gauge popularity and plan accordingly

### Confirming Attendance
- Attendance confirmation is a commitment to participate
- If you must cancel, notify organizers as soon as possible
- Repeated no-shows may affect your membership status

### Safety & Risk Acknowledgment

**⚠️ Important:** Hiking and outdoor activities involve inherent risks including but not limited to:
- Physical injury or death
- Exposure to weather conditions
- Wildlife encounters
- Terrain hazards

**By participating in hikes, you acknowledge that:**
- You understand and accept these risks
- You are physically and mentally capable of participating
- You have disclosed any medical conditions that may affect participation
- You will follow safety guidelines and organizer instructions
- You participate at your own risk

## 5. Payments & Costs

### Hike Costs
- Some hikes may have associated costs (entrance fees, accommodation, etc.)
- Costs are clearly displayed for each hike
- Payment must be made before the specified deadline

### Refund Policy
- Refunds are subject to the specific hike''s cancellation policy
- Cancellations close to the hike date may not be eligible for refunds
- Refund requests must be made through the platform

### Payment Records
Payment records are maintained for financial compliance. You can view your payment history in your profile.

## 6. Code of Conduct

**All members must:**
- Treat other members with respect and courtesy
- Follow Leave No Trace principles
- Respect nature and wildlife
- Comply with all applicable laws and regulations
- Not engage in harassment, discrimination, or offensive behavior
- Not share inappropriate content

**Violation of this Code of Conduct may result in:** warnings, temporary suspension, or permanent account termination.

## 7. Liability & Disclaimer

### Limited Liability

**The Narrow Trail, its administrators, and members:**
- Do NOT assume liability for injuries, accidents, or incidents during hikes
- Do NOT provide insurance coverage for participants
- Do NOT guarantee the safety or suitability of any hike
- Are NOT responsible for the actions of other participants

### Indemnification
You agree to indemnify and hold harmless The Narrow Trail, its administrators, and other members from any claims, damages, or expenses arising from your participation in hikes or use of the Service.

## 8. Intellectual Property

### Platform Content
- The platform design, logo, and features are owned by The Narrow Trail
- You may not copy, modify, or distribute platform content without permission

### User Content
- You retain ownership of photos and content you upload
- By uploading content, you grant us a license to display it on the platform
- You are responsible for ensuring you have rights to any content you upload
- We may remove content that violates these Terms or is inappropriate

## 9. Termination

### Your Rights
- You may delete your account at any time
- Account deletion removes your personal data from the platform

### Our Rights
We may suspend or terminate your account if:
- You violate these Terms
- You engage in fraudulent or illegal activity
- Your account is inactive for an extended period
- We are required to do so by law

## 10. Changes to Terms

We may update these Terms from time to time. Changes will be posted on this page with an updated date. Significant changes will be communicated via email. Your continued use of the Service after changes constitutes acceptance of the updated Terms.

## 11. Governing Law

These Terms are governed by the laws of South Africa. Any disputes arising from these Terms or your use of the Service will be subject to the exclusive jurisdiction of South African courts.

## 12. Contact Information

For questions about these Terms:

**Email:** steyncd@gmail.com
**Response Time:** We will respond within 7 business days

---

**Agreement**

By clicking "I Agree" during registration or by using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy.')

ON CONFLICT (content_key) DO NOTHING;

-- Add columns to track which version of policies users accepted
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_policy_version TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_version TIMESTAMP;

-- Update existing users to have current policy versions
-- Set to the updated_at timestamp of the policy documents
UPDATE users
SET privacy_policy_version = (SELECT updated_at FROM site_content WHERE content_key = 'privacy_policy'),
    terms_version = (SELECT updated_at FROM site_content WHERE content_key = 'terms_conditions')
WHERE privacy_consent_accepted = TRUE AND privacy_policy_version IS NULL;

-- Create function to notify when legal documents are updated
CREATE OR REPLACE FUNCTION notify_legal_document_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if this is a privacy policy or terms update
  IF NEW.content_key IN ('privacy_policy', 'terms_conditions') THEN
    -- Log that a legal document was updated
    -- In a production system, you might want to:
    -- 1. Send notifications to all users
    -- 2. Flag users who need to re-accept
    -- 3. Create an audit entry

    RAISE NOTICE 'Legal document % was updated at %', NEW.content_key, NEW.updated_at;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to notify when legal documents are updated
DROP TRIGGER IF EXISTS legal_document_update_trigger ON site_content;
CREATE TRIGGER legal_document_update_trigger
  AFTER UPDATE ON site_content
  FOR EACH ROW
  WHEN (NEW.content_key IN ('privacy_policy', 'terms_conditions'))
  EXECUTE FUNCTION notify_legal_document_update();

-- Add comments
COMMENT ON COLUMN users.privacy_policy_version IS 'Timestamp of privacy policy version user accepted';
COMMENT ON COLUMN users.terms_version IS 'Timestamp of terms & conditions version user accepted';
