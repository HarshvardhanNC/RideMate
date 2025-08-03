// RideMate - My Rides Dashboard JavaScript

// Mock data for user's rides (will be replaced with localStorage/API later)
let userRides = {
    posted: [
        {
            id: 1,
            from: 'college',
            to: 'chembur',
            time: '2024-01-15T08:00:00',
            vehicleType: 'Car',
            seats: 4,
            joinedBy: ['user1', 'user3'],
            price: 50,
            createdAt: '2024-01-14T10:00:00',
            status: 'active'
        },
        {
            id: 2,
            from: 'college',
            to: 'kurla',
            time: '2024-01-16T09:30:00',
            vehicleType: 'Auto',
            seats: 3,
            joinedBy: ['user5'],
            price: 40,
            createdAt: '2024-01-14T11:00:00',
            status: 'active'
        }
    ],
    joined: [
        {
            id: 3,
            from: 'dadar',
            to: 'college',
            time: '2024-01-15T07:45:00',
            vehicleType: 'Car',
            seats: 5,
            joinedBy: ['currentUser', 'user5'],
            postedBy: 'user6',
            posterName: 'Rahul Kumar',
            posterPhone: '+91 98765 43212',
            price: 60,
            createdAt: '2024-01-14T09:30:00',
            status: 'active'
        }
    ],
    history: [
        {
            id: 4,
            from: 'bandra',
            to: 'college',
            time: '2024-01-10T08:15:00',
            vehicleType: 'Car',
            seats: 4,
            joinedBy: ['currentUser', 'user7', 'user8'],
            postedBy: 'user10',
            posterName: 'Anjali Singh',
            price: 70,
            createdAt: '2024-01-09T12:00:00',
            status: 'completed',
            completedAt: '2024-01-10T09:30:00'
        }
    ]
};

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
const postedTab = document.getElementById('postedTab');
const joinedTab = document.getElementById('joinedTab');
const historyTab = document.getElementById('historyTab');
const postedRidesSection = document.getElementById('postedRidesSection');
const joinedRidesSection = document.getElementById('joinedRidesSection');
const historySection = document.getElementById('historySection');
const postedRidesContainer = document.getElementById('postedRidesContainer');
const joinedRidesContainer = document.getElementById('joinedRidesContainer');
const historyContainer = document.getElementById('historyContainer');
const postedEmptyState = document.getElementById('postedEmptyState');
const joinedEmptyState = document.getElementById('joinedEmptyState');
const historyEmptyState = document.getElementById('historyEmptyState');
const postedCount = document.getElementById('postedCount');
const joinedCount = document.getElementById('joinedCount');
const totalSaved = document.getElementById('totalSaved');
const historyFilter = document.getElementById('historyFilter');
const editRideModal = document.getElementById('editRideModal');
const closeEditModal = document.getElementById('closeEditModal');
const editRideForm = document.getElementById('editRideForm');
const cancelEdit = document.getElementById('cancelEdit');
const deleteModal = document.getElementById('deleteModal');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete = document.getElementById('cancelDelete');

// Current state
let currentTab = 'posted';
let selectedRideForEdit = null;
let selectedRideForDelete = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    postedTab.addEventListener('click', () => switchTab('posted'));
    joinedTab.addEventListener('click', () => switchTab('joined'));
    historyTab.addEventListener('click', () => switchTab('history'));
    
    // Modal controls
    closeEditModal.addEventListener('click', hideEditModal);
    cancelEdit.addEventListener('click', hideEditModal);
    confirmDelete.addEventListener('click', handleDeleteRide);
    cancelDelete.addEventListener('click', hideDeleteModal);
    
    // Form submission
    editRideForm.addEventListener('submit', handleEditRide);
    
    // History filter
    historyFilter.addEventListener('change', filterHistory);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editRideModal) hideEditModal();
        if (e.target === deleteModal) hideDeleteModal();
    });
}

// Load dashboard data
function loadDashboard() {
    updateStats();
    loadPostedRides();
    loadJoinedRides();
    loadRideHistory();
}

// Update dashboard statistics
function updateStats() {
    postedCount.textContent = userRides.posted.length;
    joinedCount.textContent = userRides.joined.length;
    
    // Calculate total saved (from completed rides)
    const totalSavedAmount = userRides.history.reduce((total, ride) => {
        return total + ride.price;
    }, 0);
    totalSaved.textContent = totalSavedAmount;
}

// Switch between tabs
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    [postedTab, joinedTab, historyTab].forEach(tab => {
        tab.classList.remove('active', 'border-primary', 'text-primary');
        tab.classList.add('border-transparent', 'text-gray-500');
    });
    
    // Hide all sections
    [postedRidesSection, joinedRidesSection, historySection].forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section and update tab
    switch (tabName) {
        case 'posted':
            postedTab.classList.add('active', 'border-primary', 'text-primary');
            postedRidesSection.classList.remove('hidden');
            break;
        case 'joined':
            joinedTab.classList.add('active', 'border-primary', 'text-primary');
            joinedRidesSection.classList.remove('hidden');
            break;
        case 'history':
            historyTab.classList.add('active', 'border-primary', 'text-primary');
            historySection.classList.remove('hidden');
            break;
    }
}

