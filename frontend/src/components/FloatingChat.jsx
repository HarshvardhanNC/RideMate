import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { FaTimes, FaMinus } from 'react-icons/fa';

const FloatingChat = ({ rideId, isOpen, onClose, rideInfo }) => {
    const { getMessages, isChatLoading } = useChat();
    const { user } = useAuth();
    const messages = getMessages(rideId);
    const chatEndRef = useRef(null);
    const [isMinimized, setIsMinimized] = useState(false);

    // Calculate position for multiple chats
    const getChatPosition = () => {
        // For now, just use bottom-right, but this could be enhanced to stack multiple chats
        return {
            bottom: '1rem',
            right: '1rem'
        };
    };

    const position = getChatPosition();

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (isOpen && !isMinimized && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isMinimized]);

    if (!isOpen) return null;

    return (
        <>
            {/* Mobile Overlay */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-[9998] md:hidden"
                onClick={onClose}
            />
            
            {/* Chat Window */}
            <div 
                className="fixed z-[9999] md:bottom-4 md:right-4 inset-x-0 bottom-0 md:inset-auto"
            >
                <div className={`bg-white md:rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
                    isMinimized 
                        ? 'w-full md:w-80 h-16' 
                        : 'w-full md:w-96 h-[calc(100vh-4rem)] md:h-[500px] rounded-t-2xl md:rounded-lg'
                }`}>
                    {/* Chat Header */}
                    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-blue-500 text-white rounded-t-2xl md:rounded-t-lg">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full flex-shrink-0"></div>
                            <h3 className="text-xs sm:text-sm font-medium truncate">
                                {rideInfo ? `${rideInfo.from} → ${rideInfo.to}` : 'Ride Chat'}
                            </h3>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="hidden md:block text-white hover:text-gray-200 transition-colors p-1"
                                title={isMinimized ? 'Maximize' : 'Minimize'}
                            >
                                <FaMinus className="w-3 h-3" />
                            </button>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-gray-200 transition-colors p-1"
                                title="Close Chat"
                            >
                                <FaTimes className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Messages Container */}
                            <div 
                                id={`chat-messages-${rideId}`}
                                className="h-[calc(100vh-12rem)] md:h-[350px] overflow-y-auto p-3 sm:p-4 space-y-2"
                            >
                            {isChatLoading(rideId) ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <p className="text-xs sm:text-sm text-center px-4">No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const messageUserId = message.userId?._id || message.userId;
                                    const currentUserId = user?._id || user?.id;
                                    return (
                                        <MessageBubble
                                            key={message._id}
                                            message={message}
                                            isOwn={messageUserId === currentUserId}
                                        />
                                    );
                                })
                            )}

                            {/* Scroll anchor */}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Chat Input */}
                        <ChatInput rideId={rideId} />
                    </>
                )}
            </div>
        </div>
        </>
    );
};

export default FloatingChat;
