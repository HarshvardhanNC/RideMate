// RideMate - Main JavaScript File

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const closeSignupModal = document.getElementById('closeSignupModal');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Modal Management
function showModal(modal) {
    modal.classList.remove('hidden');
    modal.classList.add('modal-enter');
    document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
    modal.classList.add('modal-exit');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('modal-exit');
        document.body.style.overflow = 'auto';
    }, 300);
}

// Event Listeners for Modals
if (loginBtn) {
    loginBtn.addEventListener('click', () => showModal(loginModal));
}

if (signupBtn) {
    signupBtn.addEventListener('click', () => showModal(signupModal));
}

if (closeLoginModal) {
    closeLoginModal.addEventListener('click', () => hideModal(loginModal));
}

if (closeSignupModal) {
    closeSignupModal.addEventListener('click', () => hideModal(signupModal));
}

if (switchToSignup) {
    switchToSignup.addEventListener('click', () => {
        hideModal(loginModal);
        setTimeout(() => showModal(signupModal), 300);
    });
}

if (switchToLogin) {
    switchToLogin.addEventListener('click', () => {
        hideModal(signupModal);
        setTimeout(() => showModal(loginModal), 300);
    });
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        hideModal(loginModal);
    }
    if (e.target === signupModal) {
        hideModal(signupModal);
    }
});

// Form Handling
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
}

function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const email = formData.get('email') || loginForm.querySelector('input[type="email"]').value;
    const password = formData.get('password') || loginForm.querySelector('input[type="password"]').value;
    
    // TODO: Implement actual login logic
    console.log('Login attempt:', { email, password });
    showNotification('Login functionality will be implemented in the next phase!', 'info');
    
    // Simulate login success
    setTimeout(() => {
        hideModal(loginModal);
        showNotification('Welcome to RideMate!', 'success');
        // TODO: Redirect to dashboard or update UI
    }, 1000);
}

function handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(signupForm);
    const name = formData.get('name') || signupForm.querySelector('input[type="text"]').value;
    const email = formData.get('email') || signupForm.querySelector('input[type="email"]').value;
    const phone = formData.get('phone') || signupForm.querySelector('input[type="tel"]').value;
    const password = formData.get('password') || signupForm.querySelector('input[type="password"]').value;
    
    // TODO: Implement actual signup logic
    console.log('Signup attempt:', { name, email, phone, password });
    showNotification('Signup functionality will be implemented in the next phase!', 'info');
    
    // Simulate signup success
    setTimeout(() => {
        hideModal(signupModal);
        showNotification('Account created successfully! Welcome to RideMate!', 'success');
        // TODO: Redirect to dashboard or update UI
    }, 1000);
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} fade-in`;
    notification.innerHTML = `
        <div class="flex items-center">
            <div class="flex-shrink-0">
                ${getNotificationIcon(type)}
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">${message}</p>
            </div>
            <div class="ml-auto pl-3">
                <button class="text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <span class="sr-only">Close</span>
                    <i class="fas fa-times h-5 w-5"></i>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return '<i class="fas fa-check-circle h-5 w-5 text-green-400"></i>';
        case 'error':
            return '<i class="fas fa-exclamation-circle h-5 w-5 text-red-400"></i>';
        case 'warning':
            return '<i class="fas fa-exclamation-triangle h-5 w-5 text-yellow-400"></i>';
        default:
            return '<i class="fas fa-info-circle h-5 w-5 text-blue-400"></i>';
    }
}

// Utility Functions
function formatTime(timeString) {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
    });
}

function getRideStatus(joinedCount, totalSeats) {
    const percentage = (joinedCount / totalSeats) * 100;
    if (percentage <= 33) return { status: 'green', text: 'Available' };
    if (percentage <= 66) return { status: 'yellow', text: 'Filling Up' };
    return { status: 'red', text: 'Almost Full' };
}

// Local Storage Management
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    },
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚗 RideMate initialized!');
    
    // Add fade-in animation to main content
    const mainContent = document.querySelector('main') || document.body;
    mainContent.classList.add('fade-in');
    
    // Check if user is logged in (for future implementation)
    const user = storage.get('user');
    if (user) {
        console.log('User logged in:', user.name);
        // TODO: Update UI for logged-in user
    }
});

// Export functions for use in other scripts
window.RideMate = {
    showNotification,
    formatTime,
    formatDate,
    getRideStatus,
    storage
}; 