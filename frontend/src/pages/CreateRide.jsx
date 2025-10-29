import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRides } from '../context/RidesContext';
import { useAuth } from '../context/AuthContext';
import { showNotification } from '../utils/notifications';
import { FaCar, FaMotorcycle, FaTruck, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaDollarSign, FaFileAlt, FaChair } from 'react-icons/fa';

const CreateRide = () => {
    const { createRide } = useRides(); // Get createRide function from global context
    const { user } = useAuth(); // Get current user
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Helper function to get current date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Helper function to get current time in HH:MM format
    const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const [formData, setFormData] = useState({
        from: '',
        to: '',
        vehicleType: 'auto',
        date: getTodayDate(), // Prefill with today's date
        time: getCurrentTime(), // Prefill with current time
        totalSeats: '',
        description: ''
    });

    // Known stations for dropdown
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

    const vehicleTypes = [
        { value: 'auto', label: 'Auto Rickshaw', seats: 3, icon: FaTruck },
        { value: 'car', label: 'Car', seats: 4, icon: FaCar },
        { value: 'bike', label: 'Motorcycle', seats: 2, icon: FaMotorcycle }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Auto-set total seats based on vehicle type
        if (name === 'vehicleType') {
            const selectedVehicle = vehicleTypes.find(v => v.value === value);
            setFormData(prev => ({
                ...prev,
                vehicleType: value,
                totalSeats: selectedVehicle ? selectedVehicle.seats.toString() : ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            showNotification('Please login to post a ride', 'warning');
            return;
        }

        setLoading(true);
        
        try {
            // Transform data to match backend API expectations
            const rideData = {
                from: formData.from,
                to: formData.to,
                vehicleType: formData.vehicleType.charAt(0).toUpperCase() + formData.vehicleType.slice(1), // Capitalize first letter
                date: formData.date,
                time: formData.time,
                seatsAvailable: parseInt(formData.totalSeats),
                price: 0, // Free ride sharing - price set to 0
                vehicleNumber: 'NA', // Default value since we don't collect this
                college: user.college || 'Not specified', // Use user's college or default
                contactPhone: user.phone, // Use user's phone
                description: formData.description
            };

            // Use global createRide function from RidesContext instead of local implementation
            const result = await createRide(rideData); // Use global createRide function
            
            if (result.success) {
                // The global state will automatically update, no need for local state management
                console.log('Ride created successfully:', result.ride);
                setTimeout(() => {
                    navigate('/my-rides');
                }, 1000);
            } else {
                showNotification('Failed to post ride. Please try again.', 'error');
            }
        } catch (error) {
            showNotification('Failed to post ride. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="bg-gray-50 min-h-screen py-4 sm:py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Share Your Ride</h1>
                    <p className="text-sm sm:text-base text-gray-600">Find ride-mates to split your auto/car fare and save money together!</p>
                </div>

                {/* Create Ride Form */}
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {/* From Location */}
                            <div>
                                <label htmlFor="from" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center">
                                    <FaMapMarkerAlt className="mr-2 text-sm" />
                                    <span>From Station</span>
                                </label>
                                <select
                                    id="from"
                                    name="from"
                                    required
                                    value={formData.from}
                                    onChange={handleChange}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select starting point</option>
                                    {stations.map(station => (
                                        <option key={station} value={station}>{station}</option>
                                    ))}
                                </select>
                            </div>

                            {/* To Location */}
                            <div>
                                <label htmlFor="to" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center">
                                    <FaMapMarkerAlt className="mr-2 text-sm" />
                                    <span>To Station</span>
                                </label>
                                <select
                                    id="to"
                                    name="to"
                                    required
                                    value={formData.to}
                                    onChange={handleChange}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select destination</option>
                                    {stations.map(station => (
                                        <option key={station} value={station}>{station}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Vehicle Type */}
                            <div>
                                <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <FaCar className="mr-2" />
                                    Vehicle Type
                                </label>
                                <select
                                    id="vehicleType"
                                    name="vehicleType"
                                    required
                                    value={formData.vehicleType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {vehicleTypes.map(vehicle => {
                                        const IconComponent = vehicle.icon;
                                        return (
                                            <option key={vehicle.value} value={vehicle.value}>
                                                {vehicle.label} (Max: {vehicle.seats} seats)
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Total Seats */}
                            <div>
                                <label htmlFor="totalSeats" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <FaChair className="mr-2" />
                                    Total Seats (including you)
                                </label>
                                <input
                                    type="number"
                                    id="totalSeats"
                                    name="totalSeats"
                                    required
                                    min="1"
                                    max="10"
                                    value={formData.totalSeats}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="3"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    You will be automatically added as the first ride-mate
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Date */}
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <FaCalendarAlt className="mr-2" />
                                    Date
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    required
                                    min={today}
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Time */}
                            <div>
                                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <FaClock className="mr-2" />
                                    Time
                                </label>
                                <input
                                    type="time"
                                    id="time"
                                    name="time"
                                    required
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <FaFileAlt className="mr-2" />
                                Additional Details (Optional)
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Add pickup location, special requirements, or any other details..."
                            />
                        </div>

                        {/* Terms */}
                        <div className="flex items-start">
                            <input
                                id="agree-terms"
                                name="agree-terms"
                                type="checkbox"
                                required
                                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded mt-1"
                            />
                            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                                I agree to share the ride fairly and split the fare equally with my ride-mates. 
                                I understand that RideMate is a platform for connecting students to share rides, 
                                and I will maintain appropriate behavior and coordinate with my ride-mates.
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white mr-2"></div>
                                        <span>Posting Ride...</span>
                                    </div>
                                ) : (
                                    <span>Share Ride</span>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/live-rides')}
                                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tips Section */}
                <div className="mt-6 sm:mt-8 bg-blue-50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3">
                        💡 Tips for Great Ride-Sharing
                    </h3>
                    <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-blue-800">
                        <li>• Be clear about pickup and drop-off locations</li>
                        <li>• Arrive on time and coordinate with your ride-mates</li>
                        <li>• Share contact details with your ride-mates before the trip</li>
                        <li>• Discuss and agree on fare sharing with your ride-mates</li>
                        <li>• You can edit or cancel your ride anytime</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CreateRide;
