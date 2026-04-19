import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, BookmarkPlus, CheckCircle2, User, LogOut, Library } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  
  const profileRef = useRef();
  const libraryRef = useRef();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (libraryRef.current && !libraryRef.current.contains(event.target)) {
        setIsLibraryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setIsProfileOpen(false);
    setIsLibraryOpen(false);
  }, [location.pathname]);

  const isLibraryActive = location.pathname === '/watchlist' || location.pathname === '/watched';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Film className="brand-icon" size={28} />
          <span>Velvet</span>
        </Link>
        
        <div className="navbar-end">
          
          {user && (
            <div 
              className="nav-dropdown-container" 
              ref={libraryRef}
              onMouseEnter={() => window.innerWidth > 768 && setIsLibraryOpen(true)}
              onMouseLeave={() => window.innerWidth > 768 && setIsLibraryOpen(false)}
            >
              <button 
                className={`nav-link dropdown-trigger ${isLibraryActive ? 'active' : ''}`}
                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
              >
                <Library size={18} />
                <span className="nav-text">Library</span>
              </button>
              
              <div className={`dropdown-menu ${isLibraryOpen ? 'show' : ''}`}>
                <Link to="/watchlist" className={`dropdown-item ${location.pathname === '/watchlist' ? 'active' : ''}`}>
                  <BookmarkPlus size={16} /> Watchlist
                </Link>
                <Link to="/watched" className={`dropdown-item ${location.pathname === '/watched' ? 'active' : ''}`}>
                  <CheckCircle2 size={16} /> Watched
                </Link>
              </div>
            </div>
          )}

          {user ? (
            <div className="nav-dropdown-container profile-container" ref={profileRef}>
              <button 
                className="user-avatar-btn" 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <User size={20} className="user-icon" />
                <span className="desktop-username">{user.username}</span>
              </button>

              <div className={`dropdown-menu dropdown-right ${isProfileOpen ? 'show' : ''}`}>
                <div className="dropdown-header mobile-only">
                  Signed in as <strong>{user.username}</strong>
                </div>
                <button onClick={logout} className="dropdown-item text-danger">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-sm-nav">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm-nav">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
