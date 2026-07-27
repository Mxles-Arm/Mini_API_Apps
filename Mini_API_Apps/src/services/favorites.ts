// ==========================================
// WatchWise — Favorites Service (AsyncStorage)
// ==========================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie } from './tmdb';

const FAVORITES_KEY = '@watchwise_favorites';

export const getFavorites = async (): Promise<Movie[]> => {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const addFavorite = async (movie: Movie): Promise<void> => {
  try {
    const favorites = await getFavorites();
    const exists = favorites.some((fav) => fav.id === movie.id);
    if (!exists) {
      favorites.unshift(movie);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
  }
};

export const removeFavorite = async (movieId: number): Promise<void> => {
  try {
    const favorites = await getFavorites();
    const filtered = favorites.filter((fav) => fav.id !== movieId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
};

export const isFavorite = async (movieId: number): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    return favorites.some((fav) => fav.id === movieId);
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

export const toggleFavorite = async (movie: Movie): Promise<boolean> => {
  const exists = await isFavorite(movie.id);
  if (exists) {
    await removeFavorite(movie.id);
    return false;
  } else {
    await addFavorite(movie);
    return true;
  }
};
