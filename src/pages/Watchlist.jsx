import React from 'react';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import { BookmarkPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import './SharedLibrary.css';

const Watchlist = () => {
  const { library } = useAuth();
  const watchlist = library.watchlist || [];

  return (
    <div className="library-page animate-fade-in">
      <div className="page-header">
        <h1 className="heading-lg">My Watchlist ({watchlist.length})</h1>
        <p className="text-secondary">Movies you want to watch soon.</p>
      </div>

      {watchlist.length > 0 ? (
        <div className="movies-grid">
          {watchlist.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <BookmarkPlus className="empty-icon" size={64} />
          <h2 className="heading-md">Your watchlist is empty</h2>
          <p className="text-muted">Start adding movies you want to watch later!</p>
          <Link to="/" className="btn btn-primary" style={{marginTop: '1.5rem'}}>
            Discover Movies
          </Link>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
