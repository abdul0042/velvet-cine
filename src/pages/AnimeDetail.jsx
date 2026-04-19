import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookmarkPlus, BookmarkMinus, CheckCircle2, Star, ArrowLeft, Calendar, Clock, Film } from 'lucide-react';
import { jikanApi, getImageUrl } from '../utils/jikan';
import { useAuth } from '../context/AuthContext';
import './MovieDetail.css';

const AnimeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isInWatchlist, isWatched, addToWatchlist, removeFromWatchlist, markAsWatched } = useAuth();

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const response = await jikanApi.getAnimeDetails(id);
        setMovie(response.data.data);
      } catch (error) {
        console.error("Error fetching anime details:", error);
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
        <h2>Anime not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  // To maintain context integrity
  const animeId = movie.mal_id;
  const inWatchlist = isInWatchlist(animeId);
  const inWatched = isWatched(animeId);
  
  // Optional backdrop from trailer or default to large image
  const backdropUrl = movie.trailer?.images?.maximum_image_url || null;
  const posterUrl = getImageUrl(movie);
  const releaseYear = movie.aired?.from ? new Date(movie.aired.from).getFullYear() : 'N/A';
  
  const studios = movie.studios?.map(s => s.name).join(', ') || 'Unknown';
  
  // Find trailer
  const trailerUrl = movie.trailer?.url;

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
            <h1 className="detail-title">{movie.title_english || movie.title}</h1>
            
            <div className="detail-meta">
              <span className="meta-item">
                <Star size={16} className="text-accent" /> {movie.score?.toFixed(1) || 'N/A'}
              </span>
              <span className="meta-item">
                <Calendar size={16} /> {releaseYear}
              </span>
              {movie.duration && (
                <span className="meta-item">
                  <Clock size={16} /> {movie.duration}
                </span>
              )}
            </div>
            
            <div className="detail-genres">
              {movie.genres?.map(g => (
                <span key={g.mal_id} className="genre-tag">{g.name}</span>
              ))}
            </div>
            
            <div className="detail-actions">
              {!inWatched && (
                <>
                  {inWatchlist ? (
                    <button className="btn btn-danger" onClick={() => removeFromWatchlist(animeId)}>
                      <BookmarkMinus size={18} /> Remove from Watchlist
                    </button>
                  ) : (
                    <button className="btn btn-secondary" onClick={() => addToWatchlist({...movie, id: animeId, media_type: 'anime'})}>
                      <BookmarkPlus size={18} /> Add to Watchlist
                    </button>
                  )}
                  <button className="btn btn-primary" onClick={() => markAsWatched({...movie, id: animeId, media_type: 'anime'})}>
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
              <h3>Synopsis</h3>
              <p>{movie.synopsis || 'No synopsis available.'}</p>
            </div>
            
            <div className="detail-crew">
              <div className="crew-section">
                <h4>Studio</h4>
                <p>{studios}</p>
              </div>
              
              <div className="crew-section">
                <h4>Status & Episodes</h4>
                <p>{movie.status} • {movie.episodes ? `${movie.episodes} Episodes` : 'Ongoing'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetail;
