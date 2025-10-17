import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';

const ChatInput = ({ rideId }) => {
    const [message, setMessage] = useState('');
    const { sendMessage } = useChat();
    const inputRef = useRef(null);

    // Focus input when component mounts
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!message.trim()) return;

        // Send message
        const success = await sendMessage(rideId, message);
        if (success) {
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
            <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    maxLength={500}
                />
                <button
                    type="submit"
                    disabled={!message.trim()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                    Send
                </button>
            </form>
            
            {/* Character count */}
            <div className="text-xs text-gray-500 mt-1 text-right">
                {message.length}/500
            </div>
        </div>
    );
};

export default ChatInput;
