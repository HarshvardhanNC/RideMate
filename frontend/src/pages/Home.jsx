import { Link } from 'react-router-dom';
import { FaCar, FaDollarSign, FaShieldAlt } from 'react-icons/fa';

const Home = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Share the Ride. Save the Cost.
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100">
                            Connect with fellow students for affordable and convenient ride sharing
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                to="/live-rides" 
                                className="bg-white text-blue-500 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block text-center"
                            >
                                Find a Ride
                            </Link>
                            <Link 
                                to="/create-ride" 
                                className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-500 transition-colors inline-block text-center"
                            >
                                Post a Ride
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose RideMate?</h2>
                        <p className="text-lg text-gray-600">The smart way to share rides with fellow students</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex justify-center mb-4">
                                <FaCar className="text-4xl text-blue-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Easy Ride Sharing</h3>
                            <p className="text-gray-600">Post your ride details and let others join. Simple, fast, and efficient.</p>
                        </div>
                        
                        {/* Feature 2 */}
                        <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex justify-center mb-4">
                                <FaDollarSign className="text-4xl text-green-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Save Money</h3>
                            <p className="text-gray-600">Split travel costs and save money on your daily commute.</p>
                        </div>
                        
                        {/* Feature 3 */}
                        <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex justify-center mb-4">
                                <FaShieldAlt className="text-4xl text-yellow-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
                            <p className="text-gray-600">Connect with verified students only. Your safety is our priority.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-lg text-gray-600">Get started in just 3 simple steps</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="text-center">
                            <div className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                            <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
                            <p className="text-gray-600">Create your account with your student email</p>
                        </div>
                        
                        {/* Step 2 */}
                        <div className="text-center">
                            <div className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                            <h3 className="text-xl font-semibold mb-2">Post or Join</h3>
                            <p className="text-gray-600">Post your ride or browse available rides</p>
                        </div>
                        
                        {/* Step 3 */}
                        <div className="text-center">
                            <div className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                            <h3 className="text-xl font-semibold mb-2">Connect & Travel</h3>
                            <p className="text-gray-600">Share contact info and enjoy your ride</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
