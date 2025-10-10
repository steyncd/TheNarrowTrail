// contexts/SocketContext.js - WebSocket context for real-time updates
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { token, currentUser } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    // Only connect if user is authenticated
    if (!token || !currentUser) {
      if (socketRef.current) {
        console.log('Disconnecting socket - user logged out');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Don't reconnect if already connected
    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    console.log('Initializing Socket.IO connection...');

    // Use environment variable or fallback to production URL
    const SOCKET_URL = process.env.REACT_APP_API_URL || 'https://backend-4kzqyywlqq-ew.a.run.app';

    const newSocket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message);
      setConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, currentUser]);

  // Listen for specific event
  const on = useCallback((event, callback) => {
    if (!socketRef.current) {
      console.warn('Socket not initialized, cannot listen for event:', event);
      return;
    }
    socketRef.current.on(event, callback);
  }, []);

  // Stop listening for specific event
  const off = useCallback((event, callback) => {
    if (!socketRef.current) return;
    socketRef.current.off(event, callback);
  }, []);

  // Emit event to server
  const emit = useCallback((event, data) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn('Socket not connected, cannot emit event:', event);
      return;
    }
    socketRef.current.emit(event, data);
  }, []);

  const value = {
    socket: socketRef.current,
    connected,
    on,
    off,
    emit
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
