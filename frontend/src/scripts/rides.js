// RideMate - Rides Management JavaScript

// Mock data for rides (will be replaced with API calls later)
const mockRides = [
    {
        id: 1,
        from: 'college',
        to: 'chembur',
        time: '2024-01-15T08:00:00',
        vehicleType: 'Car',
        seats: 4,
        joinedBy: ['user1'],
        postedBy: 'user2',
        posterName: 'Harsh Patel',
        posterPhone: '+91 98765 43210',
        price: 50,
        createdAt: '2024-01-14T10:00:00'
    },
    {
        id: 2,
        from: 'college',
        to: 'kurla',
        time: '2024-01-15T09:30:00',
        vehicleType: 'Auto',
        seats: 3,
        joinedBy: ['user1', 'user3'],
        postedBy: 'user4',
        posterName: 'Priya Sharma',
        posterPhone: '+91 98765 43211',
        price: 40,
        createdAt: '2024-01-14T11:00:00'
    },
    {
        id: 3,
        from: 'dadar',
        to: 'college',
        time: '2024-01-15T07:45:00',
        vehicleType: 'Car',
        seats: 5,
        joinedBy: ['user5'],
        postedBy: 'user6',
        posterName: 'Rahul Kumar',
        posterPhone: '+91 98765 43212',
        price: 60,
        createdAt: '2024-01-14T09:30:00'
    },
    {
        id: 4,
        from: 'bandra',
        to: 'college',
        time: '2024-01-15T08:15:00',
        vehicleType: 'Car',
        seats: 4,
        joinedBy: ['user7', 'user8', 'user9'],
        postedBy: 'user10',
        posterName: 'Anjali Singh',
        posterPhone: '+91 98765 43213',
        price: 70,
        createdAt: '2024-01-14T12:00:00'
    },
    {
        id: 5,
        from: 'college',
        to: 'andheri',
        time: '2024-01-15T10:00:00',
        vehicleType: 'Auto',
        seats: 3,
        joinedBy: [],
        postedBy: 'user11',
        posterName: 'Vikram Mehta',
        posterPhone: '+91 98765 43214',
        price: 80,
        createdAt: '2024-01-14T14:00:00'
    }
];

// Location mapping
const locationNames = {
    'college': 'College Campus',
    'chembur': 'Chembur Station',
    'kurla': 'Kurla Station',
    'dadar': 'Dadar Station',
    'bandra': 'Bandra Station',
    'andheri': 'Andheri Station'
};

// DOM Elements
const ridesContainer = document.getElementById('ridesContainer');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const rideCount = document.getElementById('rideCount');
const searchBtn = document.getElementById('searchBtn');
const fromLocation = document.getElementById('fromLocation');
const toLocation = document.getElementById('toLocation');
const rideDate = document.getElementById('rideDate');
const sortBy = document.getElementById('sortBy');
const joinRideModal = document.getElementById('joinRideModal');
const closeJoinModal = document.getElementById('closeJoinModal');
const rideDetails = document.getElementById('rideDetails');
const confirmJoin = document.getElementById('confirmJoin');
const cancelJoin = document.getElementById('cancelJoin');

// Current state
let currentRides = [];
let selectedRide = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    rideDate.value = today;
    
    // Load initial rides
    loadRides();
    
    // Add event listeners
    searchBtn.addEventListener('click', handleSearch);
    sortBy.addEventListener('change', handleSort);
    closeJoinModal.addEventListener('click', hideJoinModal);
    confirmJoin.addEventListener('click', handleJoinRide);
    cancelJoin.addEventListener('click', hideJoinModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === joinRideModal) {
            hideJoinModal();
        }
    });
});

// Load and display rides
function loadRides(filters = {}) {
    showLoading();
    
    // Simulate API call delay
    setTimeout(() => {
        let filteredRides = [...mockRides];
        
        // Apply filters
        if (filters.from) {
            filteredRides = filteredRides.filter(ride => ride.from === filters.from);
        }
        if (filters.to) {
            filteredRides = filteredRides.filter(ride => ride.to === filters.to);
        }
        if (filters.date) {
            const filterDate = new Date(filters.date).toDateString();
            filteredRides = filteredRides.filter(ride => {
                const rideDate = new Date(ride.time).toDateString();
                return rideDate === filterDate;
            });
        }
        
        currentRides = filteredRides;
        displayRides();
        hideLoading();
    }, 500);
}

// Display rides in the container
function displayRides() {
    if (currentRides.length === 0) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    ridesContainer.innerHTML = '';
    
    currentRides.forEach(ride => {
        const rideCard = createRideCard(ride);
        ridesContainer.appendChild(rideCard);
    });
    
    updateRideCount();
}

