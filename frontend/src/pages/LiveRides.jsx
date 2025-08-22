import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatTime, formatDate } from '../utils/helpers';

const LiveRides = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchFrom, setSearchFrom] = useState('');
    const [searchTo, setSearchTo] = useState('');

    // Known stations for search
    const stations = [
        'College Campus',
        'Central Station',
        'Mall Area',
        'Airport',
        'Chembur Station',
        'Kurla Station',
        'Andheri Station',
        'Bandra Station',
        'Dadar Station',
        'Churchgate Station'
    ];

    // Mock data - replace with actual API call
    useEffect(() => {
        const mockRides = [
            {
                id: 1,
                poster: 'John Doe',
                from: 'College Campus',
                to: 'Central Station',
                date: new Date().toISOString().split('T')[0], // Today
                time: '08:00:00',
                vehicleType: 'auto',
                totalSeats: 3,
                joinedCount: 1,
                farePerPerson: 50,
                status: 'active'
            },
            {
                id: 2,
                poster: 'Jane Smith',
                from: 'Central Station',
                to: 'Mall Area',
                date: new Date().toISOString().split('T')[0], // Today
                time: '14:30:00',
                vehicleType: 'auto',
                totalSeats: 3,
                joinedCount: 2,
                farePerPerson: 40,
                status: 'active'
            },
            {
                id: 3,
                poster: 'Mike Johnson',
                from: 'College Campus',
                to: 'Airport',
                date: new Date().toISOString().split('T')[0], // Today
                time: '06:00:00',
                vehicleType: 'car',
                totalSeats: 4,
                joinedCount: 3,
                farePerPerson: 80,
                status: 'active'
            }
        ];
        
        setTimeout(() => {
            setRides(mockRides);
            setLoading(false);
        }, 1000);
    }, []);

    // Filter rides by today only and search criteria
    const filteredRides = rides.filter(ride => {
        const today = new Date().toISOString().split('T')[0];
        const isToday = ride.date === today;
        
        if (!isToday) return false;
        
        if (searchFrom && !ride.from.toLowerCase().includes(searchFrom.toLowerCase())) return false;
        if (searchTo && !ride.to.toLowerCase().includes(searchTo.toLowerCase())) return false;
        
        if (filter === 'available') {
            return ride.joinedCount < ride.totalSeats;
        }
        
        return true;
    }).sort((a, b) => new Date(a.time) - new Date(b.time)); // Sort by time

    const handleJoinRide = (rideId) => {
        // TODO: Implement join ride functionality
        console.log('Joining ride:', rideId);
        alert('Join ride functionality will be implemented in the next phase!');
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

    const getStatusText = (joinedCount, totalSeats) => {
        const percentage = (joinedCount / totalSeats) * 100;
        if (percentage <= 33) return '🟩 Available';
        if (percentage <= 66) return '🟨 Filling Up';
        return '🟥 Full';
    };

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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Rides</h1>
                    <p className="text-gray-600">Find ride-mates to share auto/car fare and save money together (Today only)</p>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                        {/* From Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                            <select
                                value={searchFrom}
                                onChange={(e) => setSearchFrom(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All locations</option>
                                {stations.map(station => (
                                    <option key={station} value={station}>{station}</option>
                                ))}
                            </select>
                        </div>

                        {/* To Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                            <select
                                value={searchTo}
                                onChange={(e) => setSearchTo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All locations</option>
                                {stations.map(station => (
                                    <option key={station} value={station}>{station}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Rides</option>
                                <option value="available">Available Seats</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSearchFrom('');
                                    setSearchTo('');
                                    setFilter('all');
                                }}
                                className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Rides Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRides.map((ride) => {
                        const isFull = ride.joinedCount >= ride.totalSeats;
                        return (
                            <div key={ride.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
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
                                        {getStatusText(ride.joinedCount, ride.totalSeats)}
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
                                        <span className="mr-2">💺</span>
                                        {ride.joinedCount}/{ride.totalSeats} ride-mates
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="mr-2">💰</span>
                                        ₹{ride.farePerPerson} per person
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {isFull ? (
                                        <div className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium text-center">
                                            ❌ Ride Full
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleJoinRide(ride.id)}
                                            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                                        >
                                            Join Ride
                                        </button>
                                    )}
                                    <a
                                        href={`https://wa.me/+1234567890`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors flex items-center"
                                        title="Contact via WhatsApp"
                                    >
                                        WhatsApp
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredRides.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl text-gray-300 mb-4">
                            🛺
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No rides available today</h3>
                        <p className="text-gray-600 mb-6">Check back later or share your own ride!</p>
                        <Link
                            to="/create-ride"
                            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                        >
                            Share a Ride
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveRides;
