import React, { useState, useEffect } from 'react';
import { Search, Film, Tv } from 'lucide-react';
import { tmdbApi } from '../utils/tmdb';
import { jikanApi } from '../utils/jikan';
import { useSearch } from '../context/SearchContext';
import MovieCard from '../components/MovieCard';
import './Home.css';

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending'); // trending, popular, top_rated
  const [mediaType, setMediaType] = useState('movie'); // 'movie' or 'anime'
  const { searchQuery, setSearchQuery } = useSearch();
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      if (searchQuery.trim().length > 0) {
        return; // skip if searching
      }
      
      setLoading(true);
      try {
        let response;
        if (mediaType === 'movie') {
          if (activeTab === 'trending') response = await tmdbApi.getTrending();
          else if (activeTab === 'popular') response = await tmdbApi.getPopular();
          else if (activeTab === 'top_rated') response = await tmdbApi.getTopRated();
          setItems(response.data.results || []);
        } else {
          if (activeTab === 'trending') response = await jikanApi.getTrending();
          else if (activeTab === 'popular') response = await jikanApi.getPopular();
          else if (activeTab === 'top_rated') response = await jikanApi.getTopRated();
          setItems(response.data.data || []);
        }
      } catch (error) {
        console.error(`Error fetching ${mediaType}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [activeTab, mediaType, searchQuery]);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length >= 3) {
        setIsSearching(true);
        setLoading(true);
        try {
          if (mediaType === 'movie') {
            const response = await tmdbApi.searchMulti(searchQuery);
            // Filter results to only movies and tv shows
            const filteredResults = (response.data.results || []).filter(
              item => item.media_type === 'movie' || item.media_type === 'tv'
            );
            setItems(filteredResults);
          } else {
            const response = await jikanApi.searchAnime(searchQuery);
            setItems(response.data.data || []);
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      } else if (searchQuery.trim().length === 0 && isSearching) {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, mediaType]);

  return (
    <div className="home-page animate-fade-in">
      <section className="hero-section text-center">
        {/* Hero text removed as requested */}
        
        <div className="media-toggle-container">
          <div className="media-toggle">
            <button 
              className={`toggle-btn ${mediaType === 'movie' ? 'active' : ''}`}
              onClick={() => setMediaType('movie')}
            >
              <Film size={18} /> Movies
            </button>
            <button 
              className={`toggle-btn ${mediaType === 'anime' ? 'active' : ''}`}
              onClick={() => setMediaType('anime')}
            >
              <Tv size={18} /> Anime
            </button>
          </div>
        </div>
      </section>

      {!isSearching && (
        <div className="category-tabs">
          <button 
            className={`tab-btn ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            {mediaType === 'movie' ? 'Trending Now' : 'Airing Now'}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'popular' ? 'active' : ''}`}
            onClick={() => setActiveTab('popular')}
          >
            Most Popular
          </button>
          <button 
            className={`tab-btn ${activeTab === 'top_rated' ? 'active' : ''}`}
            onClick={() => setActiveTab('top_rated')}
          >
            Top Rated
          </button>
        </div>
      )}

      {isSearching && (
        <h2 className="heading-md search-results-heading">
          Search Results for "{searchQuery}" in {mediaType === 'movie' ? 'Movies & Series' : 'Anime'}
        </h2>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="movies-grid">
          {items.length > 0 ? (
            items.map(item => (
              <MovieCard key={item.id || item.mal_id} movie={item} />
            ))
          ) : (
            <div className="no-results">
              <p>No {mediaType === 'movie' ? 'movies' : 'anime'} found. Try a different search term.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
