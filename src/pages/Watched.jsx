import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import StarRating from '../components/StarRating';
import { CheckCircle2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './SharedLibrary.css';

const WatchedCard = ({ movie, updateRating, removeMovie }) => {
  const [reviewPreview, setReviewPreview] = useState(movie.userReview || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveReview = () => {
    updateRating(movie.id, movie.userRating, reviewPreview);
    setIsEditing(false);
  };

  const handleRatingChange = (newRating) => {
    updateRating(movie.id, newRating, movie.userReview);
  };

  return (
    <div className="watched-item">
      <div className="watched-card-wrapper">
        <MovieCard 
          movie={movie} 
          customAction={
            <button 
              className="action-btn action-remove" 
              onClick={(e) => { e.preventDefault(); removeMovie(movie.id); }}
              title="Remove from Watched List"
            >
              <Trash2 size={18} />
            </button>
          }
        />
      </div>
      <div className="user-rating-section glass-panel">
        <div className="rating-header">
          <span>Your Rating:</span>
          <StarRating rating={movie.userRating || 0} onRatingChange={handleRatingChange} />
        </div>
        
        <div className="review-section">
          {isEditing ? (
            <div className="review-editor">
              <textarea 
                className="form-input review-input" 
                value={reviewPreview}
                onChange={(e) => setReviewPreview(e.target.value)}
                placeholder="Write your review here..."
                rows={3}
              />
              <div className="review-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={handleSaveReview}>Save</button>
              </div>
            </div>
          ) : (
            <div className="review-display" onClick={() => setIsEditing(true)} title="Click to edit review">
              {movie.userReview ? (
                <p className="review-text">"{movie.userReview}"</p>
              ) : (
                <p className="review-placeholder text-muted italic">Click to add a review...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Watched = () => {
  const { library, updateWatchedRecord, removeFromWatched } = useAuth();
  const watched = library.watched || [];

  return (
    <div className="library-page animate-fade-in">
      <div className="page-header">
        <h1 className="heading-lg">Watched Movies ({watched.length})</h1>
        <p className="text-secondary">Movies you've completed and reviewed.</p>
      </div>

      {watched.length > 0 ? (
        <div className="watched-grid">
          {watched.map(movie => (
            <WatchedCard 
              key={movie.id} 
              movie={movie} 
              updateRating={updateWatchedRecord}
              removeMovie={removeFromWatched}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <CheckCircle2 className="empty-icon" size={64} />
          <h2 className="heading-md">No watched movies yet</h2>
          <p className="text-muted">Once you watch a movie, mark it as done to leave a rating and review!</p>
          <Link to="/" className="btn btn-primary" style={{marginTop: '1.5rem'}}>
            Discover Movies
          </Link>
        </div>
      )}
    </div>
  );
};

export default Watched;
