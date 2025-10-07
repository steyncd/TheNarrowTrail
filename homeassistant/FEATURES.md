# Hiking Portal Home Assistant Integration - Features

## Overview

This integration provides comprehensive monitoring and control of your Hiking Portal from Home Assistant. Track upcoming hikes, manage your interests, receive notifications, and automate your hiking experience.

## Sensors

### Basic Sensors

- **Next Hike** - Shows the name of your next upcoming hike
- **Upcoming Hikes Count** - Total number of upcoming hikes
- **My Hikes Count** - Number of hikes you're interested in
- **Pending Users Count** - Number of users awaiting approval (admin only)
- **Total Hikes** - Total number of hikes in the system
- **Days Until Next Hike** - Countdown to your next hike
- **Unread Notifications** - Number of unread notifications

Each sensor includes detailed attributes with hike information like location, difficulty, distance, duration, price, and participant count.

### Binary Sensors

- **Next Hike Today** - `on` if your next hike is today
- **Time to Leave for Hike** - `on` when it's within 2 hours of hike start time
- **Min Participants Reached** - `on` when minimum participants threshold is met

## Services

The integration provides services for interacting with hikes:

### `hiking_portal.express_interest`

Join a hike by expressing interest.

```yaml
service: hiking_portal.express_interest
data:
  hike_id: 123
```

### `hiking_portal.remove_interest`

Leave a hike by removing your interest.

```yaml
service: hiking_portal.remove_interest
data:
  hike_id: 123
```

### `hiking_portal.mark_attendance`

Mark your attendance for a hike.

```yaml
service: hiking_portal.mark_attendance
data:
  hike_id: 123
  status: present  # Options: present, absent, maybe
```

### `hiking_portal.send_notification`

Send a notification to all hike participants.

```yaml
service: hiking_portal.send_notification
data:
  hike_id: 123
  message: "Don't forget to bring water and snacks!"
```

## Calendar

The integration creates a calendar entity that shows all your hikes. You can:
- View hikes in Home Assistant's calendar interface
- Subscribe to the calendar from other apps
- Use it in automations based on calendar events

## Automation Triggers

The integration fires events that can trigger automations:

### Event Types

- `new_hike` - A new hike was posted
- `hike_updated` - A hike's details were updated
- `interest_added` - Someone expressed interest in your hike
- `interest_removed` - Someone removed interest from your hike
- `hike_approaching` - A hike is approaching (7, 3, or 1 day alerts)
- `min_participants_reached` - A hike reached minimum participants
- `new_comment` - New comment on a hike
- `attendance_marked` - Attendance was marked for a hike

### Example Automation

```yaml
automation:
  - alias: "Notify when new hike posted"
    trigger:
      - platform: event
        event_type: hiking_portal_event
        event_data:
          type: new_hike
    action:
      - service: notify.mobile_app
        data:
          title: "New Hike Posted!"
          message: "{{ trigger.event.data.hike_name }} on {{ trigger.event.data.date }}"
```

## Automation Examples

### Reminder 24 Hours Before Hike

```yaml
automation:
  - alias: "Hike Reminder"
    trigger:
      - platform: state
        entity_id: sensor.hiking_portal_days_until_next_hike
        to: "1"
    action:
      - service: notify.mobile_app
        data:
          title: "Hike Tomorrow!"
          message: "Don't forget about {{ states('sensor.hiking_portal_next_hike') }} tomorrow!"
```

### Time to Leave Notification

```yaml
automation:
  - alias: "Time to Leave for Hike"
    trigger:
      - platform: state
        entity_id: binary_sensor.hiking_portal_time_to_leave
        to: "on"
    action:
      - service: notify.mobile_app
        data:
          title: "Time to Leave!"
          message: "Your hike starts in {{ state_attr('binary_sensor.hiking_portal_time_to_leave', 'minutes_until_hike') }} minutes"
```

### Auto-Join Hikes

```yaml
automation:
  - alias: "Auto-join Easy Hikes"
    trigger:
      - platform: event
        event_type: hiking_portal_event
        event_data:
          type: new_hike
    condition:
      - condition: template
        value_template: "{{ trigger.event.data.difficulty == 'Easy' }}"
    action:
      - service: hiking_portal.express_interest
        data:
          hike_id: "{{ trigger.event.data.hike_id }}"
```

### Dashboard Announcement

