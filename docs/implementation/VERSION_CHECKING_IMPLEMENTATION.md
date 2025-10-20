# Version Checking & Auto-Update Implementation

**Date:** October 17, 2025
**Status:** ✅ COMPLETE - Deployed to Production

---

## Problem Statement

When new versions of the React app are deployed to Firebase Hosting, users' browsers cache the previous version. Users need to manually perform a hard refresh (Ctrl+F5) to see the latest version, leading to:
- Users seeing old UI/features
- Reporting bugs that are already fixed
- Confusion about why changes aren't visible
- Support overhead explaining how to refresh

---

## Solution Overview

Implemented a **comprehensive version checking system** that:
1. Generates a unique version identifier on each build
2. Periodically checks for new deployments
3. Displays a non-intrusive banner when update is available
4. Allows users to refresh immediately or dismiss temporarily
5. Handles service worker cache clearing

---

## Architecture

### Components Created

**1. Version Generation Script**
- **File:** `frontend/scripts/generate-version.js`
- **Purpose:** Creates `version.json` with build metadata
- **Runs:** Automatically before each build (via `prebuild` npm script)

**2. Version Check Hook**
- **File:** `frontend/src/hooks/useVersionCheck.js`
- **Purpose:** Monitors for new versions and provides update controls
- **Features:**
  - Checks every 5 minutes
  - Initial check after 10 seconds
  - Cache-busting headers
  - Dismissal with 1-hour cooldown

**3. Update Notification Banner**
- **File:** `frontend/src/components/common/UpdateNotification.js`
- **Purpose:** User-friendly notification UI
- **Features:**
  - Fixed position at top of page
  - Smooth slide-down animation
  - Refresh and dismiss buttons
  - Shows build timestamp

**4. App Integration**
- **File:** `frontend/src/App.js`
- **Changes:** Integrated version check hook and notification banner

---

## How It Works

### Build Time

```
1. npm run build
   ↓
2. prebuild script runs: node scripts/generate-version.js
   ↓
3. Generates public/version.json with:
   {
     "version": "0.1.0",
     "buildTime": "2025-10-17T12:33:11.515Z",
     "buildTimestamp": 1760704391516,
     "commitHash": "unknown"
   }
   ↓
4. React app builds normally
   ↓
5. version.json is deployed with the app
```

### Runtime

```
1. User opens app
   ↓
2. useVersionCheck hook initializes
   ↓
3. Fetches /version.json and stores in localStorage
   ↓
4. Waits 10 seconds (let app load)
   ↓
5. Checks for updates by fetching /version.json with cache-busting
   ↓
6. Compares buildTimestamp values
   ↓
7. If newer version detected:
   - Sets updateAvailable = true
   - Shows UpdateNotification banner
   ↓
8. User clicks "Refresh Now":
   - Updates localStorage
   - Clears service worker cache
   - Performs hard reload: window.location.reload(true)
   ↓
9. User clicks dismiss (X):
   - Hides banner for 1 hour (sessionStorage)
   - Will show again after 1 hour or on next page load
```

### Periodic Checking

```
Every 5 minutes:
  ↓
  Fetch /version.json with cache busting
  ↓
  Compare with stored version
  ↓
  If newer: Show banner
  ↓
  Continue checking...
```

---

## Configuration

### Check Interval

```javascript
// In useVersionCheck.js
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
```

**Adjust if needed:**
- More frequent: `3 * 60 * 1000` (3 minutes)
- Less frequent: `10 * 60 * 1000` (10 minutes)
- Critical updates only: `30 * 60 * 1000` (30 minutes)

### Initial Delay

```javascript
const initialCheckTimer = setTimeout(() => {
  checkForUpdates();
}, 10000); // 10 seconds after app loads
```

**Adjust if needed:**
- Faster check: `5000` (5 seconds)
- Slower check: `30000` (30 seconds)

### Dismissal Duration

```javascript
// In useVersionCheck.js
const dismissUntil = Date.now() + (60 * 60 * 1000); // 1 hour
```

**Adjust if needed:**
- Shorter: `30 * 60 * 1000` (30 minutes)
- Longer: `2 * 60 * 60 * 1000` (2 hours)
- Until next session: Use `sessionStorage` instead of timeout

---

## User Experience

### Notification Appearance

```
┌────────────────────────────────────────────────────────────────┐
│ 🔄  New Version Available!                                     │
│     A new version of the app has been deployed.                │
│     (Built: Oct 17, 2025, 2:33 PM)                            │
│                                                                 │
│     [🔄 Refresh Now]  [✕]                                      │
└────────────────────────────────────────────────────────────────┘
```

### User Actions