// Load posted rides
function loadPostedRides() {
    if (userRides.posted.length === 0) {
        postedEmptyState.classList.remove('hidden');
        postedRidesContainer.classList.add('hidden');
        return;
    }
    
    postedEmptyState.classList.add('hidden');
    postedRidesContainer.classList.remove('hidden');
    postedRidesContainer.innerHTML = '';
    
    userRides.posted.forEach(ride => {
        const rideCard = createPostedRideCard(ride);
        postedRidesContainer.appendChild(rideCard);
    });
}

// Create posted ride card
function createPostedRideCard(ride) {
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
                <span class="text-gray-600">Filled Seats:</span>
                <span class="font-medium">${ride.joinedBy.length}/${ride.seats}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Price:</span>
                <span class="font-medium">₹${ride.price}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Revenue:</span>
                <span class="font-medium">₹${ride.price * ride.joinedBy.length}</span>
            </div>
        </div>
        
        <div class="space-y-3">
            <div class="flex space-x-2">
                <button class="btn-outline flex-1 edit-ride-btn" data-ride-id="${ride.id}">
                    Edit
                </button>
                <button class="btn-outline flex-1 view-participants-btn" data-ride-id="${ride.id}">
                    Participants
                </button>
            </div>
            <div class="flex space-x-2">
                <button class="btn-outline flex-1 cancel-ride-btn" data-ride-id="${ride.id}">
                    Cancel
                </button>
                <button class="btn-danger flex-1 delete-ride-btn" data-ride-id="${ride.id}">
                    Delete
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const editBtn = card.querySelector('.edit-ride-btn');
    const participantsBtn = card.querySelector('.view-participants-btn');
    const cancelBtn = card.querySelector('.cancel-ride-btn');
    const deleteBtn = card.querySelector('.delete-ride-btn');
    
    editBtn.addEventListener('click', () => showEditModal(ride));
    participantsBtn.addEventListener('click', () => showParticipants(ride));
    cancelBtn.addEventListener('click', () => cancelRide(ride));
    deleteBtn.addEventListener('click', () => showDeleteModal(ride));
    
    return card;
}

// Load joined rides
function loadJoinedRides() {
    if (userRides.joined.length === 0) {
        joinedEmptyState.classList.remove('hidden');
        joinedRidesContainer.classList.add('hidden');
        return;
    }
    
    joinedEmptyState.classList.add('hidden');
    joinedRidesContainer.classList.remove('hidden');
    joinedRidesContainer.innerHTML = '';
    
    userRides.joined.forEach(ride => {
        const rideCard = createJoinedRideCard(ride);
        joinedRidesContainer.appendChild(rideCard);
    });
}

// Create joined ride card
function createJoinedRideCard(ride) {
    const card = document.createElement('div');
    card.className = 'ride-card';
    
    card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-lg font-semibold text-gray-900">${locationNames[ride.from]} → ${locationNames[ride.to]}</h3>
                <p class="text-sm text-gray-600">${formatTime(ride.time)} • ${formatDate(ride.time)}</p>
            </div>
            <span class="status-green">Joined</span>
        </div>
        
        <div class="space-y-3 mb-4">
            <div class="flex justify-between">
                <span class="text-gray-600">Driver:</span>
                <span class="font-medium">${ride.posterName}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Vehicle:</span>
                <span class="font-medium">${ride.vehicleType}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Price:</span>
                <span class="font-medium">₹${ride.price}</span>
            </div>
        </div>
        
        <div class="space-y-3">
            <a href="https://wa.me/91${ride.posterPhone.replace(/\D/g, '')}" 
               class="btn-secondary flex-1 text-center block">
                <i class="fab fa-whatsapp mr-2"></i>Contact Driver
            </a>
            <button class="btn-outline flex-1 leave-ride-btn" data-ride-id="${ride.id}">
                Leave Ride
            </button>
        </div>
    `;
    
    // Add event listener
    const leaveBtn = card.querySelector('.leave-ride-btn');
    leaveBtn.addEventListener('click', () => leaveRide(ride));
    
    return card;
}

// Load ride history
function loadRideHistory() {
    if (userRides.history.length === 0) {
        historyEmptyState.classList.remove('hidden');
        historyContainer.classList.add('hidden');
        return;
    }
    
    historyEmptyState.classList.add('hidden');
    historyContainer.classList.remove('hidden');
    historyContainer.innerHTML = '';
    
    userRides.history.forEach(ride => {
        const historyItem = createHistoryItem(ride);
        historyContainer.appendChild(historyItem);
    });
}

// Create history item
function createHistoryItem(ride) {
    const item = document.createElement('div');
    item.className = 'bg-white rounded-lg shadow-md p-6';
    
    const isPosted = ride.postedBy === 'currentUser';
    
    item.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                    <h3 class="text-lg font-semibold text-gray-900">${locationNames[ride.from]} → ${locationNames[ride.to]}</h3>
                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        ${isPosted ? 'Posted' : 'Joined'}
                    </span>
                </div>
                <p class="text-sm text-gray-600 mb-3">${formatTime(ride.time)} • ${formatDate(ride.time)}</p>
                <div class="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <span class="text-gray-600">Vehicle:</span>
                        <p class="font-medium">${ride.vehicleType}</p>
                    </div>
                    <div>
                        <span class="text-gray-600">Price:</span>
                        <p class="font-medium">₹${ride.price}</p>
                    </div>
                    <div>
                        <span class="text-gray-600">Status:</span>
                        <p class="font-medium text-green-600">Completed</p>
                    </div>
                </div>
            </div>
            <div class="text-right">
                <div class="text-2xl mb-1 text-yellow-400"><i class="fas fa-star"></i></div>
                <button class="text-sm text-primary hover:underline"><i class="fas fa-star mr-1"></i>Rate Ride</button>
            </div>
        </div>
    `;
    
    return item;
}

