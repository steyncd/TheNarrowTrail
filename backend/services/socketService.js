// services/socketService.js - WebSocket service for real-time updates
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

// Initialize Socket.IO server
function initializeSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: [
        'https://www.thenarrowtrail.co.za',
        'https://thenarrowtrail.co.za', 
        'https://helloliam.web.app',
        ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
        ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true
    },
    // Optimize for Cloud Run (HTTP/1.1 only, no WebSocket transport issues)
    transports: ['polling', 'websocket'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware for Socket.IO connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;
      socket.userRole = decoded.role;

      console.log(`Socket authenticated: ${socket.userEmail} (${socket.id})`);
      next();
    } catch (err) {
      console.error('Socket authentication error:', err.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userEmail} (${socket.id})`);

    // Join user-specific room for targeted messages
    socket.join(`user:${socket.userId}`);

    // Join role-specific room (for admin broadcasts)
    socket.join(`role:${socket.userRole}`);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.userEmail} (${socket.id}) - ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.userEmail}:`, error);
    });
  });

  console.log('Socket.IO server initialized');
  return io;
}

// Emit real-time interest count update for a specific hike
function emitInterestUpdate(hikeId, interestData) {
  if (!io) {
    console.warn('Socket.IO not initialized, skipping interest update emit');
    return;
  }

  // Broadcast to all connected clients
  io.emit('interest:updated', {
    hikeId,
    ...interestData
  });

  console.log(`Emitted interest update for hike ${hikeId}:`, interestData);
}

// Emit new hike created notification
function emitNewHike(hikeData) {
  if (!io) {
    console.warn('Socket.IO not initialized, skipping new hike emit');
    return;
  }

  io.emit('hike:created', hikeData);
  console.log(`Emitted new hike created: ${hikeData.name}`);
}

// Emit hike updated notification
function emitHikeUpdate(hikeId, hikeData) {
  if (!io) {
    console.warn('Socket.IO not initialized, skipping hike update emit');
    return;
  }

  io.emit('hike:updated', {
    hikeId,
    ...hikeData
  });
  console.log(`Emitted hike update for hike ${hikeId}`);
}

// Emit hike deleted notification
function emitHikeDeleted(hikeId) {
  if (!io) {
    console.warn('Socket.IO not initialized, skipping hike deleted emit');
    return;
  }

  io.emit('hike:deleted', { hikeId });
  console.log(`Emitted hike deleted: ${hikeId}`);
}

// Send notification to specific user
function emitToUser(userId, event, data) {
  if (!io) {
    console.warn('Socket.IO not initialized, skipping user emit');
    return;
  }

  io.to(`user:${userId}`).emit(event, data);
  console.log(`Emitted ${event} to user ${userId}`);
}

// Send notification to all admins
function emitToAdmins(event, data) {
  if (!io) {
    console.warn('Socket.IO not initialized, skipping admin emit');
    return;
  }

  io.to('role:admin').emit(event, data);
  console.log(`Emitted ${event} to all admins`);
}

// Get current connection count
function getConnectionCount() {
  if (!io) return 0;
  return io.engine.clientsCount;
}

module.exports = {
  initializeSocket,
  emitInterestUpdate,
  emitNewHike,
  emitHikeUpdate,
  emitHikeDeleted,
  emitToUser,
  emitToAdmins,
  getConnectionCount
};
