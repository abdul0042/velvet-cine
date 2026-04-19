import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Film, BookmarkPlus, CheckCircle2, User, LogOut, Library, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const profileRef = useRef();
  const libraryRef = useRef();
  const searchBarRef = useRef();

  
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

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length > 0 && location.pathname !== '/') {
      navigate('/');
    }
  };

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

        {/* Global Search Bar */}
        <div className={`navbar-search ${isMobileSearchOpen ? 'mobile-show' : ''}`} ref={searchBarRef}>
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search movies, series, anime..." 
              className="search-input"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <button className="close-mobile-search" onClick={() => setIsMobileSearchOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="navbar-end">
          <button 
            className="mobile-search-trigger" 
            onClick={() => setIsMobileSearchOpen(true)}
            aria-label="Search"
          >
            <Search size={22} />
          </button>
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
