# Installation Guide - The Narrow Trail Home Assistant Integration

## Prerequisites

- Home Assistant 2023.1 or newer
- Access to your Hiking Portal account
- JWT authentication token from the portal

## Quick Start (5 Minutes)

### 1. Copy Integration Files

Copy the entire `custom_components/hiking_portal` folder to your Home Assistant configuration directory:

```
/config/custom_components/hiking_portal/
```

Your folder structure should look like:
```
config/
├── custom_components/
│   └── hiking_portal/
│       ├── __init__.py
│       ├── calendar.py
│       ├── config_flow.py
│       ├── const.py
│       ├── coordinator.py
│       ├── manifest.json
│       ├── sensor.py
│       └── strings.json
```

### 2. Restart Home Assistant

- Go to **Settings** > **System** > **Restart**
- Wait for Home Assistant to come back online

### 3. Get Your JWT Token

**Option A: From Browser (Easiest)**
1. Log into https://helloliam.web.app
2. Open browser Developer Tools (F12)
3. Go to **Application** tab > **Local Storage** > `https://helloliam.web.app`
4. Find the key `token` and copy its value

**Option B: From API (More Secure - Coming Soon)**
The portal will add a "Generate Long-Lived Token" feature in profile settings.

### 4. Add the Integration

1. In Home Assistant: **Settings** > **Devices & Services**
2. Click **+ Add Integration** (bottom right)
3. Search for **"hiking"** or **"The Narrow Trail"**
4. Click on **The Narrow Trail Hiking Portal**
5. Fill in the configuration:
   - **API URL**: `https://hiking-portal-api-554106646136.us-central1.run.app`
   - **Authentication Token**: Paste your JWT token
6. Click **Submit**

### 5. Verify Installation

1. Go to **Settings** > **Devices & Services**
2. You should see **The Narrow Trail Hiking Portal** with a green checkmark
3. Click on it to see all entities:
   - 5 sensors
   - 1 calendar

## Folder Access Methods

### Method 1: Samba Share (Recommended)

If you have Samba add-on installed:
1. Connect to `\\homeassistant` (Windows) or `smb://homeassistant` (Mac)
2. Navigate to `config/custom_components/`
3. Create `hiking_portal` folder
4. Copy all files from this repository

### Method 2: SSH/Terminal

If you have SSH access:
```bash
cd /config/custom_components
mkdir hiking_portal
cd hiking_portal
# Copy files here
```

### Method 3: File Editor Add-on

1. Install **File Editor** add-on from Add-on Store
2. Use it to create the folder structure
3. Copy/paste file contents one by one

### Method 4: Visual Studio Code Add-on

1. Install **Studio Code Server** add-on
2. Connect to Home Assistant
3. Create folder and copy files

## Testing the Integration

### Check Sensors

Go to **Developer Tools** > **States** and look for:
- `sensor.next_hike`
- `sensor.upcoming_hikes_count`
- `sensor.my_hikes_count`
- `sensor.pending_users`
- `sensor.total_hikes`

### Check Calendar

1. Go to **Calendar** in the sidebar
2. Look for "Hiking Portal Events"
3. You should see your interested hikes as calendar events

### Add Dashboard Card

1. Go to your Overview dashboard
2. Click **Edit Dashboard** > **Add Card**
3. Choose **Entities Card**
4. Add the hiking sensors
5. Click **Save**

## Troubleshooting

### Integration Doesn't Appear

**Problem**: Can't find "The Narrow Trail" when adding integration

**Solutions**:
1. Restart Home Assistant after copying files
2. Check folder structure is exactly as shown above
3. Check Home Assistant logs: **Settings** > **System** > **Logs**
4. Clear browser cache and refresh

### "Invalid Authentication" Error

**Problem**: Getting 401 errors or "Invalid auth" message

**Solutions**:
1. Token might be expired - get a new one from the portal
2. Make sure you copied the entire token (they're long!)
3. Check there are no extra spaces before/after the token

### Sensors Show "Unavailable"

**Problem**: All sensors show as unavailable

**Solutions**:
1. Check your internet connection
2. Verify API URL is correct (no trailing slash)
3. Test API manually: Visit API URL in browser - should return JSON
4. Check Home Assistant logs for specific error messages

### Calendar is Empty

**Problem**: Calendar exists but shows no events

**Solutions**:
1. Make sure you're logged into the hiking portal with the same account
2. Verify you've expressed interest in at least one hike
3. Check that hikes have valid dates
4. Reload the integration: **Settings** > **Devices & Services** > **Hiking Portal** > **...** > **Reload**

### Updates Not Showing

**Problem**: Dashboard shows old data

**Solutions**:
- Integration updates every 5 minutes automatically
- Force update: **Developer Tools** > **States** > Select sensor > Click refresh icon
- Or restart Home Assistant

## Advanced Configuration

### Custom Scan Interval

To change how often the integration updates (default is 5 minutes):

Edit `const.py` and change:
```python
DEFAULT_SCAN_INTERVAL = timedelta(minutes=1)  # Update every minute
```

### API Endpoint Customization

If you're running a local development server:
```python
DEFAULT_API_URL = "http://localhost:8080"
```

## Uninstalling

1. Go to **Settings** > **Devices & Services**
2. Find **The Narrow Trail Hiking Portal**
3. Click the three dots > **Delete**
4. Delete the `custom_components/hiking_portal` folder
5. Restart Home Assistant

## Getting Help

If you encounter issues:

1. **Check logs**: Settings > System > Logs (search for "hiking")
2. **Enable debug logging** (add to `configuration.yaml`):
   ```yaml
   logger:
     default: info
     logs:
       custom_components.hiking_portal: debug
   ```
3. **Report issues**: https://github.com/hiking-portal/homeassistant/issues

## Next Steps

Once installed, check out:
- [README.md](README.md) - Full feature documentation
- [Example automations](README.md#automations) - Notification examples
- [Dashboard examples](README.md#example-dashboard-card) - Card configurations
