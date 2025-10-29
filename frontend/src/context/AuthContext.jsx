import { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/helpers.js';
import { showNotification as showNotif } from '../utils/notifications.js';
import apiService from '../services/api.js';

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
        const savedToken = localStorage.getItem('token');
        
        if (savedUser && savedToken) {
            setUser(savedUser);
            apiService.setToken(savedToken);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await apiService.login({ email, password });
            
            if (response.success && response.token) {
                // Store token
                apiService.setToken(response.token);
                
                // Store user with proper _id field
                const userData = {
                    ...response.user,
                    _id: response.user._id || response.user.id,
                    id: response.user._id || response.user.id
                };
                
                setUser(userData);
                storage.set('user', userData);
                showNotif('Welcome to RideMate!', 'success');
                return { success: true };
            } else {
                showNotif(response.message || 'Login failed', 'error');
                return { success: false, error: response.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotif('Login failed. Please try again.', 'error');
            return { success: false, error: error.message };
        }
    };

    const signup = async (userData) => {
        try {
            const response = await apiService.register(userData);
            
            if (response.success && response.token) {
                // Store token
                apiService.setToken(response.token);
                
                // Store user with proper _id field
                const userDataWithId = {
                    ...response.user,
                    _id: response.user._id || response.user.id,
                    id: response.user._id || response.user.id
                };
                
                setUser(userDataWithId);
                storage.set('user', userDataWithId);
                showNotif('Account created successfully! Welcome to RideMate!', 'success');
                return { success: true };
            } else {
                showNotif(response.message || 'Signup failed', 'error');
                return { success: false, error: response.message };
            }
        } catch (error) {
            console.error('Signup error:', error);
            showNotif('Signup failed. Please try again.', 'error');
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            storage.remove('user');
            localStorage.removeItem('token');
            apiService.removeToken();
            showNotif('Logged out successfully', 'info');
        }
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
