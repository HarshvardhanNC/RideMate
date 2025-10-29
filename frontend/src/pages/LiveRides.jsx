import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRides } from '../context/RidesContext';
import { formatTime, formatDate } from '../utils/helpers';
import RideCard from '../components/RideCard';
import { FaTruck } from 'react-icons/fa';

const LiveRides = () => {
    const { rides, loading, joinRide, leaveRide, loadRidesFromAPI } = useRides();
    const [filter, setFilter] = useState('all');
    const [searchFrom, setSearchFrom] = useState('');
    const [searchTo, setSearchTo] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await loadRidesFromAPI();
        } finally {
            setIsRefreshing(false);
        }
    };

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

    const handleLeaveRide = async (rideId) => {
        try {
            const result = await leaveRide(rideId);
            if (result.success) {
                console.log('Successfully left ride:', rideId);
                // The RidesContext will automatically update the UI
            } else {
                console.error('Failed to leave ride:', result.message);
            }
        } catch (error) {
            console.error('Error leaving ride:', error);
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
        <div className="bg-gray-50 min-h-screen py-4 sm:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Live Rides</h1>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:bg-blue-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                        {isRefreshing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Refreshing...</span>
                            </>
                        ) : (
                            <>
                                <span>🔄 Refresh</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                        {/* From Search */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">From</label>
                            <select
                                value={searchFrom}
                                onChange={(e) => setSearchFrom(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All locations</option>
                                {stations.map(station => (
                                    <option key={station} value={station}>{station}</option>
                                ))}
                            </select>
                        </div>

                        {/* To Search */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">To</label>
                            <select
                                value={searchTo}
                                onChange={(e) => setSearchTo(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All locations</option>
                                {stations.map(station => (
                                    <option key={station} value={station}>{station}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filter */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Status</label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm font-medium"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Rides Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {rides.map((ride) => (
                        <RideCard
                            key={ride.id || ride._id}
                            ride={ride}
                            onJoinRide={handleJoinRide}
                            onLeaveRide={handleLeaveRide}
                            showActions={true}
                            showChat={false}
                            showPassengerList={false}
                        />
                    ))}
                </div>

                {rides.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <div className="flex justify-center mb-4">
                            <FaTruck className="text-6xl text-gray-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No rides available</h3>
                        <p className="text-gray-600 mb-4">Be the first to share a ride!</p>
                        <div className="flex gap-3 justify-center">
                            <Link
                                to="/create-ride"
                                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors inline-block"
                            >
                                Share a Ride
                            </Link>
                            <button
                                onClick={handleRefresh}
                                className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                            >
                                Refresh
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">💡 Tip: Check the browser console (F12) for debugging info</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveRides;
