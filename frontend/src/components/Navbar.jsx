import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaCar, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
                        <FaCar className="text-2xl md:text-2xl text-blue-600" />
                        <span className="text-lg md:text-xl font-bold text-gray-900">RideMate</span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            Home
                        </Link>
                        <Link to="/live-rides" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            Live Rides
                        </Link>
                        {user && (
                            <>
                                <Link to="/create-ride" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                                    Post Ride
                                </Link>
                                <Link to="/my-rides" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                                    My Rides
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Desktop Auth Section */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <FaUser className="text-gray-600" />
                                    <span className="text-sm text-gray-700 max-w-[100px] lg:max-w-none truncate">{user.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                                >
                                    <FaSignOutAlt />
                                    <span className="text-sm">Logout</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link 
                                    to="/login" 
                                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/signup" 
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-gray-700 hover:text-blue-600 focus:outline-none"
                    >
                        {mobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-4 pt-2 pb-4 space-y-3">
                        <Link 
                            to="/" 
                            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                            onClick={closeMobileMenu}
                        >
                            Home
                        </Link>
                        <Link 
                            to="/live-rides" 
                            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                            onClick={closeMobileMenu}
                        >
                            Live Rides
                        </Link>
                        {user && (
                            <>
                                <Link 
                                    to="/create-ride" 
                                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                                    onClick={closeMobileMenu}
                                >
                                    Post Ride
                                </Link>
                                <Link 
                                    to="/my-rides" 
                                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                                    onClick={closeMobileMenu}
                                >
                                    My Rides
                                </Link>
                            </>
                        )}
                        
                        {/* Mobile Auth Section */}
                        <div className="pt-4 border-t border-gray-200">
                            {user ? (
                                <>
                                    <div className="flex items-center space-x-2 px-3 py-2 text-gray-700">
                                        <FaUser className="text-gray-600" />
                                        <span className="text-sm font-medium">{user.name}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 mt-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors font-medium"
                                    >
                                        <FaSignOutAlt />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <Link 
                                        to="/login" 
                                        className="block w-full text-center px-3 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium"
                                        onClick={closeMobileMenu}
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        to="/signup" 
                                        className="block w-full text-center px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors font-medium"
                                        onClick={closeMobileMenu}
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
