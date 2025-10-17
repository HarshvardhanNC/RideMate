import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider first
import { RidesProvider } from './context/RidesContext'; // Import RidesProvider for global state management
import { SocketProvider } from './context/SocketContext'; // Import SocketProvider for real-time updates
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import LiveRides from './pages/LiveRides';
import CreateRide from './pages/CreateRide';
import MyRides from './pages/MyRides';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <AuthProvider> {/* Wrap app with AuthProvider first */}
      <SocketProvider> {/* Add SocketProvider for real-time features */}
        <RidesProvider> {/* Then wrap with RidesProvider to enable global ride state management */}
          <Router>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/live-rides" element={<LiveRides />} />
                  <Route path="/create-ride" element={<CreateRide />} />
                  <Route path="/my-rides" element={<MyRides />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </RidesProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
