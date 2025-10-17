import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRides } from '../context/RidesContext';
import { formatTime, formatDate } from '../utils/helpers';
import RideCard from '../components/RideCard';
import { FaTruck } from 'react-icons/fa';

const LiveRides = () => {
    const { rides, loading, joinRide } = useRides();
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

    const handleJoinRide = async (rideId) => {
        try {
            const result = await joinRide(rideId);
            if (result.success) {
                console.log('Successfully joined ride:', rideId);
                // The RidesContext will automatically update the UI
            } else {
                console.error('Failed to join ride:', result.message);
            }
        } catch (error) {
            console.error('Error joining ride:', error);
        }
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
                    {rides.map((ride) => (
                        <RideCard
                            key={ride.id || ride._id}
                            ride={ride}
                            onJoinRide={handleJoinRide}
                            showActions={true}
                            showChat={true}
                        />
                    ))}
                </div>

                {rides.length === 0 && (
                    <div className="text-center py-12">
                        <div className="flex justify-center mb-4">
                            <FaTruck className="text-6xl text-gray-300" />
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
