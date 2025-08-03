// RideMate - Create Ride JavaScript

// DOM Elements
const createRideForm = document.getElementById('createRideForm');
const previewBtn = document.getElementById('previewBtn');
const previewModal = document.getElementById('previewModal');
const closePreviewModal = document.getElementById('closePreviewModal');
const previewContent = document.getElementById('previewContent');
const confirmCreate = document.getElementById('confirmCreate');
const editRide = document.getElementById('editRide');
const submitText = document.getElementById('submitText');
const submitLoading = document.getElementById('submitLoading');

// Location mapping
const locationNames = {
    'college': 'College Campus',
    'chembur': 'Chembur Station',
    'kurla': 'Kurla Station',
    'dadar': 'Dadar Station',
    'bandra': 'Bandra Station',
    'andheri': 'Andheri Station'
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('rideDate').min = today;
    document.getElementById('rideDate').value = today;
    
    // Add event listeners
    createRideForm.addEventListener('submit', handleFormSubmit);
    previewBtn.addEventListener('click', showPreview);
    closePreviewModal.addEventListener('click', hidePreview);
    confirmCreate.addEventListener('click', handleFormSubmit);
    editRide.addEventListener('click', hidePreview);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            hidePreview();
        }
    });
    
    // Add form validation
    addFormValidation();
});

// Add form validation
function addFormValidation() {
    const form = createRideForm;
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    // Special validation for phone number
    const phoneInput = document.getElementById('contactPhone');
    phoneInput.addEventListener('input', validatePhone);
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove existing error
    clearFieldError(field);
    
    // Check required fields
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Specific validations
    switch (field.name) {
        case 'fromLocation':
        case 'toLocation':
            if (value && document.getElementById('fromLocation').value === document.getElementById('toLocation').value) {
                showFieldError(field, 'From and To locations cannot be the same');
                return false;
            }
            break;
            
        case 'rideDate':
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                showFieldError(field, 'Date cannot be in the past');
                return false;
            }
            break;
            
        case 'rideTime':
            if (value) {
                const selectedTime = new Date(`2000-01-01T${value}`);
                const minTime = new Date('2000-01-01T05:00:00');
                const maxTime = new Date('2000-01-01T23:00:00');
                
                if (selectedTime < minTime || selectedTime > maxTime) {
                    showFieldError(field, 'Time must be between 5:00 AM and 11:00 PM');
                    return false;
                }
            }
            break;
            
        case 'totalSeats':
            const seats = parseInt(value);
            if (seats < 1 || seats > 10) {
                showFieldError(field, 'Seats must be between 1 and 10');
                return false;
            }
            break;
            
        case 'pricePerSeat':
            const price = parseInt(value);
            if (price < 10 || price > 500) {
                showFieldError(field, 'Price must be between ₹10 and ₹500');
                return false;
            }
            break;
            
        case 'contactPhone':
            if (value && !isValidPhone(value)) {
                showFieldError(field, 'Please enter a valid phone number');
                return false;
            }
            break;
    }
    
    return true;
}

// Validate phone number
function validatePhone(e) {
    const field = e.target;
    const value = field.value;
    
    // Format phone number as user types
    const formatted = formatPhoneNumber(value);
    if (formatted !== value) {
        field.value = formatted;
    }
}

// Format phone number
function formatPhoneNumber(value) {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as +91 XXXXX XXXXX
    if (digits.length <= 2) {
        return digits;
    } else if (digits.length <= 7) {
        return `+91 ${digits.slice(2, 7)}`;
    } else {
        return `+91 ${digits.slice(2, 7)} ${digits.slice(7, 12)}`;
    }
}

