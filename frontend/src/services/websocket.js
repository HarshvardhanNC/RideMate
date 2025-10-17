import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
  }

  // Initialize WebSocket connection
  connect(token) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    try {
      this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.setupEventListeners();
      return this.socket;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      return null;
    }
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', { connected: false, reason });
      
      // Attempt to reconnect if not manually disconnected
      if (reason !== 'io client disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
      this.emit('connection_error', { error: error.message });
    });

    // Authentication events
    this.socket.on('connected', (data) => {
      console.log('WebSocket authenticated:', data);
      this.emit('authenticated', data);
    });

    // Real-time ride events
    this.socket.on('new_ride', (data) => {
      console.log('New ride notification:', data);
      this.emit('new_ride', data);
    });

    this.socket.on('ride_update', (data) => {
      console.log('Ride update:', data);
      this.emit('ride_update', data);
    });

    this.socket.on('ride_participant_update', (data) => {
      console.log('Ride participant update:', data);
      this.emit('ride_participant_update', data);
    });

    this.socket.on('ride_created', (data) => {
      console.log('Ride created confirmation:', data);
      this.emit('ride_created', data);
    });

    this.socket.on('ride_joined', (data) => {
      console.log('Ride joined confirmation:', data);
      this.emit('ride_joined', data);
    });

    this.socket.on('ride_left', (data) => {
      console.log('Ride left confirmation:', data);
      this.emit('ride_left', data);
    });

    this.socket.on('passenger_joined', (data) => {
      console.log('Passenger joined your ride:', data);
      this.emit('passenger_joined', data);
    });

    this.socket.on('passenger_left', (data) => {
      console.log('Passenger left your ride:', data);
      this.emit('passenger_left', data);
    });

    // Notification events
    this.socket.on('notification', (data) => {
      console.log('New notification:', data);
      this.emit('notification', data);
    });

    this.socket.on('college_notification', (data) => {
      console.log('College notification:', data);
      this.emit('college_notification', data);
    });

    this.socket.on('system_announcement', (data) => {
      console.log('System announcement:', data);
      this.emit('system_announcement', data);
    });

    // Typing indicators (for future chat features)
    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });

    this.socket.on('user_stopped_typing', (data) => {
      this.emit('user_stopped_typing', data);
    });
  }

  // Attempt to reconnect
  attemptReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      if (this.socket && !this.isConnected) {
        this.socket.connect();
      }
    }, delay);
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  // Join a ride room for real-time updates
  joinRideRoom(rideId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_ride_room', rideId);
    }
  }

  // Leave a ride room
  leaveRideRoom(rideId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_ride_room', rideId);
    }
  }

  // Mark notification as read
  markNotificationRead(notificationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_notification_read', notificationId);
    }
  }

  // Send typing indicator
  startTyping(rideId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { rideId });
    }
  }

  // Stop typing indicator
  stopTyping(rideId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { rideId });
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id || null
    };
  }

  // Reconnect with new token
  reconnectWithToken(token) {
    this.disconnect();
    return this.connect(token);
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
