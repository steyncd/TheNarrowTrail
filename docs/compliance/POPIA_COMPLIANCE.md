# POPIA Compliance Implementation - The Narrow Trail

## Overview
This document outlines the POPIA (Protection of Personal Information Act) compliance measures implemented for The Narrow Trail hiking portal.

## Personal Information We Process

### Registration Data
- **Name**: Full name of the user
- **Email Address**: For account access and communications
- **Phone Number**: For SMS notifications and emergency contact
- **Password**: Hashed and securely stored

### Additional Profile Data
- Emergency contact information (optional)
- Hiking preferences and interests
- Payment records for hike participation
- Photos uploaded to the platform

### Usage Data
- Sign-in logs (IP address, timestamp)
- Activity logs (user actions)
- Hike interest and attendance records

## Responsible Party Information

**Entity Name**: The Narrow Trail  
**Purpose**: Hiking club and outdoor activity coordination  
**Data Processing**: User registration, hike management, communications, payment tracking

## Lawful Basis for Processing

1. **Consent**: Users explicitly consent during registration
2. **Contractual Necessity**: Processing required to provide hiking club services
3. **Legitimate Interest**: Club administration and member safety

## POPIA Compliance Measures

### 1. ✅ Consent Management
- [x] Explicit consent checkbox during registration
- [x] Clear explanation of data usage
- [x] Granular notification preferences
- [x] Ability to withdraw consent

### 2. ✅ Purpose Specification
- [x] Privacy policy clearly states purposes
- [x] Terms and conditions document
- [x] No data used beyond stated purposes

### 3. ✅ Security Measures
- [x] Password hashing (bcrypt)
- [x] HTTPS encryption for all communications
- [x] Secure token-based authentication (JWT)
- [x] Email verification before account access
- [x] Admin approval process for new users
- [x] Secure database with access controls

### 4. ✅ User Rights Implementation
- [x] Access to own data (profile page)
- [x] Ability to update personal information
- [x] Account deletion capability
- [x] Data export functionality
- [x] Notification preference controls

### 5. ✅ Data Minimization
- [x] Only essential fields required
- [x] Emergency contacts are optional
- [x] No unnecessary data collection

### 6. ✅ Transparency
- [x] Privacy policy accessible before registration
- [x] Clear communication about data usage
- [x] Contact information for data queries

### 7. ✅ Retention and Deletion
- [x] User can delete account
- [x] Data removed when account deleted
- [x] Activity logs retained for 12 months

### 8. ✅ Third-Party Processing
- [x] Cloud infrastructure (Google Cloud)
- [x] Email service (documented in privacy policy)
- [x] SMS service (documented in privacy policy)

## Implementation Files

### Frontend Components
1. **`PrivacyPolicy.js`** - Complete privacy policy page
2. **`TermsAndConditions.js`** - Terms of service
3. **`ConsentCheckbox.js`** - Registration consent component
4. **`DataExport.js`** - User data export functionality
5. **`AccountDeletion.js`** - Account deletion with confirmation

### Backend Updates
1. **`privacy_consent` field** - Track consent acceptance
2. **`consent_date` field** - When consent was given
3. **Data export endpoint** - `/api/profile/export`
4. **Account deletion endpoint** - `/api/profile/delete-account`

### Database Migration
- **`014_add_popia_compliance.sql`** - POPIA-related fields

## User Rights

### Right to Access
Users can view all their data via:
- Profile page
- My Hikes page
- Data export feature

### Right to Correction
Users can update:
- Name, email, phone
- Emergency contacts
- Notification preferences
- Profile information

### Right to Deletion
Users can:
- Delete their account
- Request data removal
- Export data before deletion

### Right to Object
Users can:
- Opt-out of marketing communications
- Disable specific notification types
- Withdraw consent

## Data Retention Policy

| Data Type | Retention Period | Reason |
|-----------|-----------------|---------|
| Active user data | While account active | Service provision |
| Deleted account data | Immediately removed | User right to deletion |
| Activity logs | 12 months | Security and audit |
| Payment records | 5 years | Financial compliance |
| Email/SMS logs | 6 months | Delivery verification |

## Security Incident Response

1. **Detection**: Monitoring and logging
2. **Assessment**: Evaluate breach severity
3. **Containment**: Immediate action to stop breach
4. **Notification**: Inform affected users within 72 hours
5. **Remediation**: Fix vulnerabilities
6. **Documentation**: Record incident details

## Information Regulator Notification

For smaller operations (under 20 employees), automatic registration with the Information Regulator may not be required. However:

- We maintain compliance with all POPIA requirements
- Documentation ready if notification becomes necessary
- Annual review of notification requirements

## Contact for POPIA Queries

**Data Protection Contact**: [Your contact email]  
**Information Officer**: [Responsible person]  
**Response Time**: Within 30 days

## Compliance Checklist

- [x] Privacy policy created and accessible
- [x] Terms and conditions created
- [x] Consent mechanism implemented
- [x] User rights features implemented
- [x] Security measures in place
- [x] Data minimization practiced
- [x] Transparency maintained
- [x] Retention policy defined
- [x] Incident response plan documented
- [x] Regular compliance reviews scheduled

## Review Schedule

- **Monthly**: Security audit
- **Quarterly**: Privacy policy review
- **Annually**: Full POPIA compliance review
- **As needed**: Updates for regulatory changes

## Version History

- **v1.0** (October 2025): Initial POPIA compliance implementation

---

**Last Updated**: October 9, 2025  
**Next Review**: January 2026
