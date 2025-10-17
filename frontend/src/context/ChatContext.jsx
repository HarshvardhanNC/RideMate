import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
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

            const response = await api.get(`/rides/${rideId}/messages/latest?limit=50`);
            
            if (response.data.success) {
                setChatRooms(prev => ({
                    ...prev,
                    [rideId]: {
                        ...prev[rideId],
                        messages: response.data.data || [],
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
        if (!user || !text.trim()) return;

        try {
            const response = await api.post(`/rides/${rideId}/messages`, {
                text: text.trim()
            });

            if (response.data.success) {
                const newMessage = response.data.data;
                
                setChatRooms(prev => ({
                    ...prev,
                    [rideId]: {
                        ...prev[rideId],
                        messages: [...(prev[rideId]?.messages || []), newMessage]
                    }
                }));
                
                return true;
            }
        } catch (error) {
            console.error('Failed to send message:', error);
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
        } else {
            // Open chat
            setActiveChats(prev => new Set([...prev, rideId]));
            
            // Load messages if not already loaded
            if (!chatRooms[rideId]?.messages) {
                loadMessages(rideId);
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
        setActiveChats(new Set());
    };

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