```yaml
automation:
  - alias: "Announce Hike Today"
    trigger:
      - platform: state
        entity_id: binary_sensor.hiking_portal_next_hike_today
        to: "on"
    action:
      - service: tts.google_translate_say
        data:
          message: "Good morning! You have a hike today at {{ state_attr('sensor.hiking_portal_next_hike', 'location') }}"
```

### Minimum Participants Alert

```yaml
automation:
  - alias: "Min Participants Reached"
    trigger:
      - platform: state
        entity_id: binary_sensor.hiking_portal_min_participants_reached
        to: "on"
    action:
      - service: notify.mobile_app
        data:
          title: "Hike is a Go!"
          message: "{{ states('sensor.hiking_portal_next_hike') }} has reached minimum participants!"
```

## Custom Lovelace Card

The integration includes a custom Lovelace card for displaying hike information beautifully.

### Installation

1. Copy `hiking-portal-card.js` to your `www` folder
2. Add it as a resource in your Lovelace dashboard:

```yaml
resources:
  - url: /local/hiking-portal-card.js
    type: module
```

### Usage

```yaml
type: custom:hiking-portal-card
entity: sensor.hiking_portal_next_hike
```

The card displays:
- Hike name and date
- Location, difficulty, distance, duration
- Price and participant count
- Quick action buttons to join or view details

## Dashboard Examples

### Simple Overview

```yaml
type: entities
title: Hiking Portal
entities:
  - entity: sensor.hiking_portal_next_hike
  - entity: sensor.hiking_portal_days_until_next_hike
  - entity: sensor.hiking_portal_upcoming_hikes
  - entity: sensor.hiking_portal_my_hikes
  - entity: binary_sensor.hiking_portal_next_hike_today
```

### Full Dashboard

```yaml
views:
  - title: Hiking
    cards:
      - type: custom:hiking-portal-card
        entity: sensor.hiking_portal_next_hike

      - type: glance
        title: Overview
        entities:
          - entity: sensor.hiking_portal_upcoming_hikes
            name: Upcoming
          - entity: sensor.hiking_portal_my_hikes
            name: My Hikes
          - entity: sensor.hiking_portal_days_until_next_hike
            name: Days Until

      - type: calendar
        entities:
          - calendar.hiking_portal_events

      - type: conditional
        conditions:
          - entity: binary_sensor.hiking_portal_time_to_leave
            state: "on"
        card:
          type: markdown
          content: |
            ## 🚨 Time to Leave!
            Your hike starts soon. Don't forget:
            - Water and snacks
            - Sunscreen
            - First aid kit
            - Emergency contact info
```

## Troubleshooting

### Sensors Not Updating

- Check that your long-lived token is valid
- Verify the API URL in integration settings
- Check Home Assistant logs for errors
- Integration updates every 5 minutes by default

### Services Not Working

- Ensure you're using a valid hike ID
- Check that you're authenticated with proper permissions
- Review Home Assistant logs for error messages

### Events Not Firing

- Events only fire on state changes, not on first load
- Check the event bus in Developer Tools → Events
- Subscribe to `hiking_portal_event` to debug

## Advanced Features

### Location-Based Automation

```yaml
automation:
  - alias: "Auto Check-in at Hike Location"
    trigger:
      - platform: zone
        entity_id: device_tracker.phone
        zone: zone.hike_location
        event: enter
    condition:
      - condition: state
        entity_id: binary_sensor.hiking_portal_next_hike_today
        state: "on"
    action:
      - service: hiking_portal.mark_attendance
        data:
          hike_id: "{{ state_attr('sensor.hiking_portal_next_hike', 'hike_id') }}"
          status: present
```

### Weather Integration

```yaml
automation:
  - alias: "Weather Warning for Hike"
    trigger:
      - platform: state
        entity_id: sensor.hiking_portal_days_until_next_hike
        to: "1"
    condition:
      - condition: numeric_state
        entity_id: sensor.openweathermap_forecast_precipitation_probability
        above: 70
    action:
      - service: notify.mobile_app
        data:
          title: "⛈️ Weather Alert"
          message: "High chance of rain for tomorrow's hike!"
```

## Support

For issues or feature requests:
- GitHub: https://github.com/steyncd/TheNarrowTrail
- Check logs: Configuration → Logs
- Enable debug logging:
  ```yaml
  logger:
    default: info
    logs:
      custom_components.hiking_portal: debug
  ```
