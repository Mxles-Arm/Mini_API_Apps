// ==========================================
// WatchWise — TMDB API Service
// ==========================================

import { create } from 'axios';
import { TMDB_API_KEY, TMDB_BASE_URL } from '@/constants/config';

const api = create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'en-US',
  },
});

// ---------- Types ----------

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  genre_ids?: number[];
  runtime?: number;
  genres?: Genre[];
  popularity: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// ---------- Home Screen APIs ----------

export const getTrending = async (page = 1): Promise<MovieResponse> => {
  const response = await api.get('/trending/movie/week', { params: { page } });
  return response.data;
};

export const getNowPlaying = async (page = 1): Promise<MovieResponse> => {
  const response = await api.get('/movie/now_playing', { params: { page } });
  return response.data;
};

export const getTopRated = async (page = 1): Promise<MovieResponse> => {
  const response = await api.get('/movie/top_rated', { params: { page } });
  return response.data;
};

export const getUpcoming = async (page = 1): Promise<MovieResponse> => {
  const response = await api.get('/movie/upcoming', { params: { page } });
  return response.data;
};

export const getPopular = async (page = 1): Promise<MovieResponse> => {
  const response = await api.get('/movie/popular', { params: { page } });
  return response.data;
};

// ---------- Explore Screen APIs ----------

export const getGenres = async (): Promise<Genre[]> => {
  const response = await api.get('/genre/movie/list');
  return response.data.genres;
};

export const getMoviesByGenre = async (genreId: number, page = 1): Promise<MovieResponse> => {
  const response = await api.get('/discover/movie', {
    params: { with_genres: genreId, page, sort_by: 'popularity.desc' },
  });
  return response.data;
};

// ---------- Search Screen API ----------

export const searchMovies = async (query: string, page = 1): Promise<MovieResponse> => {
  const response = await api.get('/search/movie', { params: { query, page } });
  return response.data;
};

// ---------- Movie Detail APIs ----------

export const getMovieDetails = async (movieId: number): Promise<Movie> => {
  const response = await api.get(`/movie/${movieId}`);
  return response.data;
};

export const getMovieCredits = async (movieId: number): Promise<CastMember[]> => {
  const response = await api.get(`/movie/${movieId}/credits`);
  return response.data.cast;
};

export const getSimilarMovies = async (movieId: number): Promise<MovieResponse> => {
  const response = await api.get(`/movie/${movieId}/similar`);
  return response.data;
};

export const getMovieVideos = async (movieId: number): Promise<Video[]> => {
  const response = await api.get(`/movie/${movieId}/videos`);
  return response.data.results;
};

/** The best trailer to lead with: prefer an official YouTube trailer, then teaser, then anything on YouTube. */
export const pickTrailer = (videos: Video[]): Video | null => {
  const onYouTube = videos.filter((v) => v.site === 'YouTube');
  return (
    onYouTube.find((v) => v.type === 'Trailer' && v.official) ??
    onYouTube.find((v) => v.type === 'Trailer') ??
    onYouTube.find((v) => v.type === 'Teaser') ??
    onYouTube[0] ??
    null
  );
};

// ---------- Random Pick ----------

export const getRandomMovie = async (): Promise<Movie> => {
  const randomPage = Math.floor(Math.random() * 20) + 1;
  const response = await getPopular(randomPage);
  const movies = response.results;
  if (movies.length === 0) {
    const fallback = await getPopular(1);
    return fallback.results[0];
  }
  const randomIndex = Math.floor(Math.random() * movies.length);
  return movies[randomIndex];
};
