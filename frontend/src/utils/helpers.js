// Utility functions for RideMate

export const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    // If timeString is already in HH:MM format, parse it
    if (typeof timeString === 'string' && timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const min = parseInt(minutes, 10);
        
        // Convert to 12-hour format
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        
        return `${hour12}:${min.toString().padStart(2, '0')} ${period}`;
    }
    
    // Fallback: try to parse as Date
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
        return timeString; // Return original if invalid
    }
    
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
};

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
    });
};

export const getRideStatus = (joinedCount, totalSeats) => {
    const percentage = (joinedCount / totalSeats) * 100;
    if (percentage <= 33) return { status: 'green', text: 'Available' };
    if (percentage <= 66) return { status: 'yellow', text: 'Filling Up' };
    return { status: 'red', text: 'Almost Full' };
};

// Local Storage Management
export const storage = {
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
