const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Ride = require('../models/Ride');
const Message = require('../models/Message');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Authentication middleware for WebSocket
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.name} (${socket.userId}) connected via WebSocket`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);
      this.userSockets.set(socket.id, socket.userId);

      // Join user to their personal room
      socket.join(`user_${socket.userId}`);

      // Join user to college-specific room for ride updates (if college info available)
      if (socket.user.college) {
        const collegeRoom = `college_${socket.user.college.replace(/\s+/g, '_').toLowerCase()}`;
        socket.join(collegeRoom);
        console.log(`User ${socket.user.name} joined college room: ${collegeRoom}`);
      } else {
        // Join general room for users without college info
        socket.join('general_users');
        console.log(`User ${socket.user.name} joined general users room`);
      }

      // Handle ride-related events
      socket.on('join_ride_room', (rideId) => {
        const rideRoom = `ride_${rideId}`;
        socket.join(rideRoom);
        console.log(`User ${socket.user.name} joined ride room: ${rideRoom}`);
      });

      socket.on('leave_ride_room', (rideId) => {
        const rideRoom = `ride_${rideId}`;
        socket.leave(rideRoom);
        console.log(`User ${socket.user.name} left ride room: ${rideRoom}`);
      });

      // Handle real-time notifications
      socket.on('mark_notification_read', (notificationId) => {
        // Emit to user's personal room
        socket.to(`user_${socket.userId}`).emit('notification_read', {
          notificationId,
          userId: socket.userId
        });
      });

      // Handle typing indicators (for future chat features)
      socket.on('typing_start', (data) => {
        socket.to(`ride_${data.rideId}`).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.name,
          rideId: data.rideId
        });
      });

      socket.on('typing_stop', (data) => {
        socket.to(`ride_${data.rideId}`).emit('user_stopped_typing', {
          userId: socket.userId,
          rideId: data.rideId
        });
      });

      // Chat event handlers
      socket.on('join-ride-chat', async (data) => {
        try {
          const { rideId } = data;
          
          // Verify user has access to this ride
          const ride = await Ride.findById(rideId);
          if (!ride) {
            socket.emit('chat-error', { message: 'Ride not found' });
            return;
          }

          const isPoster = ride.poster.toString() === socket.userId;
          const isPassenger = ride.isPassenger(socket.userId);
          
          if (!isPoster && !isPassenger) {
            socket.emit('chat-error', { message: 'You are not authorized to access this chat' });
            return;
          }

          // Join the ride chat room
          const chatRoom = `ride_chat_${rideId}`;
          socket.join(chatRoom);
          
          console.log(`User ${socket.user.name} joined chat for ride ${rideId}`);
          
          socket.emit('joined-ride-chat', { 
            rideId, 
            message: 'Successfully joined ride chat' 
          });
        } catch (error) {
          console.error('Join ride chat error:', error);
          socket.emit('chat-error', { message: 'Failed to join chat' });
        }
      });

      socket.on('leave-ride-chat', (data) => {
        const { rideId } = data;
        const chatRoom = `ride_chat_${rideId}`;
        socket.leave(chatRoom);
        console.log(`User ${socket.user.name} left chat for ride ${rideId}`);
      });

      socket.on('send-message', async (data) => {
        try {
          const { rideId, text, tempId } = data;
          
          // Validate message
          if (!text || text.trim().length === 0) {
            socket.emit('message-error', { 
              tempId, 
              message: 'Message cannot be empty' 
            });
            return;
          }

          if (text.length > 500) {
            socket.emit('message-error', { 
              tempId, 
              message: 'Message too long (max 500 characters)' 
            });
            return;
          }

          // Verify user has access to this ride
          const ride = await Ride.findById(rideId);
          if (!ride) {
            socket.emit('message-error', { 
              tempId, 
              message: 'Ride not found' 
            });
            return;
          }

          const isPoster = ride.poster.toString() === socket.userId;
          const isPassenger = ride.isPassenger(socket.userId);
          
          if (!isPoster && !isPassenger) {
            socket.emit('message-error', { 
              tempId, 
              message: 'You are not authorized to send messages to this ride' 
            });
            return;
          }

          // Create message
          const message = await Message.create({
            rideId,
            userId: socket.userId,
            text: text.trim()
          });

          // Populate user info
          await message.populate('userId', 'name email profilePicture');

          // Emit to all users in the ride chat room
          const chatRoom = `ride_chat_${rideId}`;
          this.io.to(chatRoom).emit('new-chat-message', {
            message: message.toJSON(),
            tempId // For optimistic updates
          });

          console.log(`Message sent by ${socket.user.name} in ride ${rideId}`);
        } catch (error) {
          console.error('Send message error:', error);
          socket.emit('message-error', { 
            tempId: data.tempId, 
            message: 'Failed to send message' 
          });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${socket.user.name} (${socket.userId}) disconnected`);
        this.connectedUsers.delete(socket.userId);
        this.userSockets.delete(socket.id);
      });

      // Send welcome message
      socket.emit('connected', {
        message: 'Connected to RideMate real-time updates',
        userId: socket.userId,
        user: socket.user.getPublicProfile()
      });
    });

    console.log('WebSocket server initialized');
  }

  // Send notification to specific user
  notifyUser(userId, notification) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
      return true;
    }
    return false;
  }

  // Send notification to all users in a college
  notifyCollege(college, notification) {
    const collegeRoom = `college_${college.replace(/\s+/g, '_').toLowerCase()}`;
    this.io.to(collegeRoom).emit('college_notification', notification);
  }

  // Send ride update to all users in a ride
  notifyRide(rideId, update) {
    const rideRoom = `ride_${rideId}`;
    this.io.to(rideRoom).emit('ride_update', update);
  }

  // Send ride update to college
  notifyRideToCollege(college, rideUpdate) {
    const collegeRoom = `college_${college.replace(/\s+/g, '_').toLowerCase()}`;
    this.io.to(collegeRoom).emit('new_ride', rideUpdate);
  }

  // Send user joined/left ride notification
  notifyRideParticipants(rideId, userId, action, userInfo) {
    const rideRoom = `ride_${rideId}`;
    this.io.to(rideRoom).emit('ride_participant_update', {
      rideId,
      userId,
      action, // 'joined' or 'left'
      userInfo,
      timestamp: new Date().toISOString()
    });
  }

  // Send system-wide announcement (admin only)
  broadcastAnnouncement(announcement) {
    this.io.emit('system_announcement', {
      ...announcement,
      timestamp: new Date().toISOString()
    });
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.connectedUsers.size;
  }

  // Get online users in a college
  getOnlineUsersInCollege(college) {
    const collegeRoom = `college_${college.replace(/\s+/g, '_').toLowerCase()}`;
    const sockets = this.io.sockets.adapter.rooms.get(collegeRoom);
    return sockets ? sockets.size : 0;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Get user's socket ID
  getUserSocketId(userId) {
    return this.connectedUsers.get(userId);
  }

  // Send custom event to user
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // Send custom event to all users in a room
  sendToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  // Notify users in ride chat when ride is deleted
  notifyRideChatDeleted(rideId, posterId) {
    const chatRoom = `ride_chat_${rideId}`;
    this.io.to(chatRoom).emit('ride-deleted', {
      rideId,
      posterId,
      message: 'This ride has been deleted by the poster'
    });
  }

  // Get all connected users
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

module.exports = webSocketService;
