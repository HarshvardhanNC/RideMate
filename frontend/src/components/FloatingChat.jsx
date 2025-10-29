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
        <div 
            className="fixed z-[9999]"
            style={{
                bottom: position.bottom,
                right: position.right
            }}
        >
            <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
                isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
            }`}>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-blue-500 text-white rounded-t-lg">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <h3 className="text-sm font-medium">
                            {rideInfo ? `${rideInfo.from} → ${rideInfo.to}` : 'Ride Chat'}
                        </h3>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="text-white hover:text-gray-200 transition-colors p-1"
                            title={isMinimized ? 'Maximize' : 'Minimize'}
                        >
                            <FaMinus className="w-3 h-3" />
                        </button>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors p-1"
                            title="Close Chat"
                        >
                            <FaTimes className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Messages Container */}
                        <div 
                            id={`chat-messages-${rideId}`}
                            className="h-[350px] overflow-y-auto p-3 space-y-2"
                        >
                            {isChatLoading(rideId) ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <p className="text-sm">No messages yet. Start the conversation!</p>
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
    );
};

export default FloatingChat;
