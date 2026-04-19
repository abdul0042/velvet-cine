import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookmarkPlus, BookmarkMinus, CheckCircle2, Star, ArrowLeft, Calendar, Clock, Film } from 'lucide-react';
import { tmdbApi, getImageUrl } from '../utils/tmdb';
import { useAuth } from '../context/AuthContext';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isInWatchlist, isWatched, addToWatchlist, removeFromWatchlist, markAsWatched } = useAuth();

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const response = await tmdbApi.getMovieDetails(id);
        setMovie(response.data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="error-container">
        <h2>Movie not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie.id);
  const inWatched = isWatched(movie.id);
  
  const backdropUrl = getImageUrl(movie.backdrop_path, 'original');
  const posterUrl = getImageUrl(movie.poster_path, 'w500');
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  
  const director = movie.credits?.crew?.find(c => c.job === 'Director')?.name || 'Unknown';
  const cast = movie.credits?.cast?.slice(0, 5) || [];
  
  // Find trailer
  const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

  return (
    <div className="movie-detail-page animate-fade-in">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back
      </button>

      <div className="detail-hero">
        {backdropUrl && (
          <div 
            className="backdrop-bg" 
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
        )}
        
        <div className="detail-content glass-panel">
          <div className="detail-poster">
            {posterUrl ? (
              <img src={posterUrl} alt={movie.title} />
            ) : (
              <div className="no-poster"><Film size={48} /></div>
            )}
          </div>
          
          <div className="detail-info">
            <h1 className="detail-title">{movie.title}</h1>
            
            <div className="detail-meta">
              <span className="meta-item">
                <Star size={16} className="text-accent" /> {movie.vote_average?.toFixed(1) || 'N/A'}
              </span>
              <span className="meta-item">
                <Calendar size={16} /> {releaseYear}
              </span>
              {movie.runtime && (
                <span className="meta-item">
                  <Clock size={16} /> {movie.runtime} min
                </span>
              )}
            </div>
            
            <div className="detail-genres">
              {movie.genres?.map(g => (
                <span key={g.id} className="genre-tag">{g.name}</span>
              ))}
            </div>
            
            <div className="detail-actions">
              {!inWatched && (
                <>
                  {inWatchlist ? (
                    <button className="btn btn-danger" onClick={() => removeFromWatchlist(movie.id)}>
                      <BookmarkMinus size={18} /> Remove from Watchlist
                    </button>
                  ) : (
                    <button className="btn btn-secondary" onClick={() => addToWatchlist({...movie, media_type: 'movie'})}>
                      <BookmarkPlus size={18} /> Add to Watchlist
                    </button>
                  )}
                  <button className="btn btn-primary" onClick={() => markAsWatched({...movie, media_type: 'movie'})}>
                    <CheckCircle2 size={18} /> Mark as Watched
                  </button>
                </>
              )}
              {inWatched && (
                <span className="badge badge-watched large-badge">
                  <CheckCircle2 size={16} /> You've watched this
                </span>
              )}
            </div>

            {trailerUrl && (
              <a href={trailerUrl} target="_blank" rel="noopener noreferrer" className="trailer-link">
                Watch Trailer
              </a>
            )}
            
            <div className="detail-overview">
              <h3>Overview</h3>
              <p>{movie.overview || 'No overview available.'}</p>
            </div>
            
            <div className="detail-crew">
              <div className="crew-section">
                <h4>Director</h4>
                <p>{director}</p>
              </div>
              
              {cast.length > 0 && (
                <div className="crew-section">
                  <h4>Top Cast</h4>
                  <p>{cast.map(c => c.name).join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
