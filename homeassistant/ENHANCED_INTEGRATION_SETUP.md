# Enhanced Home Assistant Integration Setup

## Overview

This enhanced integration provides comprehensive monitoring and management of your Hiking Portal through Home Assistant. It includes notifications management, weather integration, payment tracking, enhanced calendar features, and a complete dashboard.

## New Features Implemented

### 1. Notification Management
- **Sensor:** `sensor.hiking_portal_notification_summary` - Shows total, unread, and urgent notifications
- **Binary Sensor:** `binary_sensor.hiking_portal_urgent_notifications` - Alerts when urgent notifications are present
- **Service:** `hiking_portal.mark_notification_read` - Mark notifications as read
- **Attributes:** Full notification details with titles, messages, and timestamps

### 2. Weather Integration
- **Sensor:** `sensor.hiking_portal_weather_alerts` - Weather conditions and alerts for hiking locations
- **Binary Sensor:** `binary_sensor.hiking_portal_weather_warning` - Triggers on severe weather warnings
- **Service:** `hiking_portal.get_hike_weather` - Fetch weather data for specific hikes
- **Attributes:** Current conditions, forecasts, and alert details

### 3. Payment Tracking
- **Sensor:** `sensor.hiking_portal_outstanding_payments` - Track pending payments
- **Service:** `hiking_portal.record_payment` - Record payment completion
- **Attributes:** Total amounts, overdue counts, and individual payment details

### 4. Enhanced Calendar Features
- **Calendar:** `calendar.hiking_portal_events` - Enhanced with attendance tracking
- **Features:** 
  - Attendance status indicators (✅ confirmed, ⚠️ needs participants)
  - Payment status tracking
  - Weather warnings integration
  - Rich descriptions with emojis and detailed information

### 5. Interactive Dashboard
- **Complete Lovelace dashboard** with all portal information
- **Quick action buttons** for common tasks
- **Conditional cards** that show/hide based on alerts
- **Real-time statistics** and insights

## Installation Instructions

### 1. Update Integration Files

Copy the enhanced integration files to your Home Assistant custom components directory:

```bash
# Copy all files from homeassistant/custom_components/hiking_portal/
# to your Home Assistant config/custom_components/hiking_portal/
```

### 2. Restart Home Assistant

After copying the files, restart Home Assistant to load the new components.

### 3. Configure Integration

The integration will automatically discover the new sensors and services. Your existing configuration will continue to work.

### 4. Install Dashboard

#### Option A: YAML Dashboard
1. Copy the contents of `hiking_portal_dashboard.yaml`
2. In Home Assistant, go to **Settings → Dashboards**
3. Click **+ Add Dashboard**
4. Choose **Start with YAML mode**
5. Paste the dashboard configuration
6. Save as "Hiking Portal"

#### Option B: UI Dashboard
1. Go to **Settings → Dashboards → + Add Dashboard**
2. Choose **Start with empty dashboard**
3. Add cards manually using the UI editor
4. Use the YAML configuration as reference for entity IDs and card types

## Available Entities

### Sensors
- `sensor.hiking_portal_next_hike` - Next upcoming hike
- `sensor.hiking_portal_upcoming_hikes` - All upcoming hikes
- `sensor.hiking_portal_my_hikes` - User's registered hikes
- `sensor.hiking_portal_pending_users` - Admin: users awaiting approval
- `sensor.hiking_portal_notification_summary` - Notification counts and summaries
- `sensor.hiking_portal_weather_alerts` - Weather information for hikes
- `sensor.hiking_portal_outstanding_payments` - Payment tracking

### Binary Sensors
- `binary_sensor.hiking_portal_min_participants_reached` - Next hike confirmed status
- `binary_sensor.hiking_portal_urgent_notifications` - Urgent notifications alert
- `binary_sensor.hiking_portal_weather_warning` - Severe weather alert

### Calendar
- `calendar.hiking_portal_events` - Enhanced hiking calendar with attendance tracking

### Services
- `hiking_portal.mark_notification_read` - Mark notifications as read
- `hiking_portal.record_payment` - Record payment completion
- `hiking_portal.get_hike_weather` - Get weather for specific hike

## Service Usage Examples

### Mark Notification as Read
```yaml
service: hiking_portal.mark_notification_read
data:
  notification_id: "123"  # or "all" for all notifications
```

### Record Payment
```yaml
service: hiking_portal.record_payment
data:
  user_id: "user123"
  amount: 150.00
  payment_method: "card"  # or "cash", "eft"
  hike_id: "hike456"  # optional
```

### Get Hike Weather
```yaml
service: hiking_portal.get_hike_weather
data:
  hike_id: "hike123"
```

## Automation Examples

### Notify on Urgent Notifications
```yaml
automation:
  - alias: "Hiking Portal - Urgent Notification Alert"
    trigger:
      - platform: state
        entity_id: binary_sensor.hiking_portal_urgent_notifications
        to: "on"
    action:
      - service: notify.mobile_app_your_phone
        data:
          title: "🚨 Urgent Hiking Portal Notification"
          message: "You have {{ state_attr('binary_sensor.hiking_portal_urgent_notifications', 'urgent_count') }} urgent notifications"
```

### Weather Warning Alert
```yaml
automation:
  - alias: "Hiking Portal - Weather Warning"
    trigger:
      - platform: state
        entity_id: binary_sensor.hiking_portal_weather_warning
        to: "on"
    action:
      - service: notify.mobile_app_your_phone
        data:
          title: "⚠️ Weather Warning for Hike"
          message: "Severe weather detected for upcoming hiking locations"
```

### Minimum Participants Reached
```yaml
automation:
  - alias: "Hiking Portal - Hike Confirmed"
    trigger:
      - platform: state
        entity_id: binary_sensor.hiking_portal_min_participants_reached
        to: "on"
    action:
      - service: notify.mobile_app_your_phone
        data:
          title: "✅ Hike Confirmed!"
          message: "{{ states('sensor.hiking_portal_next_hike') }} has reached minimum participants"
```

## Troubleshooting

### Integration Not Loading
1. Check Home Assistant logs for errors
2. Ensure all files are in the correct directory
3. Verify your long-lived token is still valid
4. Restart Home Assistant

### Sensors Showing "Unknown"
1. Check your internet connection
2. Verify the backend API is accessible
3. Check the integration configuration
4. Look for API errors in the logs

### Dashboard Not Working
1. Ensure all entities exist and are working
2. Check for YAML syntax errors
3. Verify card types are supported in your HA version
4. Test individual cards before combining

### Services Not Available
1. Restart Home Assistant after installation
2. Check that the integration loaded successfully
3. Verify service schemas in the logs
4. Test with simple service calls first

## Configuration Options

The integration supports these configuration options in the UI:

- **Base URL**: Your Hiking Portal backend URL
- **Token**: Long-lived authentication token
- **Update Interval**: How often to fetch data (default: 300 seconds)

## API Endpoint Requirements

The enhanced integration requires these additional backend endpoints:

- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/{id}/read` - Mark notification as read
- `GET /api/payments/outstanding` - Get outstanding payments
- `POST /api/payments` - Record payment
- `GET /api/weather/hike/{id}` - Get weather for hike
- `GET /api/weather/alerts` - Get weather alerts

## Support

If you encounter issues:

1. Check the Home Assistant logs
2. Verify your backend API is running and accessible
3. Test API endpoints manually with your token
4. Check the GitHub repository for updates

The integration provides detailed logging - enable debug logging for the `hiking_portal` component to see detailed API communication.