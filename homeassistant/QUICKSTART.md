# Quick Start Guide - Test Your Home Assistant Integration

## 5-Minute Setup

### Step 1: Install Backend Dependencies

```bash
cd c:\hiking-portal\backend
npm install ical-generator axios
```

### Step 2: Deploy Backend (Optional - only if testing calendar/webhooks)

The sensors will work with your existing deployed backend. The calendar endpoints are new, so you'll need to deploy if you want calendar functionality.

```bash
# Backend is already updated in server.js
# Just redeploy when ready
```

### Step 3: Copy Integration to Home Assistant

Copy the entire folder:
```
c:\hiking-portal\homeassistant\custom_components\hiking_portal\
```

To your Home Assistant:
```
/config/custom_components/hiking_portal/
```

**File Checklist:**
- [ ] `__init__.py`
- [ ] `calendar.py`
- [ ] `config_flow.py`
- [ ] `const.py`
- [ ] `coordinator.py`
- [ ] `manifest.json`
- [ ] `sensor.py`
- [ ] `strings.json`
- [ ] `translations/en.json`

### Step 4: Get Your JWT Token

**Quick Method (Browser):**

1. Open https://helloliam.web.app
2. Log in with your account
3. Press `F12` to open Developer Tools
4. Go to **Application** tab
5. In the left sidebar: **Local Storage** > `https://helloliam.web.app`
6. Find the row with key: `token`
7. Copy the entire value (it's long!)

Example token format:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6Ikpv...
```

### Step 5: Restart Home Assistant

- **Settings** > **System** > **Restart**
- Wait ~1 minute for restart

### Step 6: Add Integration

1. **Settings** > **Devices & Services**
2. Click **+ Add Integration** (bottom right)
3. Type "hiking" or "narrow trail"
4. Click **The Narrow Trail Hiking Portal**
5. Enter:
   - **API URL**: `https://hiking-portal-api-554106646136.us-central1.run.app`
   - **Token**: [Paste your JWT token]
6. Click **Submit**

✅ You should see: "Successfully configured The Narrow Trail Hiking Portal"

### Step 7: Verify It's Working

#### Check Sensors

1. Go to **Developer Tools** > **States**
2. Search for "hiking" or "sensor.next"
3. You should see:
   - `sensor.next_hike` - Should show your next hike name (or "No upcoming hikes")
   - `sensor.my_hikes_count` - Should show a number
   - `sensor.upcoming_hikes_count` - Should show a number
   - `sensor.pending_users` - Number (or 0 if not admin)
   - `sensor.total_hikes` - Total number of hikes

#### Check Calendar

1. Click **Calendar** in the sidebar
2. Look for "Hiking Portal Events" in the list
3. Click on it to see your hikes displayed

#### Add to Dashboard

1. Go to **Overview** (your main dashboard)
2. Click **Edit Dashboard** (top right)
3. Click **+ Add Card**
4. Select **Entities**
5. Click **+ Add Entity**
6. Search for "hiking"
7. Add these sensors:
   - Next Hike
   - My Hikes Count
   - Upcoming Hikes Count
8. Click **Save**

You should now see a card showing your hiking information!

---

## Testing Each Feature

### Test 1: Sensor Updates

1. In Home Assistant, note the values of your sensors
2. In the hiking portal, express interest in a new hike
3. Wait 5 minutes (or force update):
   - **Developer Tools** > **States**
   - Find `sensor.my_hikes_count`
   - Click the refresh icon
4. The count should increase!

### Test 2: Calendar Events

1. Go to **Calendar**
2. Find "Hiking Portal Events"
3. Click on a hike event
4. You should see:
   - Hike name
   - Date and time
   - Description with details
   - Location

### Test 3: Admin Features (If you're admin)

1. Check `sensor.pending_users`
2. If it's > 0, you can see pending user details in sensor attributes:
   - **Developer Tools** > **States**
   - Find `sensor.pending_users`
   - Click on it
   - Scroll to **Attributes**
   - You'll see user names, emails, etc.

### Test 4: Automation (Optional)

Create a simple automation:

```yaml
automation:
  - alias: "Test Hike Notification"
    trigger:
      - platform: state
        entity_id: sensor.next_hike
    action:
      - service: persistent_notification.create
        data:
          title: "Next Hike Changed"
          message: "Your next hike is now: {{ states('sensor.next_hike') }}"
```

Now change your hike interests in the portal and watch for the notification!

---

## Troubleshooting Quick Fixes

### "Integration not found"
- Make sure you restarted Home Assistant after copying files
- Check the folder structure is correct
- Look in logs: **Settings** > **System** > **Logs** (search for "hiking")

### "Cannot connect to API"
- Check your internet connection
- Verify the API URL has no trailing slash
- Test in browser: Visit the API URL - should show JSON

### "Invalid authentication"
- Token might be expired - get a new one
- Make sure you copied the ENTIRE token
- Check for extra spaces at beginning/end

### "Sensors show unavailable"
- Check the coordinator update succeeded
- Look at attributes of a sensor - any error messages?
- Force update: Developer Tools > States > Sensor > Refresh icon

### Enable Debug Logging

Add to `configuration.yaml`:
```yaml
logger:
  default: warning
  logs:
    custom_components.hiking_portal: debug
```

Restart and check logs for detailed information.

---

## What to Expect

### First Load
- Integration connects to API
- Fetches all hikes, your hikes, pending users
- Creates 5 sensors
- Creates 1 calendar
- Shows configuration success message

### Every 5 Minutes
- Coordinator automatically updates all data
- Sensors refresh with latest information
- Calendar events update if hikes changed

### Performance
- Minimal CPU usage
- 2-3 API calls every 5 minutes
- Fast response time
- Efficient data caching

---

## Next Steps After Testing

1. **Create Automations**
   - Reminders before hikes
   - Alerts for new hikes
   - Admin notifications

2. **Customize Dashboard**
   - Add cards with hike details
   - Create picture elements
   - Use conditional cards

3. **Integrate with Other Services**
   - Google Calendar sync
   - Weather warnings
   - Travel time calculations

4. **Deploy Backend Updates** (for calendar)
   ```bash
   # When ready for calendar exports
   cd backend
   npm install
   # Deploy to Google Cloud Run
   ```

---

## Success! 🎉

If you can see your sensors updating and calendar events showing, you're done!

The integration is fully functional and will automatically keep your Home Assistant dashboard in sync with your hiking portal.

Enjoy monitoring your hiking adventures from your smart home!
