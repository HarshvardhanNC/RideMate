import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import FloatingChat from './FloatingChat';
import { FaCar, FaMotorcycle, FaTruck, FaCalendarAlt, FaClock, FaDollarSign, FaUsers, FaWhatsapp, FaComments } from 'react-icons/fa';
import { formatTime, formatDate } from '../utils/helpers';

const RideCard = ({ 
    ride, 
    onJoinRide, 
    onLeaveRide, 
    onRemoveUser, 
    showActions = true,
    showChat = true 
}) => {
    const { user } = useAuth();
    const { toggleChat, isChatOpen } = useChat();

    // Check if current user is the poster - more comprehensive check
    const isPoster = (() => {
        if (!user) {
            console.log('No user found');
            return false;
        }
        
        const userId = user._id || user.id;
        if (!userId) {
            console.log('No user ID found:', user);
            return false;
        }
        
        console.log('Checking poster for ride:', {
            rideId: ride._id || ride.id,
            userId: userId,
            ridePoster: ride.poster,
            ridePosterId: ride.posterId
        });
        
        // Check if poster is an object with _id
        if (ride.poster && ride.poster._id) {
            const posterId = ride.poster._id.toString();
            const currentUserId = userId.toString();
            console.log('Comparing poster._id:', posterId, 'with user._id:', currentUserId);
            return posterId === currentUserId;
        }
        
        // Check if poster is a string ID
        if (ride.poster && typeof ride.poster === 'string') {
            const posterId = ride.poster.toString();
            const currentUserId = userId.toString();
            console.log('Comparing poster string:', posterId, 'with user._id:', currentUserId);
            return posterId === currentUserId;
        }
        
        // Check posterId field
        if (ride.posterId) {
            const posterId = ride.posterId.toString();
            const currentUserId = userId.toString();
            console.log('Comparing posterId:', posterId, 'with user._id:', currentUserId);
            return posterId === currentUserId;
        }
        
        console.log('No poster match found');
        return false;
    })();

    // Check if current user is a passenger
    const isPassenger = user && ride.passengers && 
        ride.passengers.some(p => 
            p.user?._id === user._id || 
            p.user === user._id
        );

    // Check if user can access chat (poster or passenger)
    const canAccessChat = isPoster || isPassenger;

    const getVehicleIcon = (vehicleType) => {
        switch (vehicleType?.toLowerCase()) {
            case 'car': return <FaCar className="text-lg" />;
            case 'auto': return <FaTruck className="text-lg" />;
            case 'bike': return <FaMotorcycle className="text-lg" />;
            default: return <FaTruck className="text-lg" />;
        }
    };

    const getStatusColor = (joinedCount, totalSeats) => {
        const percentage = (joinedCount / totalSeats) * 100;
        if (percentage <= 33) return 'bg-green-100 text-green-800';
        if (percentage <= 66) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const getStatusText = (joinedCount, totalSeats) => {
        const percentage = (joinedCount / totalSeats) * 100;
        if (percentage <= 33) return '🟩 Available';
        if (percentage <= 66) return '🟨 Filling Up';
        return '🟥 Full';
    };

    const handleChatToggle = () => {
        if (canAccessChat) {
            toggleChat(ride._id || ride.id);
        }
    };

    const handleJoinRide = () => {
        if (onJoinRide) {
            onJoinRide(ride._id || ride.id);
        }
    };

    const handleLeaveRide = () => {
        if (onLeaveRide) {
            onLeaveRide(ride._id || ride.id);
        }
    };

    const handleRemoveUser = (userId) => {
        if (onRemoveUser) {
            onRemoveUser(ride._id || ride.id, userId);
        }
    };

    // Temporary: Show actual poster name for debugging
    const getPosterDisplayName = () => {
        if (isPoster) {
            return 'You posted this ride';
        }
        
        // Show the actual poster name/ID for debugging
        if (ride.poster) {
            if (ride.poster.name) {
                return `Posted by: ${ride.poster.name}`;
            }
            if (ride.poster._id) {
                return `Posted by: User ${ride.poster._id}`;
            }
            return `Posted by: ${ride.poster}`;
        }
        
        if (ride.posterId) {
            return `Posted by: User ${ride.posterId}`;
        }
        
        return 'Posted by: Unknown';
    };

    return (
        <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
            isPoster ? 'border-blue-400 bg-blue-50' : ''
        }`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        {ride.from} → {ride.to}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {getPosterDisplayName()}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                        {getVehicleIcon(ride.vehicleType)} 
                        <span className="ml-2">{ride.vehicleType?.toUpperCase()}</span>
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    ride.seatsFilled || ride.joinedCount || 0, 
                    ride.seatsAvailable || ride.totalSeats || 0
                )}`}>
                    {getStatusText(
                        ride.seatsFilled || ride.joinedCount || 0, 
                        ride.seatsAvailable || ride.totalSeats || 0
                    )}
                </span>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                    <FaCalendarAlt className="mr-2" />
                    {formatDate(ride.date)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <FaClock className="mr-2" />
                    {formatTime(ride.time)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <FaUsers className="mr-2" />
                    {ride.seatsFilled || ride.joinedCount || 0}/{ride.seatsAvailable || ride.totalSeats || 0} ride-mates
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <FaDollarSign className="mr-2" />
                    ₹{ride.price || ride.farePerPerson} per person
                </div>
            </div>

            {/* Show passengers if user is the poster */}
            {isPoster && ride.passengers && ride.passengers.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Passengers:</h4>
                    <div className="space-y-2">
                        {ride.passengers.map((passenger, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <div>
                                    <p className="text-sm font-medium">{passenger.user?.name || 'Unknown'}</p>
                                    <p className="text-xs text-gray-500">{passenger.user?.phone || ''}</p>
                                </div>
                                <div className="flex gap-1">
                                    <a
                                        href={`https://wa.me/${passenger.user?.phone}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-green-500 text-white p-1 rounded text-xs hover:bg-green-600"
                                        title="WhatsApp"
                                    >
                                        <FaWhatsapp />
                                    </a>
                                    <button
                                        onClick={() => handleRemoveUser(passenger.user?._id)}
                                        className="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {showActions && (
                <div className="flex gap-2">
                    {isFull ? (
                        <div className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium text-center">
                            ❌ Ride Full
                        </div>
                    ) : isPassenger ? (
                        <button
                            onClick={handleLeaveRide}
                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                            Leave Ride
                        </button>
                    ) : (
                        <button
                            onClick={handleJoinRide}
                            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                        >
                            Join Ride
                        </button>
                    )}
                    
                    {/* Chat Button (replaces WhatsApp) */}
                    {showChat && canAccessChat ? (
                        <button
                            onClick={handleChatToggle}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                                isChatOpen(ride._id || ride.id)
                                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                            title={isChatOpen(ride._id || ride.id) ? 'Close Chat' : 'Open Chat'}
                        >
                            <FaComments className="mr-1" />
                            {isChatOpen(ride._id || ride.id) ? 'Close' : 'Chat'}
                        </button>
                    ) : (
                        <a
                            href={`https://wa.me/${ride.poster?.phone || ride.contactPhone || '1234567890'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors flex items-center"
                            title="Contact via WhatsApp"
                        >
                            <FaWhatsapp className="mr-1" />
                            WhatsApp
                        </a>
                    )}
                </div>
            )}

            {/* Floating Chat */}
            {showChat && canAccessChat && (
                <FloatingChat 
                    rideId={ride._id || ride.id}
                    isOpen={isChatOpen(ride._id || ride.id)}
                    onClose={() => toggleChat(ride._id || ride.id)}
                    rideInfo={{
                        from: ride.from,
                        to: ride.to,
                        date: ride.date,
                        time: ride.time
                    }}
                />
            )}
        </div>
    );
};

export default RideCard;