// Check if phone number is valid
function isValidPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 12 && digits.startsWith('91');
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('border-red-500');
    field.classList.remove('border-gray-300');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    errorDiv.id = `${field.id}-error`;
    
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(field) {
    const targetField = field.target || field;
    
    targetField.classList.remove('border-red-500');
    targetField.classList.add('border-gray-300');
    
    const errorDiv = targetField.parentNode.querySelector(`#${targetField.id}-error`);
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Validate entire form
function validateForm() {
    const form = createRideForm;
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Show preview modal
function showPreview() {
    if (!validateForm()) {
        showNotification('Please fix the errors in the form before previewing', 'error');
        return;
    }
    
    const formData = new FormData(createRideForm);
    const rideData = Object.fromEntries(formData.entries());
    
    // Get checkbox values
    rideData.noSmoking = document.getElementById('noSmoking').checked;
    rideData.noMusic = document.getElementById('noMusic').checked;
    rideData.studentsOnly = document.getElementById('studentsOnly').checked;
    rideData.punctual = document.getElementById('punctual').checked;
    
    generatePreview(rideData);
    showPreviewModal();
}

// Generate preview content
function generatePreview(rideData) {
    const rules = [];
    if (rideData.noSmoking) rules.push('No smoking');
    if (rideData.noMusic) rules.push('No loud music');
    if (rideData.studentsOnly) rules.push('Students only');
    if (rideData.punctual) rules.push('Punctuality required');
    
    previewContent.innerHTML = `
        <div class="space-y-6">
            <!-- Route Information -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-lg mb-3">Route Information</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="text-gray-600">From:</span>
                        <p class="font-medium">${locationNames[rideData.fromLocation] || 'Not specified'}</p>
                    </div>
                    <div>
                        <span class="text-gray-600">To:</span>
                        <p class="font-medium">${locationNames[rideData.toLocation] || 'Not specified'}</p>
                    </div>
                </div>
            </div>
            
            <!-- Date & Time -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-lg mb-3">Date & Time</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="text-gray-600">Date:</span>
                        <p class="font-medium">${formatDate(rideData.rideDate)}</p>
                    </div>
                    <div>
                        <span class="text-gray-600">Time:</span>
                        <p class="font-medium">${formatTime(rideData.rideTime)}</p>
                    </div>
                </div>
            </div>
            
            <!-- Vehicle Information -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-lg mb-3">Vehicle Information</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="text-gray-600">Vehicle Type:</span>
                        <p class="font-medium">${rideData.vehicleType}</p>
                    </div>
                    <div>
                        <span class="text-gray-600">Total Seats:</span>
                        <p class="font-medium">${rideData.totalSeats}</p>
                    </div>
                </div>
                ${rideData.vehicleDetails ? `
                    <div class="mt-3">
                        <span class="text-gray-600">Vehicle Details:</span>
                        <p class="font-medium">${rideData.vehicleDetails}</p>
                    </div>
                ` : ''}
            </div>
            
            <!-- Pricing -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-lg mb-3">Pricing</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="text-gray-600">Price per Seat:</span>
                        <p class="font-medium">₹${rideData.pricePerSeat}</p>
                    </div>
                    <div>
                        <span class="text-gray-600">Payment Method:</span>
                        <p class="font-medium">${rideData.paymentMethod}</p>
                    </div>
                </div>
            </div>
            
            <!-- Additional Information -->
            ${(rideData.pickupPoint || rideData.dropPoint || rideData.description) ? `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-lg mb-3">Additional Information</h3>
                    ${rideData.pickupPoint ? `
                        <div class="mb-2">
                            <span class="text-gray-600">Pickup Point:</span>
                            <p class="font-medium">${rideData.pickupPoint}</p>
                        </div>
                    ` : ''}
                    ${rideData.dropPoint ? `
                        <div class="mb-2">
                            <span class="text-gray-600">Drop Point:</span>
                            <p class="font-medium">${rideData.dropPoint}</p>
                        </div>
                    ` : ''}
                    ${rideData.description ? `
                        <div>
                            <span class="text-gray-600">Description:</span>
                            <p class="font-medium">${rideData.description}</p>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
            
            <!-- Rules & Preferences -->
            ${rules.length > 0 ? `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-lg mb-3">Rules & Preferences</h3>
                    <ul class="list-disc list-inside space-y-1">
                        ${rules.map(rule => `<li class="text-gray-700">${rule}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <!-- Contact Information -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-lg mb-3">Contact Information</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="text-gray-600">Contact Name:</span>
                        <p class="font-medium">${rideData.contactName}</p>
                    </div>
                    <div>
                        <span class="text-gray-600">Contact Phone:</span>
                        <p class="font-medium">${rideData.contactPhone}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Show preview modal
function showPreviewModal() {
    previewModal.classList.remove('hidden');
    previewModal.classList.add('modal-enter');
    document.body.style.overflow = 'hidden';
}

// Hide preview modal
function hidePreview() {
    previewModal.classList.add('modal-exit');
    setTimeout(() => {
        previewModal.classList.add('hidden');
        previewModal.classList.remove('modal-exit');
        document.body.style.overflow = 'auto';
    }, 300);
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showNotification('Please fix the errors in the form', 'error');
        return;
    }
    
    // Show loading state
    submitText.classList.add('hidden');
    submitLoading.classList.remove('hidden');
    
    const formData = new FormData(createRideForm);
    const rideData = Object.fromEntries(formData.entries());
    
    // Get checkbox values
    rideData.noSmoking = document.getElementById('noSmoking').checked;
    rideData.noMusic = document.getElementById('noMusic').checked;
    rideData.studentsOnly = document.getElementById('studentsOnly').checked;
    rideData.punctual = document.getElementById('punctual').checked;
    
    // TODO: Implement actual API call
    console.log('Creating ride:', rideData);
    
    // Simulate API call
    setTimeout(() => {
        // Hide loading state
        submitText.classList.remove('hidden');
        submitLoading.classList.add('hidden');
        
        // Hide preview modal if open
        hidePreview();
        
        // Show success message
        showNotification('Ride created successfully!', 'success');
        
        // Reset form
        createRideForm.reset();
        
        // Set default date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('rideDate').value = today;
        
        // Redirect to live rides after a short delay
        setTimeout(() => {
            window.location.href = 'live-rides.html';
        }, 2000);
    }, 2000);
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
}

// Export functions for use in other scripts
window.RideMateCreate = {
    validateForm,
    showPreview,
    hidePreview
}; 