// Show edit modal
function showEditModal(ride) {
    selectedRideForEdit = ride;
    
    // Populate form fields
    document.getElementById('editFromLocation').value = ride.from;
    document.getElementById('editToLocation').value = ride.to;
    document.getElementById('editRideDate').value = ride.time.split('T')[0];
    document.getElementById('editRideTime').value = ride.time.split('T')[1].substring(0, 5);
    document.getElementById('editVehicleType').value = ride.vehicleType;
    document.getElementById('editTotalSeats').value = ride.seats;
    document.getElementById('editPricePerSeat').value = ride.price;
    
    editRideModal.classList.remove('hidden');
    editRideModal.classList.add('modal-enter');
    document.body.style.overflow = 'hidden';
}

// Hide edit modal
function hideEditModal() {
    editRideModal.classList.add('modal-exit');
    setTimeout(() => {
        editRideModal.classList.add('hidden');
        editRideModal.classList.remove('modal-exit');
        document.body.style.overflow = 'auto';
        selectedRideForEdit = null;
    }, 300);
}

// Handle edit ride
function handleEditRide(e) {
    e.preventDefault();
    
    if (!selectedRideForEdit) return;
    
    // Get form data
    const formData = new FormData(editRideForm);
    const updatedRide = {
        ...selectedRideForEdit,
        from: formData.get('editFromLocation'),
        to: formData.get('editToLocation'),
        time: `${formData.get('editRideDate')}T${formData.get('editRideTime')}:00`,
        vehicleType: formData.get('editVehicleType'),
        seats: parseInt(formData.get('editTotalSeats')),
        price: parseInt(formData.get('editPricePerSeat'))
    };
    
    // Update ride in data
    const rideIndex = userRides.posted.findIndex(r => r.id === selectedRideForEdit.id);
    if (rideIndex !== -1) {
        userRides.posted[rideIndex] = updatedRide;
    }
    
    hideEditModal();
    showNotification('Ride updated successfully!', 'success');
    loadPostedRides();
}

// Show delete modal
function showDeleteModal(ride) {
    selectedRideForDelete = ride;
    deleteModal.classList.remove('hidden');
    deleteModal.classList.add('modal-enter');
    document.body.style.overflow = 'hidden';
}

// Hide delete modal
function hideDeleteModal() {
    deleteModal.classList.add('modal-exit');
    setTimeout(() => {
        deleteModal.classList.add('hidden');
        deleteModal.classList.remove('modal-exit');
        document.body.style.overflow = 'auto';
        selectedRideForDelete = null;
    }, 300);
}

// Handle delete ride
function handleDeleteRide() {
    if (!selectedRideForDelete) return;
    
    // Remove ride from data
    userRides.posted = userRides.posted.filter(r => r.id !== selectedRideForDelete.id);
    
    hideDeleteModal();
    showNotification('Ride deleted successfully!', 'success');
    loadDashboard();
}

// Show participants
function showParticipants(ride) {
    const participantCount = ride.joinedBy.length;
    showNotification(`${participantCount} participant${participantCount !== 1 ? 's' : ''} joined your ride`, 'info');
}

// Cancel ride
function cancelRide(ride) {
    if (confirm('Are you sure you want to cancel this ride? All participants will be notified.')) {
        // Move to history
        const cancelledRide = { ...ride, status: 'cancelled' };
        userRides.history.push(cancelledRide);
        userRides.posted = userRides.posted.filter(r => r.id !== ride.id);
        
        showNotification('Ride cancelled successfully!', 'success');
        loadDashboard();
    }
}

// Leave ride
function leaveRide(ride) {
    if (confirm('Are you sure you want to leave this ride?')) {
        userRides.joined = userRides.joined.filter(r => r.id !== ride.id);
        showNotification('You have left the ride', 'info');
        loadDashboard();
    }
}

// Filter history
function filterHistory() {
    const filter = historyFilter.value;
    const historyItems = historyContainer.querySelectorAll('.bg-white');
    
    historyItems.forEach(item => {
        const type = item.querySelector('.bg-green-100').textContent.toLowerCase();
        if (filter === 'all' || type === filter) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Export functions for use in other scripts
window.RideMateMyRides = {
    loadDashboard,
    switchTab,
    showEditModal,
    showDeleteModal
}; 