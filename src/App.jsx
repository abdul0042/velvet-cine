import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { Toaster } from 'react-hot-toast';

// Layout
import Navbar from './components/Navbar';
import InstallBanner from './components/InstallBanner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Watchlist from './pages/Watchlist';
import Watched from './pages/Watched';
import MovieDetail from './pages/MovieDetail';
import AnimeDetail from './pages/AnimeDetail';
import AdminPanel from './pages/AdminPanel';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.isGuest) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/tv/:id" element={<MovieDetail isTV={true} />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
          <Route path="/adminabd" element={<AdminPanel />} />
          
          <Route 
            path="/watchlist" 
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/watched" 
            element={
              <ProtectedRoute>
                <Watched />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'toast-container',
          duration: 3000,
        }}
      />
      <InstallBanner />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <SearchProvider>
        <Router>
          <AppContent />
        </Router>
      </SearchProvider>
    </AuthProvider>
  );
};

export default App;
