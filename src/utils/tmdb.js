import axios from 'axios';

// Since this is a client-side only app for the user, I'm providing a placeholder for the API key as requested.
// We are using the user's provided API key as the fallback
const API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'ab285ca1ea69d0571d925650c8b75bbe';
const BASE_URL = 'https://api.tmdb.org/3';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'en-US',
  },
});

export const tmdbApi = {
  getTrending: () => api.get('/trending/movie/week'),
  getPopular: () => api.get('/movie/popular'),
  getTopRated: () => api.get('/movie/top_rated'),
  searchMovies: (query) => api.get('/search/movie', { params: { query } }),
  getMovieDetails: (id) => api.get(`/movie/${id}`, { params: { append_to_response: 'credits,videos' } }),
};

export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
