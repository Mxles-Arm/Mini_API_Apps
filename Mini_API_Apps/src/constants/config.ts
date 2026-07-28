// ==========================================
// WatchWise — TMDB API Configuration
// ==========================================
// The key is read from .env (git-ignored), never hardcoded here.
// Copy .env.example to .env and add your own key:
//   https://www.themoviedb.org/settings/api

export const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY ?? '';

if (!TMDB_API_KEY && __DEV__) {
  console.warn(
    'TMDB API key missing. Copy .env.example to .env and set ' +
      'EXPO_PUBLIC_TMDB_API_KEY, then restart the dev server.'
  );
}

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
