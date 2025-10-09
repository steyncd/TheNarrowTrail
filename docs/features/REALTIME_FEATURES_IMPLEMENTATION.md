# Real-time Features Implementation

**Implementation Date:** October 8, 2025
**Status:** ✅ Completed and Deployed

## Overview

This document describes the implementation of real-time features using WebSockets (Socket.IO) for the Hiking Portal application. This allows users to see live updates when other users express interest or confirm attendance for hikes, without needing to refresh the page.

## Architecture

### Backend: Socket.IO Server

**File:** `backend/services/socketService.js`

The backend uses Socket.IO attached to the Express HTTP server to enable bidirectional communication.

**Key Features:**
- JWT authentication for all WebSocket connections
- User-specific rooms for targeted messages
- Role-based rooms (admin broadcasts)
- Connection/disconnection logging
- Multiple event types (interest updates, hike CRUD operations)

**Socket.IO Configuration:**
```javascript
{
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['polling', 'websocket'],  // Optimized for Cloud Run
  pingTimeout: 60000,
  pingInterval: 25000
}
```

**Authentication Middleware:**
- Verifies JWT token from `socket.handshake.auth.token`
- Extracts user ID, email, and role
- Rejects connections with invalid/missing tokens

### Frontend: React Socket Context

**File:** `frontend/src/contexts/SocketContext.js`

The frontend uses a React Context to manage the Socket.IO connection globally.

**Key Features:**
- Automatic connection when user logs in
- Automatic disconnection when user logs out
- Reconnection logic with exponential backoff
- Easy-to-use hooks: `on()`, `off()`, `emit()`
- Connection status tracking

**Socket Connection:**
```javascript
const socket = io(SOCKET_URL, {
  auth: { token: token },
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

## Real-time Interest Updates

### Backend Implementation

**File:** `backend/controllers/interestController.js`

Added real-time emissions after every interest status change:

**Events that trigger updates:**
1. Toggle interest (add/remove)
2. Confirm attendance
3. Unconfirm attendance
4. Cancel attendance

**Emission Pattern:**
```javascript
// Get updated counts from database
const countsResult = await pool.query(
  `SELECT
    COUNT(*) FILTER (WHERE attendance_status = 'interested') as interested_count,
    COUNT(*) FILTER (WHERE attendance_status = 'confirmed') as confirmed_count
  FROM hike_interest WHERE hike_id = $1`,
  [id]
);

// Broadcast to all connected clients
emitInterestUpdate(id, {
  interestedCount: parseInt(countsResult.rows[0].interested_count),
  confirmedCount: parseInt(countsResult.rows[0].confirmed_count)
});
```

**Event Payload:**
```javascript
{
  hikeId: 123,
  interestedCount: 15,
  confirmedCount: 8
}
```

### Frontend Implementation

**File:** `frontend/src/components/hikes/HikeCard.js`

HikeCard component now listens for real-time updates and updates local state immediately.

**Implementation:**
```javascript
const [interestedCount, setInterestedCount] = useState(hike.interested_users.length);
const [confirmedCount, setConfirmedCount] = useState(hike.confirmed_users.length);

useEffect(() => {
  const handleInterestUpdate = (data) => {
    if (data.hikeId === hike.id) {
      setInterestedCount(data.interestedCount);
      setConfirmedCount(data.confirmedCount);
    }
  };

  on('interest:updated', handleInterestUpdate);
  return () => off('interest:updated', handleInterestUpdate);
}, [hike.id, on, off]);
```

**User Experience:**
- User A clicks "Interested" → Interest count updates for ALL users immediately
- User B confirms attendance → Confirmed count updates for everyone in real-time
- No page refresh needed
- Works across multiple browser tabs/devices

## Integration with App

**File:** `frontend/src/App.js`

The SocketProvider is wrapped inside AuthProvider so it has access to the authentication token:

```javascript
<Router>
  <ThemeProvider>
    <AuthProvider>
      <SocketProvider>
        <Routes>
          {/* All routes */}
        </Routes>
      </SocketProvider>
    </AuthProvider>
  </ThemeProvider>
