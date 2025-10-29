import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import api from '../services/api';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const [chatRooms, setChatRooms] = useState({}); // rideId -> { messages, isOpen, isLoading }
    const [activeChats, setActiveChats] = useState(new Set()); // Track which chats are open
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();

    // Load messages for a ride
    const loadMessages = async (rideId) => {
        if (!user) return;

        try {
            setChatRooms(prev => ({
                ...prev,
                [rideId]: {
                    ...prev[rideId],
                    isLoading: true
                }
            }));

            const response = await api.request(`/rides/${rideId}/messages/latest?limit=50`);
            
            if (response && response.success) {
                setChatRooms(prev => ({
                    ...prev,
                    [rideId]: {
                        ...prev[rideId],
                        messages: response.data || [],
                        isLoading: false,
                        lastLoaded: new Date()
                    }
                }));
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
            setChatRooms(prev => ({
                ...prev,
                [rideId]: {
                    ...prev[rideId],
                    isLoading: false,
                    error: 'Failed to load messages'
                }
            }));
        }
    };

    // Send a message
    const sendMessage = async (rideId, text) => {
        if (!user || !text.trim()) return false;
        if (!socket || !isConnected) {
            console.error('❌ WebSocket not connected');
            return false;
        }

        try {
            console.log('📤 Sending message via WebSocket to ride:', rideId);
            
            // Generate temporary ID for optimistic update
            const tempId = `temp_${Date.now()}_${Math.random()}`;
            
            // Create temporary message for instant display
            const tempMessage = {
                _id: tempId,
                rideId,
                userId: {
                    _id: user._id || user.id,
                    name: user.name
                },
                text: text.trim(),
                createdAt: new Date().toISOString(),
                isTemp: true
            };
            
            // Add temp message optimistically
            setChatRooms(prev => ({
                ...prev,
                [rideId]: {
                    ...prev[rideId],
                    messages: [...(prev[rideId]?.messages || []), tempMessage]
                }
            }));
            
            // Send via WebSocket
            socket.emit('send-message', {
                rideId,
                text: text.trim(),
                tempId
            });
            
            console.log('✅ Message sent via WebSocket');
            return true;
        } catch (error) {
            console.error('❌ Failed to send message:', error);
            return false;
        }
    };

    // Toggle chat panel
    const toggleChat = (rideId) => {
        const isCurrentlyOpen = activeChats.has(rideId);
        
        if (isCurrentlyOpen) {
            // Close chat
            setActiveChats(prev => {
                const newSet = new Set(prev);
                newSet.delete(rideId);
                return newSet;
            });
            
            // Leave the WebSocket chat room
            if (socket && isConnected) {
                socket.emit('leave-ride-chat', { rideId });
                console.log('📤 Left chat room for ride:', rideId);
            }
        } else {
            // Open chat
            setActiveChats(prev => new Set([...prev, rideId]));
            
            // Load messages if not already loaded
            if (!chatRooms[rideId]?.messages) {
                loadMessages(rideId);
            }
            
            // Join the WebSocket chat room
            if (socket && isConnected) {
                socket.emit('join-ride-chat', { rideId });
                console.log('📤 Joining chat room for ride:', rideId);
            }
        }
    };

    // Get messages for a ride
    const getMessages = (rideId) => {
        return chatRooms[rideId]?.messages || [];
    };

    // Check if chat is open for a ride
    const isChatOpen = (rideId) => {
        return activeChats.has(rideId);
    };

    // Check if chat is loading
    const isChatLoading = (rideId) => {
        return chatRooms[rideId]?.isLoading || false;
    };

    // Close all chats
    const closeAllChats = () => {
        // Leave all active chat rooms
        activeChats.forEach(rideId => {
            if (socket && isConnected) {
                socket.emit('leave-ride-chat', { rideId });
            }
        });
        setActiveChats(new Set());
    };

    // Listen for real-time messages from WebSocket
    useEffect(() => {
        if (!socket || !isConnected) return;

        console.log('🔌 Setting up WebSocket chat listeners');

        // Listen for new messages
        const handleNewMessage = (data) => {
            console.log('📨 New message received:', data);
            const { message, tempId } = data;
            
            if (message && message.rideId) {
                setChatRooms(prev => {
                    const existingMessages = prev[message.rideId]?.messages || [];
                    
                    // If there's a tempId, replace the temp message
                    if (tempId) {
                        const withoutTemp = existingMessages.filter(m => m._id !== tempId);
                        
                        // Check if real message already exists
                        const messageExists = withoutTemp.some(m => m._id === message._id);
                        if (messageExists) {
                            return prev;
                        }
                        
                        return {
                            ...prev,
                            [message.rideId]: {
                                ...prev[message.rideId],
                                messages: [...withoutTemp, message]
                            }
                        };
                    }
                    
                    // Check if message already exists (prevent duplicates)
                    const messageExists = existingMessages.some(m => m._id === message._id);
                    if (messageExists) {
                        return prev;
                    }
                    
                    return {
                        ...prev,
                        [message.rideId]: {
                            ...prev[message.rideId],
                            messages: [...existingMessages, message]
                        }
                    };
                });
            }
        };

        // Listen for successful chat room join
        const handleJoinedChat = (data) => {
            console.log('✅ Joined chat room:', data);
        };

        // Listen for chat errors
        const handleChatError = (data) => {
            console.error('❌ Chat error:', data.message);
        };

        socket.on('new-chat-message', handleNewMessage);
        socket.on('joined-ride-chat', handleJoinedChat);
        socket.on('chat-error', handleChatError);

        // Cleanup
        return () => {
            socket.off('new-chat-message', handleNewMessage);
            socket.off('joined-ride-chat', handleJoinedChat);
            socket.off('chat-error', handleChatError);
        };
    }, [socket, isConnected]);

    const value = {
        chatRooms,
        loadMessages,
        sendMessage,
        toggleChat,
        getMessages,
        isChatOpen,
        isChatLoading,
        closeAllChats
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};