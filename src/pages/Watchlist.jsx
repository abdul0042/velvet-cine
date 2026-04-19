import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import { BookmarkPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import './SharedLibrary.css';

const Watchlist = () => {
  const { library } = useAuth();
  const watchlist = library.watchlist || [];
  const [filter, setFilter] = useState('all');

  const filteredWatchlist = watchlist.filter(movie => {
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
        <h1 className="heading-lg">My Watchlist ({watchlist.length})</h1>
        <p className="text-secondary">Movies you want to watch soon.</p>
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

      {filteredWatchlist.length > 0 ? (
        <div className="movies-grid">
          {filteredWatchlist.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <BookmarkPlus className="empty-icon" size={64} />
          <h2 className="heading-md">
            {filter === 'all' ? 'Your watchlist is empty' : `No ${filter}s in your watchlist`}
          </h2>
          <p className="text-muted">
            {filter === 'all' 
              ? 'Start adding movies you want to watch later!' 
              : `You haven't added any ${filter === 'tv' ? 'TV shows' : filter}s yet.`}
          </p>
          <Link to="/" className="btn btn-primary" style={{marginTop: '1.5rem'}}>
            Discover {filter === 'all' ? 'Movies' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Link>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