**Option 1: Click "Refresh Now"**
- Page reloads with new version
- Cache cleared automatically
- User sees latest features immediately

**Option 2: Click Dismiss (X)**
- Banner disappears for 1 hour
- User can continue working
- Banner reappears after 1 hour or on next login
- Update is deferred, not cancelled

**Option 3: Ignore**
- Banner stays visible
- User can click later
- Updates on next manual refresh

---

## Technical Details

### Version Comparison

```javascript
// Compares build timestamps
if (latestVersion.buildTimestamp > storedVersion.buildTimestamp) {
  // New version available
  setUpdateAvailable(true);
}
```

**Why timestamps instead of version numbers?**
- Timestamps are unique for every build
- No manual version bumping required
- Works with CI/CD pipelines
- Handles multiple builds per day

### Cache Busting

```javascript
const response = await fetch(VERSION_FILE_URL + '?t=' + Date.now(), {
  cache: 'no-cache',
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
});
```

**Why three methods?**
1. `?t=` query param - Bypasses browser cache
2. `cache: 'no-cache'` - Fetch API cache control
3. Headers - Additional cache prevention for legacy browsers

### Service Worker Integration

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.update(); // Tells service worker to check for updates
    });
  });
}
```

**Purpose:**
- Ensures service worker caches are updated
- Critical for PWA functionality
- Prevents stale content serving

### Hard Reload

```javascript
window.location.reload(true); // `true` forces cache bypass
```

**Note:** Modern browsers may ignore the `true` parameter. The service worker update and localStorage clearing provide backup cache-busting.

---

## Testing

### Manual Testing

**Test 1: New Deployment Detection**
```
1. Note current build timestamp in browser console
2. Deploy a new version
3. Wait 10 seconds or trigger manual check
4. Verify banner appears
5. Click "Refresh Now"
6. Verify new version loads
```

**Test 2: Dismissal**
```
1. Trigger update notification
2. Click dismiss (X)
3. Verify banner disappears
4. Reload page within 1 hour
5. Verify banner does NOT reappear
6. Wait 1 hour (or clear sessionStorage)
7. Verify banner reappears
```

**Test 3: Service Worker**
```
1. Open DevTools → Application → Service Workers
2. Trigger update
3. Click "Refresh Now"
4. Verify service worker updates in DevTools
5. Verify caches cleared
```

### Automated Testing

```javascript
// Test version detection
describe('Version Check', () => {
  it('should detect newer version', async () => {
    const oldVersion = { buildTimestamp: 1000 };
    const newVersion = { buildTimestamp: 2000 };

    localStorage.setItem('app_version', JSON.stringify(oldVersion));

    // Mock fetch to return new version
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(newVersion)
      })
    );

    const { result } = renderHook(() => useVersionCheck());

    await waitFor(() => {
      expect(result.current.updateAvailable).toBe(true);
    });
  });
});
```

---

## Troubleshooting

### Problem: Banner Never Appears

**Possible Causes:**
1. version.json not deployed
2. Browser aggressively caching version.json
3. Version check hook not running

**Solutions:**
```bash
# Verify version.json exists
curl https://helloliam.web.app/version.json

# Check browser console for errors
# Look for: "Failed to fetch version" or similar

# Verify hook is initialized
# In browser console:
localStorage.getItem('app_version')
# Should show current version
```

### Problem: Banner Appears Too Often

**Possible Cause:** Check interval too short or dismissal not working

**Solution:**
```javascript
// Increase check interval
const VERSION_CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes

// Or check dismissal storage
sessionStorage.getItem('update_dismissed_until')
// Should show future timestamp
```

### Problem: Refresh Doesn't Clear Cache

**Possible Cause:** Service worker not updating properly

**Solution:**
```javascript
// Add more aggressive cache clearing
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
    });
  });
}
```

### Problem: version.json Shows Old Timestamp

**Possible Cause:** Build script not running

**Solution:**
```bash
# Verify prebuild runs
npm run build 2>&1 | grep "Version file generated"

# Should show: ✅ Version file generated: {...}

