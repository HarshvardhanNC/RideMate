import React from 'react';

const MessageBubble = ({ message, isOwn }) => {
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                {/* Sender name for other users' messages */}
                {!isOwn && (
                    <div className="text-xs text-gray-600 mb-1 px-1">
                        {message.userId?.name || 'Unknown User'}
                    </div>
                )}
                
                {/* Message bubble */}
                <div
                    className={`px-3 py-2 rounded-2xl ${
                        isOwn
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                >
                    <p className="text-sm break-words">{message.text}</p>
                    
                    {/* Timestamp */}
                    <div className={`text-[10px] mt-1 ${
                        isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                        {formatTime(message.createdAt)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
