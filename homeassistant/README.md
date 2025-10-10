# The Narrow Trail - Home Assistant Integration

This custom integration allows you to monitor and interact with your hiking portal directly from Home Assistant.

## Features

### 📊 Sensors
- **Next Hike** - Shows your next upcoming hike with full details
- **Upcoming Hikes Count** - Number of upcoming hikes
- **My Hikes Count** - Number of hikes you're interested in
- **Pending Users** (Admin only) - Number of users awaiting approval
- **Total Hikes** - Total number of hikes in the system

### 📅 Calendar
- **Hiking Calendar** - All your hikes displayed in Home Assistant calendar
- Integrates with Google Calendar, Apple Calendar, etc.
- Shows hike details, location, difficulty, and more

### 🔔 Notifications (Coming Soon)
- Real-time notifications for new hikes
- Alerts when users need approval
- Reminders before your hikes

## Installation

### Option 1: HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Integrations"
3. Click the three dots in the top right
4. Select "Custom repositories"
5. Add repository URL: `https://github.com/hiking-portal/homeassistant`
6. Category: Integration
7. Click "Add"
8. Search for "The Narrow Trail" and install

### Option 2: Manual Installation

1. Copy the `custom_components/hiking_portal` folder to your Home Assistant's `custom_components` directory
2. Restart Home Assistant

## Configuration

### Step 1: Get Your Authentication Token

1. Log into your hiking portal at https://helloliam.web.app
2. Go to your profile (click your name in the top right)
3. Look for your JWT token (or generate a long-lived token)
4. Copy the token

### Step 2: Add Integration

1. In Home Assistant, go to **Settings** > **Devices & Services**
2. Click **Add Integration**
3. Search for **"The Narrow Trail Hiking Portal"**
4. Enter the following:
   - **API URL**: `https://backend-4kzqyywlqq-ew.a.run.app` (default)
   - **Authentication Token**: Your JWT token from Step 1
5. Click **Submit**

## Usage

### Sensors

Once configured, the following sensors will be available:

- `sensor.next_hike` - Name of your next hike
- `sensor.upcoming_hikes_count` - Number of upcoming hikes
- `sensor.my_hikes_count` - Number of hikes you're interested in
- `sensor.pending_users` - Number of pending users (admins only)
- `sensor.total_hikes` - Total hikes in system

### Attributes

Each sensor has additional attributes with detailed information:

**Next Hike Attributes:**
- `hike_id` - Unique hike identifier
- `date` - Hike date and time
- `location` - Hike location
- `difficulty` - Difficulty level
- `distance` - Distance in kilometers
- `duration` - Duration in hours
- `price` - Cost in ZAR
- `interested_count` - Number of interested people
- `description` - Full hike description

### Example Dashboard Card

```yaml
type: entities
title: Hiking Portal
entities:
  - entity: sensor.next_hike
    name: Next Hike
    secondary_info: last-changed
  - entity: sensor.my_hikes_count
    name: My Hikes
  - entity: sensor.upcoming_hikes_count
    name: Upcoming Hikes
  - entity: sensor.pending_users
    name: Users Awaiting Approval
```

### Advanced Card with Details

```yaml
type: custom:mushroom-template-card
primary: "{{ states('sensor.next_hike') }}"
secondary: |
  {{ state_attr('sensor.next_hike', 'date') | as_datetime | as_local }}
  📍 {{ state_attr('sensor.next_hike', 'location') }}
  👥 {{ state_attr('sensor.next_hike', 'interested_count') }} interested
icon: mdi:hiking
icon_color: green
tap_action:
  action: url
  url_path: https://helloliam.web.app/hikes/{{ state_attr('sensor.next_hike', 'hike_id') }}
```

### Calendar Integration

The hiking calendar will appear automatically in Home Assistant's Calendar view:
- Go to **Calendar** in the sidebar
- You'll see "Hiking Portal Events" with all your hikes

### Automations

#### Notify When New Hike is Added

```yaml
automation:
  - alias: "Notify New Hike"
    trigger:
      - platform: state
        entity_id: sensor.upcoming_hikes_count
    condition:
      - condition: template
        value_template: "{{ trigger.to_state.state | int > trigger.from_state.state | int }}"
    action:
      - service: notify.mobile_app
        data:
          title: "New Hike Available!"
          message: "Check out the latest hike on The Narrow Trail"

#### Reminder 24h Before Hike

```yaml
automation:
  - alias: "Hike Reminder"
    trigger:
      - platform: time
        at: "09:00:00"
    condition:
      - condition: template
        value_template: |
          {% set hike_date = state_attr('sensor.next_hike', 'date') %}
          {% if hike_date %}
            {{ (as_timestamp(hike_date) - as_timestamp(now())) < 86400 }}
          {% else %}
            false
          {% endif %}
    action:
      - service: notify.mobile_app
        data:
          title: "Hike Tomorrow!"
          message: "Don't forget: {{ states('sensor.next_hike') }} tomorrow at {{ state_attr('sensor.next_hike', 'location') }}"

#### Admin Alert for Pending Users

```yaml
automation:
  - alias: "Alert Pending Users"
    trigger:
      - platform: state
        entity_id: sensor.pending_users
    condition:
      - condition: template
        value_template: "{{ trigger.to_state.state | int > 0 }}"
    action:
      - service: notify.admin
        data:
          title: "Users Awaiting Approval"
          message: "{{ states('sensor.pending_users') }} users need approval"
```

## Troubleshooting

### Integration Not Working

1. Check your authentication token is valid
2. Verify API URL is correct
3. Check Home Assistant logs for errors: **Settings** > **System** > **Logs**

### Sensors Not Updating

- The integration polls the API every 5 minutes
- Force update: **Developer Tools** > **States** > Find sensor > **Reload**
- Or restart Home Assistant

### Calendar Not Showing Events

1. Make sure you're logged into the portal
2. Verify you have hikes you're interested in
3. Check the calendar shows "Hiking Portal Events"

## Support

- **Issues**: https://github.com/hiking-portal/homeassistant/issues
- **Hiking Portal**: https://helloliam.web.app
- **Home Assistant Community**: https://community.home-assistant.io/

## Changelog

### v1.0.0 (2025-01-07)
- Initial release
- 5 sensors (Next Hike, Upcoming, My Hikes, Pending Users, Total)
- Calendar integration
- Config flow for easy setup
- Auto-refresh every 5 minutes

## License

MIT License - See LICENSE file for details
