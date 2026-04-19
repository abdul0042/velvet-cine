import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const { register, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (await register(formData.username, formData.password)) {
      navigate('/');
    } else {
      setError('Registration failed. Username may already exist.');
    }
  };

  const handleGuest = (e) => {
    e.preventDefault();
    loginAsGuest();
    navigate('/');
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <Film className="auth-logo" size={48} />
          <h1 className="heading-ld">Create Account</h1>
          <p className="text-secondary">Join Velvet to build your personal library.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input 
              id="username"
              type="text" 
              className="form-input" 
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              className="form-input" 
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input 
              id="confirmPassword"
              type="password" 
              className="form-input" 
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" style={{marginTop: '1rem'}}>
            Sign Up
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button onClick={handleGuest} className="btn btn-secondary btn-block">
          <UserPlus size={18} /> Continue as Guest
        </button>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Log in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
