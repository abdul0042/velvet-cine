import React from 'react';
import { Link } from 'react-router-dom';
import { Star, BookmarkPlus, BookmarkMinus, CheckCircle2, Tv, Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl as getTmdbImageUrl } from '../utils/tmdb';
import { getImageUrl as getJikanImageUrl } from '../utils/jikan';
import './MovieCard.css';

const MovieCard = ({ movie, customAction = null }) => {
  const { isInWatchlist, isWatched, addToWatchlist, removeFromWatchlist, markAsWatched } = useAuth();
  
  // Detect if item is Anime (Jikan) or Movie/TV (TMDB)
  const isAnime = !!movie.mal_id || movie.media_type === 'anime';
  const isTV = movie.media_type === 'tv';
  const id = movie.mal_id || movie.id;
  
  const inWatchlist = isInWatchlist(id);
  const inWatched = isWatched(id);
  
  const posterUrl = isAnime ? getJikanImageUrl(movie) : getTmdbImageUrl(movie.poster_path, 'w500');
  
  // Handle different property names
  const title = isAnime ? (movie.title_english || movie.title) : (movie.title || movie.name);
  const releaseYear = isAnime 
    ? (movie.aired?.from ? new Date(movie.aired.from).getFullYear() : (movie.year || 'N/A'))
    : (movie.release_date || movie.first_air_date ? new Date(movie.release_date || movie.first_air_date).getFullYear() : 'N/A');
  
  const rating = isAnime 
    ? (movie.score ? movie.score.toFixed(1) : '?')
    : (movie.vote_average ? movie.vote_average.toFixed(1) : '?');

  const savePayload = { ...movie, id, media_type: isAnime ? 'anime' : (isTV ? 'tv' : 'movie') };
  const detailLink = isAnime ? `/anime/${id}` : (isTV ? `/tv/${id}` : `/movie/${id}`);

  return (
    <div className="movie-card animate-fade-in">
      <div className="card-image-wrap">
        {posterUrl ? (
          <img src={posterUrl} alt={title} className="card-image" loading="lazy" />
        ) : (
          <div className="card-no-image">
            <span>No Image</span>
          </div>
        )}
        
        <div className="card-overlay">
          <div className="card-actions">
            {!inWatched && (
              <>
                {inWatchlist ? (
                  <button 
                    className="action-btn action-remove" 
                    onClick={(e) => { e.preventDefault(); removeFromWatchlist(id); }}
                    title="Remove from Watchlist"
                  >
                    <BookmarkMinus size={20} />
                  </button>
                ) : (
                  <button 
                    className="action-btn action-add" 
                    onClick={(e) => { e.preventDefault(); addToWatchlist(savePayload); }}
                    title="Add to Watchlist"
                  >
                    <BookmarkPlus size={20} />
                  </button>
                )}
                <button 
                  className="action-btn action-watched" 
                  onClick={(e) => { e.preventDefault(); markAsWatched(savePayload); }}
                  title="Mark as Watched"
                >
                  <CheckCircle2 size={20} />
                </button>
              </>
            )}
            {customAction && customAction}
          </div>
          <Link to={detailLink} className="btn btn-primary view-details-btn">
            View Details
          </Link>
        </div>
        
        <div className="media-type-badge">
          {isAnime ? <Tv size={14} /> : (isTV ? <Tv size={14} /> : <Film size={14} />)}
          <span className="badge-text" style={{ fontSize: '10px', marginLeft: '4px', textTransform: 'uppercase' }}>
            {isAnime ? 'Anime' : (isTV ? 'TV' : 'Movie')}
          </span>
        </div>
      </div>
      
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title" title={title}>{title}</h3>
          <span className="card-year">{releaseYear}</span>
        </div>
        
        <div className="card-meta">
          <div className="card-rating">
            <Star size={14} fill="currentColor" className="rating-icon" />
            <span>{rating}</span>
          </div>
          <div className="card-badges">
            {inWatchlist && <span className="badge badge-watchlist">Watchlist</span>}
            {inWatched && <span className="badge badge-watched">Watched</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