</Router>
```

## Deployment

### Backend Deployment
- **Platform:** Google Cloud Run
- **URL:** https://hiking-backend-554106646136.us-central1.run.app
- **Status:** ✅ Deployed successfully

**Cloud Run Support:**
- Cloud Run supports WebSockets via HTTP/1.1 upgrade
- Socket.IO configured with both polling and websocket transports
- Polling used as fallback if WebSocket fails

### Frontend Deployment
- **Platform:** Firebase Hosting
- **URL:** https://helloliam.web.app
- **Status:** ✅ Deployed successfully

## Event Types (Future Extension)

The socket service is designed to support multiple event types:

### Currently Implemented:
- `interest:updated` - Real-time interest count updates

### Ready for Implementation:
- `hike:created` - Notify when new hike is created
- `hike:updated` - Notify when hike details change
- `hike:deleted` - Notify when hike is deleted
- User-specific events via `emitToUser()`
- Admin-only events via `emitToAdmins()`

## Performance Considerations

### Backend:
- WebSocket connections are stateful but lightweight
- Each user maintains 1 connection regardless of open tabs
- Broadcasts use Socket.IO rooms for efficient delivery
- No blocking on main request/response cycle

### Frontend:
- Single global socket connection per user session
- Event listeners cleaned up on component unmount
- Local state updates prevent unnecessary re-fetches
- HikeCard already memoized to prevent excessive re-renders

## Testing Real-time Features

### Manual Testing Steps:

1. **Open two browser windows/tabs:**
   - Window A: Login as User 1
   - Window B: Login as User 2

2. **Test interest updates:**
   - Window A: Click "Interested" on a hike
   - Window B: Should see interest count increment immediately
   - Window A: Click "Confirm Attendance"
   - Window B: Should see confirmed count increment immediately

3. **Check browser console:**
   - Should see "Socket.IO connected: [socket-id]"
   - Should see "Emitted interest update for hike..." in backend logs

### Troubleshooting:

**Connection fails:**
- Check browser console for errors
- Verify JWT token is valid
- Check Cloud Run logs: `gcloud logging read --limit 50`

**Updates not received:**
- Verify socket is connected (`connected` state = true)
- Check event listener is properly registered
- Verify hikeId matches in payload

## Security

### Authentication:
- All WebSocket connections require valid JWT token
- Token verified on connection using same secret as REST API
- Invalid tokens rejected immediately

### Authorization:
- User ID extracted from token and stored in socket session
- Can implement per-message authorization if needed
- Admin-only rooms for sensitive broadcasts

## Future Enhancements

1. **Real-time notifications:**
   - Push notifications when new hike is created
   - Alert when hike is about to start
   - Notify when carpool is available

2. **Live chat:**
   - Per-hike chat rooms
   - Admin announcements channel

3. **Presence:**
   - Show who's currently viewing a hike
   - Online/offline status indicators

4. **Optimistic UI:**
   - Update UI immediately on user action
   - Rollback if server rejects (already implemented for interest toggle)

5. **Typing indicators:**
   - Show when admin is typing a response
   - Show when someone is composing a comment

## Dependencies

### Backend:
```json
{
  "socket.io": "^4.8.1"
}
```

### Frontend:
```json
{
  "socket.io-client": "^4.8.1"
}
```

## Monitoring

### Metrics to Track:
- Active WebSocket connections
- Connection duration
- Event emission rate
- Failed connection attempts
- Reconnection frequency

### Available via Socket Service:
```javascript
const connectionCount = socketService.getConnectionCount();
console.log(`Active connections: ${connectionCount}`);
```

## Known Issues

None at this time.

## Rollback Plan

If real-time features cause issues:

1. **Backend:** Comment out `socketService.initializeSocket(server)` in server.js
2. **Frontend:** Remove `<SocketProvider>` wrapper in App.js
3. **Redeploy:** Both backend and frontend

App will continue to function normally using traditional request/response pattern.

## References

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Socket.IO with React](https://socket.io/how-to/use-with-react)
- [Google Cloud Run WebSocket Support](https://cloud.google.com/run/docs/triggering/websockets)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

**Implementation Complete:** All real-time features deployed and tested.
**Next Steps:** Monitor usage and add additional real-time events as needed.