// Create a ride card element
function createRideCard(ride) {
    const card = document.createElement('div');
    card.className = 'ride-card';
    
    const status = getRideStatus(ride.joinedBy.length, ride.seats);
    const isFull = ride.joinedBy.length >= ride.seats;
    
    card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-lg font-semibold text-gray-900">${locationNames[ride.from]} → ${locationNames[ride.to]}</h3>
                <p class="text-sm text-gray-600">${formatTime(ride.time)} • ${formatDate(ride.time)}</p>
            </div>
            <span class="status-${status.status}">${status.text}</span>
        </div>
        
        <div class="space-y-3 mb-4">
            <div class="flex justify-between">
                <span class="text-gray-600">Vehicle:</span>
                <span class="font-medium">${ride.vehicleType}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Available Seats:</span>
                <span class="font-medium">${ride.seats - ride.joinedBy.length}/${ride.seats}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Price:</span>
                <span class="font-medium">₹${ride.price}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Posted by:</span>
                <span class="font-medium">${ride.posterName}</span>
            </div>
        </div>
        
        <div class="flex space-x-3">
            ${!isFull ? `
                <button class="btn-secondary flex-1 join-ride-btn" data-ride-id="${ride.id}">
                    Join Ride
                </button>
            ` : `
                <button class="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg flex-1 cursor-not-allowed" disabled>
                    Full
                </button>
            `}
            <button class="btn-outline flex-1 view-details-btn" data-ride-id="${ride.id}">
                Details
            </button>
        </div>
    `;
    
    // Add event listeners
    const joinBtn = card.querySelector('.join-ride-btn');
    const detailsBtn = card.querySelector('.view-details-btn');
    
    if (joinBtn) {
        joinBtn.addEventListener('click', () => showJoinModal(ride));
    }
    
    if (detailsBtn) {
        detailsBtn.addEventListener('click', () => showRideDetails(ride));
    }
    
    return card;
}

// Show join ride modal
function showJoinModal(ride) {
    selectedRide = ride;
    const status = getRideStatus(ride.joinedBy.length, ride.seats);
    
    rideDetails.innerHTML = `
        <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-lg mb-2">${locationNames[ride.from]} → ${locationNames[ride.to]}</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="text-gray-600">Time:</span>
                        <p class="font-medium">${formatTime(ride.time)}</p>
                    </div>
                    <div>
                        <span class="text-gray-600">Date:</span>
                        <p class="font-medium">${formatDate(ride.time)}</p>
                    </div>
                    <div>
                        <span class="text-gray-600">Vehicle:</span>
                        <p class="font-medium">${ride.vehicleType}</p>
                    </div>
                    <div>
                        <span class="text-gray-600">Price:</span>
                        <p class="font-medium">₹${ride.price}</p>
                    </div>
                </div>
            </div>
            
            <div class="border-t pt-4">
                <h4 class="font-semibold mb-2">Contact Information</h4>
                <div class="space-y-2">
                    <p><span class="text-gray-600">Driver:</span> ${ride.posterName}</p>
                    <p><span class="text-gray-600">Phone:</span> ${ride.posterPhone}</p>
                    <a href="https://wa.me/91${ride.posterPhone.replace(/\D/g, '')}" 
                       class="inline-flex items-center text-green-600 hover:text-green-700">
                        <i class="fab fa-whatsapp w-4 h-4 mr-1"></i>
                        Chat on WhatsApp
                    </a>
                </div>
            </div>
            
            <div class="bg-blue-50 p-3 rounded-lg">
                <p class="text-sm text-blue-800">
                    <strong>Note:</strong> You'll be able to contact the driver after joining the ride.
                </p>
            </div>
        </div>
    `;
    
    joinRideModal.classList.remove('hidden');
    joinRideModal.classList.add('modal-enter');
    document.body.style.overflow = 'hidden';
}

// Hide join ride modal
function hideJoinModal() {
    joinRideModal.classList.add('modal-exit');
    setTimeout(() => {
        joinRideModal.classList.add('hidden');
        joinRideModal.classList.remove('modal-exit');
        document.body.style.overflow = 'auto';
        selectedRide = null;
    }, 300);
}

// Handle join ride confirmation
function handleJoinRide() {
    if (!selectedRide) return;
    
    // TODO: Implement actual join logic with API
    console.log('Joining ride:', selectedRide.id);
    
    // Simulate API call
    setTimeout(() => {
        hideJoinModal();
        showNotification(`Successfully joined ${selectedRide.posterName}'s ride!`, 'success');
        
        // Update the ride in mock data (in real app, this would come from API)
        const rideIndex = mockRides.findIndex(r => r.id === selectedRide.id);
        if (rideIndex !== -1) {
            mockRides[rideIndex].joinedBy.push('currentUser');
        }
        
        // Refresh the display
        loadRides();
    }, 1000);
}

// Show ride details (for future implementation)
function showRideDetails(ride) {
    // TODO: Navigate to ride details page
    console.log('Showing details for ride:', ride.id);
    showNotification('Ride details page will be implemented in the next phase!', 'info');
}

// Handle search
function handleSearch() {
    const filters = {
        from: fromLocation.value,
        to: toLocation.value,
        date: rideDate.value
    };
    
    loadRides(filters);
}

// Handle sorting
function handleSort() {
    const sortType = sortBy.value;
    
    currentRides.sort((a, b) => {
        switch (sortType) {
            case 'time':
                return new Date(a.time) - new Date(b.time);
            case 'seats':
                return (b.seats - b.joinedBy.length) - (a.seats - a.joinedBy.length);
            case 'price':
                return a.price - b.price;
            default:
                return 0;
        }
    });
    
    displayRides();
}

// Utility functions
function showLoading() {
    loadingState.classList.remove('hidden');
    ridesContainer.classList.add('hidden');
    emptyState.classList.add('hidden');
}

function hideLoading() {
    loadingState.classList.add('hidden');
    ridesContainer.classList.remove('hidden');
}

function showEmptyState() {
    emptyState.classList.remove('hidden');
    ridesContainer.classList.add('hidden');
    rideCount.textContent = '0 rides found';
}

function hideEmptyState() {
    emptyState.classList.add('hidden');
    ridesContainer.classList.remove('hidden');
}

function updateRideCount() {
    rideCount.textContent = `${currentRides.length} ride${currentRides.length !== 1 ? 's' : ''} found`;
}

// Export functions for use in other scripts
window.RideMateRides = {
    loadRides,
    createRideCard,
    showJoinModal,
    hideJoinModal
}; 