import { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/helpers.js';
import { showNotification as showNotif } from '../utils/notifications.js';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on app start
        const savedUser = storage.get('user');
        if (savedUser) {
            setUser(savedUser);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // TODO: Implement actual login logic with backend
            console.log('Login attempt:', { email, password });
            showNotif('Login functionality will be implemented in the next phase!', 'info');
            
            // Simulate login success
            const mockUser = {
                id: '1',
                name: 'John Doe',
                email: email,
                phone: '+1234567890'
            };
            
            setUser(mockUser);
            storage.set('user', mockUser);
            showNotif('Welcome to RideMate!', 'success');
            
            return { success: true };
        } catch (error) {
            showNotif('Login failed. Please try again.', 'error');
            return { success: false, error: error.message };
        }
    };

    const signup = async (name, email, phone, password) => {
        try {
            // TODO: Implement actual signup logic with backend
            console.log('Signup attempt:', { name, email, phone, password });
            showNotif('Signup functionality will be implemented in the next phase!', 'info');
            
            // Simulate signup success
            const mockUser = {
                id: '1',
                name: name,
                email: email,
                phone: phone
            };
            
            setUser(mockUser);
            storage.set('user', mockUser);
            showNotif('Account created successfully! Welcome to RideMate!', 'success');
            
            return { success: true };
        } catch (error) {
            showNotif('Signup failed. Please try again.', 'error');
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        setUser(null);
        storage.remove('user');
        showNotif('Logged out successfully', 'info');
    };

    const value = {
        user,
        login,
        signup,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
