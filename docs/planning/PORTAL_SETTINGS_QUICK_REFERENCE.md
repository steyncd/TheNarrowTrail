# Portal Settings Page - Quick Reference

## Access
**URL:** `/admin/portal-settings`  
**Menu:** Admin Menu → Portal Settings  
**Permission Required:** `manage_settings`

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Portal Settings                        [Refresh]        │
│  Manage weather API, users, roles, permissions, and content │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  [🌤️ Weather API] [👥 User Settings] [🛡️ Roles] [💾 Content] │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Setting Key              Value          Description    Status│
│  ──────────────────────────────────────────────────────────  │
│  weather_api_enabled     [Enabled]      Enable weather  Public│
│  weather_api_primary     visualcrossing Primary provider      │
│  weather_api_fallback    weatherapi     Fallback provider     │
│  weather_cache_duration  3600           Cache TTL (sec) Public│
└─────────────────────────────────────────────────────────────┘
```

## Tab Contents

### 🌤️ Weather API Tab
**Shows:** All weather-related system settings  
**Editable:** Yes (click value to edit)  
**Settings Include:**
- API enable/disable
- Primary provider selection
- Fallback provider
- Cache duration

### 👥 User Settings Tab
**Shows:** User and profile configuration  
**Editable:** Yes (click value to edit)  
**Categories:** `user`, `profile`  
**Examples:**
- User registration settings
- Profile defaults
- Authentication configuration

### 🛡️ Roles & Permissions Tab
**Shows:** Two tables:

**1. Roles Table:**
```
Role Name  | Description                    | Permissions | Users
─────────────────────────────────────────────────────────────
admin      | Full system access             | 42 perms    | 3 users
organizer  | Can manage hikes               | 25 perms    | 5 users
user       | Standard member                | 15 perms    | 45 users
```

**2. Permissions Table (grouped by category):**
```
Category: Users Permissions
Permission        | Description              | Roles
────────────────────────────────────────────────────
users.view        | View users list          | 2 roles
users.create      | Create new users         | 1 role
users.edit        | Edit user details        | 1 role

Category: Hikes Permissions
Permission        | Description              | Roles
────────────────────────────────────────────────────
hikes.view        | View hikes               | 3 roles
hikes.create      | Create new hikes         | 2 roles
```

### 💾 Content Settings Tab
**Shows:** Content and general system settings  
**Editable:** Yes (click value to edit)  
**Categories:** `content`, `general`  
**Examples:**
- Site-wide text
- Feature flags
- Content management options

## How to Edit Settings

### Step 1: Click on Value
Click directly on the setting value you want to change

### Step 2: Edit
- **Boolean settings:** Checkbox appears
- **Text settings:** Input field appears

### Step 3: Save or Cancel
- **✓ (Checkmark):** Save changes
- **× (X):** Cancel and revert

### Step 4: Confirmation
- Green success message appears
- Setting is updated in database
- Page data refreshes automatically

## Visual Indicators

### Badges

**Public/Private:**
- 🟢 **Public** - Setting is visible to non-admin users
- ⚫ **Private** - Setting is admin-only

**Boolean Values:**
- 🟢 **Enabled** - Setting is on (true)
- ⚫ **Disabled** - Setting is off (false)

**Count Badges:**
- 🔵 **X permissions** - Number of permissions in role
- ⚫ **X users** - Number of users with role
- 🔵 **X roles** - Number of roles with permission

### Color Coding

**Roles:**
- 🔴 **admin** - Displayed in red (special role)
- ⚪ **other roles** - Normal text color

**Settings:**
- Code keys shown in monospace font
- Values clickable (cursor changes on hover)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Switch between tabs |
| Enter | Save changes (when editing) |
| Escape | Cancel edit (when editing) |

## Common Tasks

### Change Weather Provider
1. Click "Weather API" tab
2. Click on `weather_api_primary` value
3. Type new provider name
4. Click ✓ to save

### Enable/Disable Weather API
1. Click "Weather API" tab
2. Click on `weather_api_enabled` value
3. Check/uncheck the box
4. Click ✓ to save

### View Role Permissions
1. Click "Roles & Permissions" tab
2. Look at "Permissions" column in Roles table
3. Scroll down to see detailed permission breakdown

### Check Permission Usage
1. Click "Roles & Permissions" tab
2. Scroll to Permissions section
3. Look at "Roles" column to see usage count

## Troubleshooting

### Settings Not Loading
- **Solution:** Click "Refresh" button
- **Check:** Browser console for errors
- **Verify:** You have admin access

### Can't Edit Values
- **Check:** You clicked on the value (not the key)
- **Verify:** You have `manage_settings` permission
- **Try:** Refresh the page

### Changes Not Saving
- **Check:** Green success message appears
- **Verify:** Backend is running
- **Look:** For red error message

### Tab Not Showing Data
- **Possible:** No settings in that category yet
- **Check:** "No X available" message
- **Verify:** Database has settings in that category

## API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /api/settings` | Load all settings |
| `GET /api/settings/category/:cat` | Load category settings |
| `PUT /api/settings` | Update a setting |
| `GET /api/permissions/roles` | Load roles |
| `GET /api/permissions/permissions` | Load permissions |

## Performance

**Load Time:** <2 seconds (all tabs loaded at once)  
**Edit Response:** Instant (optimistic UI updates)  
**Save Time:** <500ms typical  
**Refresh:** <1 second

## Mobile Support

✅ Fully responsive  
✅ Tabs scroll horizontally on mobile  
✅ Tables scroll horizontally  
✅ Touch-friendly edit controls  

## Browser Support

✅ Chrome/Edge (latest)  
✅ Firefox (latest)  
✅ Safari (latest)  
✅ Mobile browsers  

## Security

🔒 Admin-only access  
🔒 Permission-based visibility  
🔒 Backend validation on all updates  
🔒 No direct database access from UI  

## Quick Stats

**Total Tabs:** 4  
**Categories Covered:** 6+ (weather, user, profile, content, general, permissions)  
**Editable Settings:** All (with proper permissions)  
**Read-only Data:** Roles and permissions (view only)  

## Related Pages

- **Weather Settings (legacy):** `/admin/weather-settings` (still available)
- **User Management:** `/admin/users`
- **Analytics:** `/admin/analytics`
- **Content Management:** `/admin/content`

---

**Pro Tip:** Use the Portal Settings page as your central hub for all configuration. It's faster than navigating to multiple pages! 🚀
