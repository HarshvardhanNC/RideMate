import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
            transports: ['websocket', 'polling']
        });

        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('🔌 Connected to server:', newSocket.id);
            setIsConnected(true);
            
            // Join user's personal room if logged in
            if (user) {
                newSocket.emit('join-user-room', user.id);
            }
        });

        newSocket.on('disconnect', () => {
            console.log('🔌 Disconnected from server');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('🔌 Connection error:', error);
            setIsConnected(false);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            newSocket.close();
        };
    }, []);

    // Join user room when user logs in
    useEffect(() => {
        if (socket && user) {
            socket.emit('join-user-room', user.id);
        }
    }, [socket, user]);

    // Socket event handlers for real-time updates
    useEffect(() => {
        if (!socket) return;

        // Handle new ride posted
        socket.on('new-ride-posted', (data) => {
            console.log('🆕 New ride posted:', data);
            // This will be handled by RidesContext
        });

        // Handle user joined ride
        socket.on('user-joined-ride', (data) => {
            console.log('👥 User joined ride:', data);
            // This will be handled by RidesContext
        });

        // Handle user left ride
        socket.on('user-left-ride', (data) => {
            console.log('👋 User left ride:', data);
            // This will be handled by RidesContext
        });

        // Handle user joined your ride
        socket.on('user-joined-your-ride', (data) => {
            console.log('👥 Someone joined your ride:', data);
            // Show notification
        });

        // Handle user left your ride
        socket.on('user-left-your-ride', (data) => {
            console.log('👋 Someone left your ride:', data);
            // Show notification
        });

        // Cleanup event listeners
        return () => {
            socket.off('new-ride-posted');
            socket.off('user-joined-ride');
            socket.off('user-left-ride');
            socket.off('user-joined-your-ride');
            socket.off('user-left-your-ride');
        };
    }, [socket]);

    const value = {
        socket,
        isConnected,
        // Helper functions
        joinRideRoom: (rideId) => {
            if (socket) {
                socket.emit('join-ride-room', rideId);
            }
        },
        leaveRideRoom: (rideId) => {
            if (socket) {
                socket.emit('leave-ride-room', rideId);
            }
        },
        emitRideUpdate: (data) => {
            if (socket) {
                socket.emit('ride-updated', data);
            }
        }
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
