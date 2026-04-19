import axios from 'axios';

const BASE_URL = 'https://api.jikan.moe/v4';

const api = axios.create({
  baseURL: BASE_URL,
});

export const jikanApi = {
  getTrending: () => api.get('/seasons/now'),
  getPopular: () => api.get('/top/anime?filter=bypopularity'),
  getTopRated: () => api.get('/top/anime'),
  searchAnime: (query) => api.get('/anime', { params: { q: query, sfw: true } }),
  getAnimeDetails: (id) => api.get(`/anime/${id}/full`),
};

// Jikan returns image URLs directly, but we kept this pattern for easy mapping
export const getImageUrl = (anime) => {
  if (!anime || !anime.images || !anime.images.jpg) return null;
  return anime.images.jpg.large_image_url || anime.images.jpg.image_url;
};
