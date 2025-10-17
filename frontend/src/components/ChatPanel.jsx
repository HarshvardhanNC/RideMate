import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

const ChatPanel = ({ rideId, isOpen, onClose }) => {
    const { getMessages, isChatLoading } = useChat();
    const { user } = useAuth();
    const messages = getMessages(rideId);
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (isOpen && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="border-t border-gray-200 bg-white">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-900">Ride Chat</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Messages Container */}
            <div 
                id={`chat-messages-${rideId}`}
                className="h-[300px] overflow-y-auto p-3 space-y-2"
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
                    messages.map((message) => (
                        <MessageBubble
                            key={message._id}
                            message={message}
                            isOwn={message.userId._id === user?._id}
                        />
                    ))
                )}

                {/* Scroll anchor */}
                <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <ChatInput rideId={rideId} />
        </div>
    );
};

export default ChatPanel;
