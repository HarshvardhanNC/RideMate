import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { showNotification } from '../utils/notifications';
import apiService from '../services/api.js';

// Create the RidesContext - this will hold all ride-related state globally
const RidesContext = createContext();

// Custom hook to use the RidesContext - provides easy access to rides data and functions
export const useRides = () => {
    const context = useContext(RidesContext);
    if (!context) {
        throw new Error('useRides must be used within a RidesProvider');
    }
    return context;
};

// RidesProvider component - wraps the app and provides global ride state management
export const RidesProvider = ({ children }) => {
    // Global state for all rides in the system
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Get current user from AuthContext
    const { user } = useAuth();

    // Load rides from API when component mounts
    useEffect(() => {
        loadRidesFromAPI();
    }, []);

    // Function to load rides from API
    const loadRidesFromAPI = async () => {
        try {
            setLoading(true);
            console.log('🔄 Loading rides from API...');
            const response = await apiService.getRides();
            console.log('📦 API Response:', response);
            
            if (response && response.success) {
                console.log('✅ Rides loaded successfully:', response.data?.length || 0, 'rides');
                setRides(response.data || []);
            } else if (response && response.data) {
                // Handle case where success field might be missing
                console.log('✅ Rides loaded (no success field):', response.data?.length || 0, 'rides');
                setRides(response.data || []);
            } else {
                console.warn('⚠️ API returned unsuccessful response, using localStorage fallback');
                // Fallback to localStorage if API fails
                const storedRides = JSON.parse(localStorage.getItem('rides') || '[]');
                setRides(storedRides);
            }
        } catch (error) {
            console.error('❌ Error loading rides from API:', error);
            console.log('🔄 Attempting localStorage fallback...');
            // Fallback to localStorage
            try {
                const storedRides = JSON.parse(localStorage.getItem('rides') || '[]');
                console.log('📦 Loaded from localStorage:', storedRides.length, 'rides');
                setRides(storedRides);
            } catch (storageError) {
                console.error('❌ Error loading from localStorage:', storageError);
                setRides([]);
            }
        } finally {
            setLoading(false);
            console.log('✅ Loading complete');
        }
    };

    // Function to save rides to localStorage - ensures data persistence
    const saveRidesToStorage = (updatedRides) => {
        try {
            localStorage.setItem('rides', JSON.stringify(updatedRides));
        } catch (error) {
            console.error('Error saving rides to storage:', error);
        }
    };

    // Fallback function to load rides from localStorage
    const loadRidesFromStorage = () => {
        try {
            const storedRides = JSON.parse(localStorage.getItem('rides') || '[]');
            setRides(storedRides);
            return storedRides;
        } catch (error) {
            console.error('Error loading rides from storage:', error);
            setRides([]);
            return [];
        }
    };

    // Create a new ride - handles ride creation and updates global state
    const createRide = async (rideData) => {
        if (!user) {
            showNotification('Please login to post a ride', 'warning');
            return { success: false, error: 'User not authenticated' };
        }

        try {
            console.log('🚗 Creating ride with data:', rideData);
            // Try API first
            const response = await apiService.createRide(rideData);
            console.log('📡 Create ride API response:', response);
            
            if (response.success) {
                console.log('✅ Ride created in database:', response.data);
                
                // Reload all rides from database to get fresh data
                await loadRidesFromAPI();
                
                showNotification('Ride posted successfully!', 'success');
                return { success: true, ride: response.data };
            } else {
                console.error('❌ API returned unsuccessful response:', response);
                showNotification(response.message || 'Failed to post ride', 'error');
                return { success: false, error: response.message };
            }
        } catch (error) {
            console.error('❌ Create ride API error:', error);
            
            // Fallback to local storage if API fails
            try {
                const newRide = {
                    id: Date.now().toString(),
                    ...rideData,
                    poster: user.name,
                    posterId: user.id,
                    seatsFilled: 0,
                    passengers: [],
                    status: 'active',
                    createdAt: new Date().toISOString()
                };

                const updatedRides = [newRide, ...rides];
                setRides(updatedRides);
                saveRidesToStorage(updatedRides);
                
                showNotification('Ride posted successfully! (Offline mode)', 'success');
                return { success: true, ride: newRide };
            } catch (fallbackError) {
                console.error('Fallback error:', fallbackError);
                showNotification('Failed to post ride. Please try again.', 'error');
                return { success: false, error: fallbackError.message };
            }
        }
    };

    // Join an existing ride - handles user joining rides and updates seat availability
    const joinRide = async (rideId) => {
        if (!user) {
            showNotification('Please login to join a ride', 'warning');
            return { success: false, error: 'User not authenticated' };
        }

        try {
            console.log('👥 Joining ride:', rideId);
            // Try API first
            const response = await apiService.joinRide(rideId);
            console.log('📡 Join ride API response:', response);
            
            if (response && response.success) {
                console.log('✅ Successfully joined ride in database');
                
                // Reload all rides from database to get fresh data
                await loadRidesFromAPI();
                
                showNotification('Successfully joined the ride!', 'success');
                return { success: true, ride: response.data };
            }
        } catch (error) {
            console.error('❌ Join ride API error:', error);
        }
        
        // Fallback to local update if API fails
        try {
            const rideIndex = rides.findIndex(ride => ride.id === rideId);
            if (rideIndex === -1) {
                showNotification('Ride not found', 'error');
                return { success: false, error: 'Ride not found' };
            }

            const ride = rides[rideIndex];
            
            // Check if ride is full
            if (ride.joinedCount >= ride.totalSeats) {
                showNotification('This ride is already full', 'warning');
                return { success: false, error: 'Ride is full' };
            }

            // Check if user is already in this ride
            if (ride.joinedBy.includes(user.id)) {
                showNotification('You are already in this ride', 'warning');
                return { success: false, error: 'Already joined' };
            }

            // Update the ride with new user
            const updatedRide = {
                ...ride,
                joinedBy: [...ride.joinedBy, user.id],
                joinedCount: ride.joinedCount + 1
            };

            // Update global state
            const updatedRides = [...rides];
            updatedRides[rideIndex] = updatedRide;
            setRides(updatedRides);
            
            // Save to localStorage
            saveRidesToStorage(updatedRides);
            
            showNotification('Successfully joined the ride!', 'success');
            return { success: true, ride: updatedRide };
        } catch (error) {
            showNotification('Failed to join ride. Please try again.', 'error');
            return { success: false, error: error.message };
        }
    };

    // Remove a user from a ride - handles removing ride-mates from rides
    const removeUserFromRide = async (rideId, userId) => {
        try {
            const rideIndex = rides.findIndex(ride => ride.id === rideId);
            if (rideIndex === -1) {
                showNotification('Ride not found', 'error');
                return { success: false, error: 'Ride not found' };
            }

            const ride = rides[rideIndex];
            
            // Update the ride by removing the user
            const updatedRide = {
                ...ride,
                joinedBy: ride.joinedBy.filter(id => id !== userId),
                joinedCount: ride.joinedCount - 1
            };

            // Update global state
            const updatedRides = [...rides];
            updatedRides[rideIndex] = updatedRide;
            setRides(updatedRides);
            
            // Save to localStorage
            saveRidesToStorage(updatedRides);
            
            showNotification('Ride-mate removed from ride', 'success');
            return { success: true, ride: updatedRide };
        } catch (error) {
            showNotification('Failed to remove user. Please try again.', 'error');
            return { success: false, error: error.message };
        }
    };

    // Delete a ride - handles removing rides completely
    const deleteRide = async (rideId) => {
        try {
            console.log('🗑️ Deleting ride:', rideId);
            // Try API first
            const response = await apiService.deleteRide(rideId);
            console.log('📡 Delete ride API response:', response);
            
            if (response && response.success) {
                console.log('✅ Ride deleted from database');
                
                // Reload all rides from database to get fresh data
                await loadRidesFromAPI();
                
                showNotification('Ride deleted successfully', 'success');
                return { success: true };
            }
        } catch (error) {
            console.error('❌ Delete ride API error:', error);
        }
        
        // Fallback to local delete if API fails
        try {
            const updatedRides = rides.filter(ride => (ride._id || ride.id) !== rideId);
            setRides(updatedRides);
            
            // Save to localStorage
            saveRidesToStorage(updatedRides);
            
            showNotification('Ride deleted successfully (offline)', 'success');
            return { success: true };
        } catch (error) {
            showNotification('Failed to delete ride. Please try again.', 'error');
            return { success: false, error: error.message };
        }
    };

    // Get rides posted by current user - filters rides for "My Rides" page
    const getPostedRides = () => {
        if (!user) return [];
        return rides.filter(ride => {
            // Handle both MongoDB format (poster._id) and local storage format (posterId)
            const posterId = ride?.poster?._id || ride?.posterId;
            return posterId === user.id;
        });
    };

    // Get rides joined by current user - filters rides for "Joined Rides" page
    const getJoinedRides = () => {
        if (!user) return [];
        return rides.filter(ride => 
            ride?.passengers?.some(passenger => 
                passenger?.user?._id === user.id || passenger?.user === user.id
            ) && 
            (ride?.poster?._id !== user.id && ride?.poster !== user.id)
        );
    };

    // Get all active rides - for "Live Rides" page
    const getActiveRides = () => {
        return rides.filter(ride => ride?.status === 'active');
    };

    // Filter rides by search criteria - handles search functionality
    const filterRides = (rides, searchFrom, searchTo, filter) => {
        return rides.filter(ride => {
            // Filter by search criteria
            if (searchFrom && !ride?.from?.toLowerCase().includes(searchFrom.toLowerCase())) {
                return false;
            }
            if (searchTo && !ride?.to?.toLowerCase().includes(searchTo.toLowerCase())) {
                return false;
            }
            
            // Filter by availability
            if (filter === 'available') {
                return (ride?.joinedCount || 0) < (ride?.totalSeats || 0);
            }
            
            return true;
        });
    };

    // Context value object - contains all state and functions that components can use
    const value = {
        // State
        rides,
        loading,
        
        // Actions
        createRide,
        joinRide,
        removeUserFromRide,
        deleteRide,
        
        // Getters
        getPostedRides,
        getJoinedRides,
        getActiveRides,
        filterRides,
        
        // Utility
        loadRidesFromAPI,
        loadRidesFromStorage
    };

    return (
        <RidesContext.Provider value={value}>
            {children}
        </RidesContext.Provider>
    );
};