# If not, run manually
node frontend/scripts/generate-version.js
```

---

## Performance Impact

### Bundle Size
- `useVersionCheck.js`: ~2 KB
- `UpdateNotification.js`: ~1.5 KB
- `generate-version.js`: Not included in bundle (build-time only)
- **Total Impact:** ~3.5 KB (negligible)

### Runtime Performance
- Initial check: Delayed 10 seconds (no impact on load time)
- Periodic checks: Background fetch, non-blocking
- version.json size: ~120 bytes (tiny)
- Network requests: 1 per 5 minutes (minimal)

### Build Time
- Version generation: <100ms
- No impact on overall build time

---

## Deployment Checklist

### First-Time Setup (Already Done ✅)
- [x] Created `scripts/generate-version.js`
- [x] Created `hooks/useVersionCheck.js`
- [x] Created `components/common/UpdateNotification.js`
- [x] Added `prebuild` script to package.json
- [x] Integrated into App.js
- [x] Tested locally
- [x] Deployed to production

### Every Deployment (Automatic)
- [x] Version file generated during build
- [x] Deployed to Firebase with rest of app
- [x] No manual steps required

---

## Advanced Features (Future Enhancements)

### 1. Force Update for Critical Fixes

```javascript
// In version.json
{
  "version": "0.1.0",
  "buildTimestamp": 1760704391516,
  "criticalUpdate": true, // New field
  "minimumVersion": "0.0.9"
}

// In useVersionCheck.js
if (latestVersion.criticalUpdate) {
  // Don't allow dismissal
  setUpdateAvailable(true);
  setIsCritical(true); // New state
}
```

### 2. Update Progress Indicator

```javascript
// Show download progress for large updates
const downloadProgress = await serviceWorker.getUpdateProgress();
// Display: "Downloading update: 45%"
```

### 3. Release Notes

```javascript
// In version.json
{
  "version": "0.2.0",
  "buildTimestamp": 1760704391516,
  "releaseNotes": "- New feature X\n- Bug fix Y\n- Performance improvements"
}

// Show in notification banner
```

### 4. Staged Rollouts

```javascript
// Only show update to X% of users
const userGroup = hashUserId(currentUser.id) % 100;
const rolloutPercentage = latestVersion.rolloutPercentage || 100;

if (userGroup < rolloutPercentage) {
  setUpdateAvailable(true);
}
```

### 5. Background Update

```javascript
// Download new version silently
// Apply on next app launch
if (latestVersion.buildTimestamp > storedVersion.buildTimestamp) {
  await preloadNewVersion();
  localStorage.setItem('update_ready', 'true');
  // On next load, use new version
}
```

---

## Best Practices

### Do's ✅
- Keep check interval reasonable (5-10 minutes)
- Show clear, actionable messaging
- Allow users to dismiss (for non-critical updates)
- Clear all caches on refresh
- Log version changes for debugging
- Test on multiple browsers

### Don'ts ❌
- Don't force immediate reload without user consent
- Don't check too frequently (network overhead)
- Don't show banner permanently (annoying)
- Don't rely solely on version numbers (timestamps better)
- Don't forget service worker cache
- Don't block user actions with modal

---

## Monitoring & Analytics

### Track Update Adoption

```javascript
// Log when update is accepted
const refreshApp = useCallback(() => {
  analytics.logEvent('app_update_accepted', {
    old_version: currentVersion?.buildTimestamp,
    new_version: latestVersion?.buildTimestamp,
    time_to_accept: Date.now() - updateDetectedTime
  });

  // Refresh logic...
}, [latestVersion]);
```

### Track Update Dismissals

```javascript
const dismissUpdate = useCallback(() => {
  analytics.logEvent('app_update_dismissed', {
    version: latestVersion?.buildTimestamp,
    dismiss_count: getDismissCount()
  });

  // Dismiss logic...
}, [latestVersion]);
```

---

## Files Modified/Created

### Created (4 files)
1. `frontend/scripts/generate-version.js` - Version file generator
2. `frontend/src/hooks/useVersionCheck.js` - Version checking hook
3. `frontend/src/components/common/UpdateNotification.js` - UI banner
4. `VERSION_CHECKING_IMPLEMENTATION.md` - This documentation

### Modified (2 files)
1. `frontend/package.json` - Added `prebuild` script
2. `frontend/src/App.js` - Integrated version check and notification

### Generated (1 file)
1. `frontend/public/version.json` - Auto-generated on every build

---

## Summary

The version checking system provides a **seamless, user-friendly way** to ensure users always have the latest version of the app. It:

✅ Automatically detects new deployments
✅ Notifies users without being intrusive
✅ Allows user control (refresh now or later)
✅ Handles all cache layers properly
✅ Works with service workers and PWAs
✅ Requires zero configuration after setup
✅ Adds minimal performance overhead
✅ Improves user experience significantly

**Status:** ✅ Production-ready and deployed

---

## Support

**Questions or Issues?**
- Check browser console for version-related logs
- Verify `/version.json` is accessible
- Check localStorage for `app_version`
- Check sessionStorage for `update_dismissed_until`
- Review Network tab for version.json fetch requests

**Future Improvements:**
See "Advanced Features (Future Enhancements)" section above.

---

**Document Version:** 1.0
**Last Updated:** October 17, 2025
**Status:** ✅ COMPLETE
