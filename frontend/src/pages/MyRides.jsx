import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRides } from '../context/RidesContext'; // Import useRides hook for global state management
import { formatTime, formatDate } from '../utils/helpers';
import { showNotification } from '../utils/notifications';
import { FaCar, FaMotorcycle, FaTruck, FaCalendarAlt, FaClock, FaDollarSign, FaUsers, FaEdit, FaTrash, FaWhatsapp } from 'react-icons/fa';

const MyRides = () => {
    const { user } = useAuth();
    // Use global rides state and functions from RidesContext instead of local state
    const { loading, getPostedRides, getJoinedRides, removeUserFromRide, deleteRide } = useRides();
    
    // Keep local state only for UI-specific tab selection
    const [activeTab, setActiveTab] = useState('posted');
    
    // Get user's rides from global state instead of local state
    const postedRides = getPostedRides(); // Get rides posted by current user from global context
    const joinedRides = getJoinedRides(); // Get rides joined by current user from global context

    // No need for useEffect to load mock data - RidesContext handles this globally
    // The global state is automatically loaded when the RidesProvider mounts
    // User's posted and joined rides are automatically calculated from global state

    // Use global removeUserFromRide function from RidesContext instead of local state management
    const handleRemoveUser = async (rideId, userId) => {
        const result = await removeUserFromRide(rideId, userId); // Use global function
        if (result.success) {
            // The global state will automatically update, no need for local state management
            console.log('Successfully removed user from ride');
        }
    };

    // Use global deleteRide function from RidesContext instead of local state management
    const handleDeleteRide = async (rideId) => {
        if (window.confirm('Are you sure you want to delete this ride?')) {
            const result = await deleteRide(rideId); // Use global function
            if (result.success) {
                // The global state will automatically update, no need for local state management
                console.log('Successfully deleted ride');
            }
        }
    };

    const handleEditRide = (rideId) => {
        // TODO: Implement edit ride functionality
        showNotification('Edit ride functionality will be implemented in the next phase!', 'info');
    };

    const getVehicleIcon = (vehicleType) => {
        switch (vehicleType) {
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

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
                    <p className="text-gray-600 mb-6">You need to be logged in to view your rides.</p>
                    <a
                        href="/login"
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                        Login
                    </a>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Show empty state if no rides
    const hasPostedRides = postedRides && postedRides.length > 0;
    const hasJoinedRides = joinedRides && joinedRides.length > 0;

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Rides</h1>
                    <p className="text-gray-600">Manage your shared rides and view joined rides</p>
                </div>


                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-md mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex">
                            <button
                                onClick={() => setActiveTab('posted')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'posted'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Posted Rides ({postedRides.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('joined')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'joined'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                👥 Joined Rides ({joinedRides.length})
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Posted Rides Section */}
                {activeTab === 'posted' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Posted Rides</h2>
                            <p className="text-gray-600">Manage your rides and ride-mates</p>
                        </div>

                        {postedRides.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                <div className="flex justify-center mb-4">
                                    <FaTruck className="text-6xl text-gray-300" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posted rides</h3>
                                <p className="text-gray-600 mb-6">Start by sharing your first ride!</p>
                                <a
                                    href="/create-ride"
                                    className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                                >
                                    Share a Ride
                                </a>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {postedRides.map((ride) => (
                                    <div key={ride.id || ride._id} className="bg-white rounded-lg shadow-md p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {ride.from} → {ride.to}
                                                </h3>
                                                <p className="text-sm text-gray-600 flex items-center">
                                                    {getVehicleIcon(ride.vehicleType)} 
                                                    <span className="ml-2">{ride.vehicleType?.toUpperCase()}</span>
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ride.seatsFilled || 0, ride.seatsAvailable || 0)}`}>
                                                {ride.seatsFilled || 0}/{ride.seatsAvailable || 0} ride-mates
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
                                                <FaDollarSign className="mr-2" />
                                                ₹{ride.price} per person
                                            </div>
                                        </div>

                                        {/* Ride-mates List */}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Ride-mates:</h4>
                                            {(!ride.passengers || ride.passengers.length === 0) ? (
                                                <p className="text-sm text-gray-500">No ride-mates yet</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {ride.passengers.map((passenger, index) => (
                                                        <div key={passenger.user?._id || index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{passenger.user?.name || 'Unknown'}</p>
                                                                <p className="text-xs text-gray-500">{passenger.user?.phone || 'N/A'}</p>
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
                                                                    onClick={() => handleRemoveUser(ride.id || ride._id, passenger.user?._id)}
                                                                    className="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditRide(ride.id || ride._id)}
                                                className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
                                            >
                                                <FaEdit className="mr-1" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRide(ride.id || ride._id)}
                                                className="flex-1 bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center"
                                            >
                                                <FaTrash className="mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Joined Rides Section */}
                {activeTab === 'joined' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Joined Rides</h2>
                            <p className="text-gray-600">Rides you've joined as a ride-mate</p>
                        </div>

                        {joinedRides.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                <div className="flex justify-center mb-4">
                                    <FaUsers className="text-6xl text-gray-300" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No joined rides</h3>
                                <p className="text-gray-600 mb-6">Join rides from the live rides page!</p>
                                <a
                                    href="/live-rides"
                                    className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                                >
                                    Browse Rides
                                </a>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {joinedRides.map((ride) => (
                                    <div key={ride.id || ride._id} className="bg-white rounded-lg shadow-md p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {ride.from} → {ride.to}
                                                </h3>
                                                <p className="text-sm text-gray-600">Posted by: {ride.poster?.name || 'Unknown'}</p>
                                                <p className="text-sm text-gray-600 flex items-center">
                                                    {getVehicleIcon(ride.vehicleType)} 
                                                    <span className="ml-2">{ride.vehicleType?.toUpperCase()}</span>
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ride.seatsFilled || 0, ride.seatsAvailable || 0)}`}>
                                                {ride.seatsFilled || 0}/{ride.seatsAvailable || 0} ride-mates
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
                                                <FaDollarSign className="mr-2" />
                                                ₹{ride.price} per person
                                            </div>
                                        </div>

                                        {/* Contact Poster */}
                                        <div className="flex gap-2">
                                            <a
                                                href={`https://wa.me/${ride.poster?.phone || ride.contactPhone}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors text-center flex items-center justify-center"
                                            >
                                                <FaWhatsapp className="mr-2" />
                                                WhatsApp Poster
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRides;
