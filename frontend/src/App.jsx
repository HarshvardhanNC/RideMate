import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RidesProvider } from './context/RidesContext';
import { ChatProvider } from './context/ChatContext';
import ErrorBoundary from './components/ErrorBoundary';
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
    <ErrorBoundary>
      <AuthProvider>
        <RidesProvider>
          <ChatProvider>
            <Router>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <ErrorBoundary>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/live-rides" element={<LiveRides />} />
                      <Route path="/create-ride" element={<CreateRide />} />
                      <Route path="/my-rides" element={<MyRides />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                    </Routes>
                  </ErrorBoundary>
                </main>
                <Footer />
              </div>
            </Router>
          </ChatProvider>
        </RidesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
