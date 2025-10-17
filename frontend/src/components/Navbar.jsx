import { Link } from 'react-router-dom';
import { FaCar, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <FaCar className="text-2xl text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">RideMate</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Home
                        </Link>
                        <Link to="/live-rides" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Live Rides
                        </Link>
                        {user && (
                            <>
                                <Link to="/create-ride" className="text-gray-700 hover:text-blue-600 transition-colors">
                                    Post Ride
                                </Link>
                                <Link to="/my-rides" className="text-gray-700 hover:text-blue-600 transition-colors">
                                    My Rides
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <FaUser className="text-gray-600" />
                                    <span className="text-sm text-gray-700">{user.name}</span>
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
                                    className="text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/signup" 
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
