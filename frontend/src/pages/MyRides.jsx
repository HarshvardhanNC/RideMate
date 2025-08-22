import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatTime, formatDate } from '../utils/helpers';
import { showNotification } from '../utils/notifications';

const MyRides = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('posted');
    const [postedRides, setPostedRides] = useState([]);
    const [joinedRides, setJoinedRides] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data - replace with actual API call
    useEffect(() => {
        if (!user) return;

        const mockPostedRides = [
            {
                id: 1,
                from: 'College Campus',
                to: 'Central Station',
                date: new Date().toISOString().split('T')[0],
                time: '08:00:00',
                vehicleType: 'auto',
                totalSeats: 3,
                joinedCount: 2,
                farePerPerson: 50,
                status: 'active',
                joinedBy: [
                    { id: 1, name: 'John Doe', phone: '+1234567890' },
                    { id: 2, name: 'Jane Smith', phone: '+1234567891' }
                ]
            },
            {
                id: 2,
                from: 'Central Station',
                to: 'Mall Area',
                date: new Date().toISOString().split('T')[0],
                time: '14:30:00',
                vehicleType: 'auto',
                totalSeats: 3,
                joinedCount: 1,
                farePerPerson: 40,
                status: 'active',
                joinedBy: [
                    { id: 3, name: 'Mike Johnson', phone: '+1234567892' }
                ]
            }
        ];

        const mockJoinedRides = [
            {
                id: 3,
                poster: 'Alice Brown',
                posterPhone: '+1234567893',
                from: 'Mall Area',
                to: 'Airport',
                date: new Date().toISOString().split('T')[0],
                time: '16:00:00',
                vehicleType: 'car',
                totalSeats: 4,
                joinedCount: 3,
                farePerPerson: 80,
                status: 'active'
            }
        ];

        setTimeout(() => {
            setPostedRides(mockPostedRides);
            setJoinedRides(mockJoinedRides);
            setLoading(false);
        }, 1000);
    }, [user]);

    const handleRemoveUser = (rideId, userId) => {
        // TODO: Implement remove user functionality
        showNotification('Ride-mate removed from ride', 'success');
        setPostedRides(prev => prev.map(ride => 
            ride.id === rideId 
                ? {
                    ...ride,
                    joinedBy: ride.joinedBy.filter(user => user.id !== userId),
                    joinedCount: ride.joinedCount - 1
                  }
                : ride
        ));
    };

    const handleDeleteRide = (rideId) => {
        if (window.confirm('Are you sure you want to delete this ride?')) {
            // TODO: Implement delete ride functionality
            showNotification('Ride deleted successfully', 'success');
            setPostedRides(prev => prev.filter(ride => ride.id !== rideId));
        }
    };

    const handleEditRide = (rideId) => {
        // TODO: Implement edit ride functionality
        showNotification('Edit ride functionality will be implemented in the next phase!', 'info');
    };

    const getVehicleIcon = (vehicleType) => {
        switch (vehicleType) {
            case 'car': return '🚗';
            case 'auto': return '🛺';
            case 'bike': return '🏍️';
            default: return '🛺';
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
                                🛺 Posted Rides ({postedRides.length})
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
                                <div className="text-6xl text-gray-300 mb-4">🛺</div>
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
                                    <div key={ride.id} className="bg-white rounded-lg shadow-md p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {ride.from} → {ride.to}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {getVehicleIcon(ride.vehicleType)} {ride.vehicleType.toUpperCase()}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ride.joinedCount, ride.totalSeats)}`}>
                                                {ride.joinedCount}/{ride.totalSeats} ride-mates
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="mr-2">📅</span>
                                                {formatDate(ride.date)}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="mr-2">⏰</span>
                                                {formatTime(ride.time)}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="mr-2">💰</span>
                                                ₹{ride.farePerPerson} per person
                                            </div>
                                        </div>

                                        {/* Ride-mates List */}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Ride-mates:</h4>
                                            {ride.joinedBy.length === 0 ? (
                                                <p className="text-sm text-gray-500">No ride-mates yet</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {ride.joinedBy.map((rideMate) => (
                                                        <div key={rideMate.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{rideMate.name}</p>
                                                                <p className="text-xs text-gray-500">{rideMate.phone}</p>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <a
                                                                    href={`https://wa.me/${rideMate.phone}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="bg-green-500 text-white p-1 rounded text-xs hover:bg-green-600"
                                                                    title="WhatsApp"
                                                                >
                                                                    WA
                                                                </a>
                                                                <button
                                                                    onClick={() => handleRemoveUser(ride.id, rideMate.id)}
                                                                    className="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600"
                                                                >
                                                                    ❌
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
                                                onClick={() => handleEditRide(ride.id)}
                                                className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRide(ride.id)}
                                                className="flex-1 bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                                            >
                                                🗑️ Delete
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
                                <div className="text-6xl text-gray-300 mb-4">👥</div>
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
                                    <div key={ride.id} className="bg-white rounded-lg shadow-md p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {ride.from} → {ride.to}
                                                </h3>
                                                <p className="text-sm text-gray-600">Posted by: {ride.poster}</p>
                                                <p className="text-sm text-gray-600">
                                                    {getVehicleIcon(ride.vehicleType)} {ride.vehicleType.toUpperCase()}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ride.joinedCount, ride.totalSeats)}`}>
                                                {ride.joinedCount}/{ride.totalSeats} ride-mates
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="mr-2">📅</span>
                                                {formatDate(ride.date)}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="mr-2">⏰</span>
                                                {formatTime(ride.time)}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="mr-2">💰</span>
                                                ₹{ride.farePerPerson} per person
                                            </div>
                                        </div>

                                        {/* Contact Poster */}
                                        <div className="flex gap-2">
                                            <a
                                                href={`https://wa.me/${ride.posterPhone}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors text-center"
                                            >
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
