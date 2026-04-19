import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import StarRating from '../components/StarRating';
import { CheckCircle2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const [filter, setFilter] = useState('all');

  const filteredWatched = watched.filter(movie => {
    if (filter === 'all') return true;
    const isAnime = !!movie.mal_id || movie.media_type === 'anime';
    const isTV = movie.media_type === 'tv';
    const type = isAnime ? 'anime' : (isTV ? 'tv' : 'movie');
    return type === filter;
  });

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'movie', label: 'Movies' },
    { id: 'tv', label: 'TV Shows' },
    { id: 'anime', label: 'Anime' }
  ];

  return (
    <div className="library-page animate-fade-in">
      <div className="page-header">
        <h1 className="heading-lg">Watched Movies ({watched.length})</h1>
        <p className="text-secondary">Movies you've completed and reviewed.</p>
      </div>

      <div className="library-filters">
        {categories.map(cat => (
          <button 
            key={cat.id}
            className={`filter-tab ${filter === cat.id ? 'active' : ''}`}
            onClick={() => setFilter(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filteredWatched.length > 0 ? (
        <div className="watched-grid">
          {filteredWatched.map(movie => (
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
          <h2 className="heading-md">
            {filter === 'all' ? 'No watched movies yet' : `No ${filter}s watched yet`}
          </h2>
          <p className="text-muted">
            {filter === 'all' 
              ? 'Once you watch a movie, mark it as done to leave a rating and review!' 
              : `You haven't marked any ${filter === 'tv' ? 'TV shows' : filter}s as watched yet.`}
          </p>
          <Link to="/" className="btn btn-primary" style={{marginTop: '1.5rem'}}>
            Discover {filter === 'all' ? 'Movies' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Link>
        </div>
      )}
    </div>
  );
};

export default Watched;
