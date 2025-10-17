import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import webSocketService from '../services/websocket';
import { showNotification } from '../utils/notifications';

export const useWebSocket = () => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const eventListenersRef = useRef(new Map());

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (user && token) {
      console.log('Connecting to WebSocket...');
      const socket = webSocketService.connect(token);
      
      if (socket) {
        // Listen for connection status changes
        const handleConnectionChange = (data) => {
          setIsConnected(data.connected);
          setConnectionStatus(data.connected ? 'connected' : 'disconnected');
        };

        const handleDisconnection = (data) => {
          setIsConnected(false);
          setConnectionStatus('disconnected');
          if (data.reason !== 'io client disconnect') {
            showNotification('Connection lost. Attempting to reconnect...', 'warning');
          }
        };

        const handleConnectionError = (data) => {
          setConnectionStatus('error');
          showNotification('Connection error: ' + data.error, 'error');
        };

        const handleAuthenticated = (data) => {
          setConnectionStatus('authenticated');
          showNotification('Connected to real-time updates', 'success');
        };

        // Real-time ride notifications
        const handleNewRide = (data) => {
          if (data.ride && data.ride.college === user.college) {
            showNotification(`New ride available: ${data.ride.from} to ${data.ride.to}`, 'info');
          }
        };

        const handleRideUpdate = (data) => {
          showNotification(data.message || 'Ride updated', 'info');
        };

        const handlePassengerJoined = (data) => {
          showNotification(data.message, 'success');
        };

        const handlePassengerLeft = (data) => {
          showNotification(data.message, 'info');
        };

        const handleRideCreated = (data) => {
          showNotification(data.message, 'success');
        };

        const handleRideJoined = (data) => {
          showNotification(data.message, 'success');
        };

        const handleRideLeft = (data) => {
          showNotification(data.message, 'info');
        };

        // System notifications
        const handleNotification = (data) => {
          showNotification(data.message, data.type || 'info');
        };

        const handleCollegeNotification = (data) => {
          if (data.college === user.college) {
            showNotification(data.message, 'info');
          }
        };

        const handleSystemAnnouncement = (data) => {
          showNotification(data.message, 'warning');
        };

        // Register event listeners
        webSocketService.on('connected', handleConnectionChange);
        webSocketService.on('disconnected', handleDisconnection);
        webSocketService.on('connection_error', handleConnectionError);
        webSocketService.on('authenticated', handleAuthenticated);
        webSocketService.on('new_ride', handleNewRide);
        webSocketService.on('ride_update', handleRideUpdate);
        webSocketService.on('passenger_joined', handlePassengerJoined);
        webSocketService.on('passenger_left', handlePassengerLeft);
        webSocketService.on('ride_created', handleRideCreated);
        webSocketService.on('ride_joined', handleRideJoined);
        webSocketService.on('ride_left', handleRideLeft);
        webSocketService.on('notification', handleNotification);
        webSocketService.on('college_notification', handleCollegeNotification);
        webSocketService.on('system_announcement', handleSystemAnnouncement);

        // Store listeners for cleanup
        eventListenersRef.current.set('connected', handleConnectionChange);
        eventListenersRef.current.set('disconnected', handleDisconnection);
        eventListenersRef.current.set('connection_error', handleConnectionError);
        eventListenersRef.current.set('authenticated', handleAuthenticated);
        eventListenersRef.current.set('new_ride', handleNewRide);
        eventListenersRef.current.set('ride_update', handleRideUpdate);
        eventListenersRef.current.set('passenger_joined', handlePassengerJoined);
        eventListenersRef.current.set('passenger_left', handlePassengerLeft);
        eventListenersRef.current.set('ride_created', handleRideCreated);
        eventListenersRef.current.set('ride_joined', handleRideJoined);
        eventListenersRef.current.set('ride_left', handleRideLeft);
        eventListenersRef.current.set('notification', handleNotification);
        eventListenersRef.current.set('college_notification', handleCollegeNotification);
        eventListenersRef.current.set('system_announcement', handleSystemAnnouncement);

        // Update initial connection status
        setConnectionStatus(webSocketService.getConnectionStatus().isConnected ? 'connected' : 'connecting');
      }
    } else {
      // Disconnect when user logs out
      webSocketService.disconnect();
      setIsConnected(false);
      setConnectionStatus('disconnected');
    }

    // Cleanup function
    return () => {
      // Remove all event listeners
      eventListenersRef.current.forEach((listener, event) => {
        webSocketService.off(event, listener);
      });
      eventListenersRef.current.clear();
    };
  }, [user, token]);

  // Join ride room for real-time updates
  const joinRideRoom = (rideId) => {
    if (isConnected) {
      webSocketService.joinRideRoom(rideId);
    }
  };

  // Leave ride room
  const leaveRideRoom = (rideId) => {
    if (isConnected) {
      webSocketService.leaveRideRoom(rideId);
    }
  };

  // Mark notification as read
  const markNotificationRead = (notificationId) => {
    if (isConnected) {
      webSocketService.markNotificationRead(notificationId);
    }
  };

  // Send typing indicators
  const startTyping = (rideId) => {
    if (isConnected) {
      webSocketService.startTyping(rideId);
    }
  };

  const stopTyping = (rideId) => {
    if (isConnected) {
      webSocketService.stopTyping(rideId);
    }
  };

  // Get connection status
  const getConnectionStatus = () => {
    return {
      isConnected,
      status: connectionStatus,
      ...webSocketService.getConnectionStatus()
    };
  };

  // Reconnect manually
  const reconnect = () => {
    if (user && token) {
      webSocketService.reconnectWithToken(token);
    }
  };

  return {
    isConnected,
    connectionStatus,
    joinRideRoom,
    leaveRideRoom,
    markNotificationRead,
    startTyping,
    stopTyping,
    getConnectionStatus,
    reconnect
  };
};

export default useWebSocket;
