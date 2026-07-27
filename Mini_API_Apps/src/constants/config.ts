// ==========================================
// WatchWise — TMDB API Configuration
// ==========================================
// Replace 'YOUR_API_KEY_HERE' with your actual TMDB API key
// Get one free at: https://www.themoviedb.org/settings/api

export const TMDB_API_KEY = 'YOUR_API_KEY_HERE';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Image size variants
export const IMAGE_SIZES = {
  poster: {
    small: `${TMDB_IMAGE_BASE}/w185`,
    medium: `${TMDB_IMAGE_BASE}/w342`,
    large: `${TMDB_IMAGE_BASE}/w500`,
  },
  backdrop: {
    small: `${TMDB_IMAGE_BASE}/w300`,
    medium: `${TMDB_IMAGE_BASE}/w780`,
    large: `${TMDB_IMAGE_BASE}/w1280`,
  },
  profile: {
    small: `${TMDB_IMAGE_BASE}/w45`,
    medium: `${TMDB_IMAGE_BASE}/w185`,
  },
};
