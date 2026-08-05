// ==========================================
// WatchWise — Preferences Service (AsyncStorage)
// ==========================================

import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@watchwise_theme';
const SEARCH_HISTORY_KEY = '@watchwise_search_history';
const FAVORITES_SORT_KEY = '@watchwise_favorites_sort';
const WATCH_REGION_KEY = '@watchwise_watch_region';

const MAX_HISTORY_ITEMS = 10;

export type ThemeMode = 'dark' | 'light';

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'dark' || value === 'light';

/** Returns the saved theme, or null when nothing valid is stored yet. */
export const getSavedTheme = async (): Promise<ThemeMode | null> => {
  try {
    const value = await AsyncStorage.getItem(THEME_KEY);
    return isThemeMode(value) ? value : null;
  } catch (error) {
    console.error('Error reading saved theme:', error);
    return null;
  }
};

export const saveTheme = async (mode: ThemeMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_KEY, mode);
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

// ---------- Search history ----------

export const getSearchHistory = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch (error) {
    console.error('Error reading search history:', error);
    return [];
  }
};

/** Moves the term to the front, de-duplicated, capped at MAX_HISTORY_ITEMS. */
export const addSearchHistoryTerm = async (term: string): Promise<string[]> => {
  const trimmed = term.trim();
  if (!trimmed) return getSearchHistory();
  try {
    const current = await getSearchHistory();
    const withoutDupe = current.filter((t) => t.toLowerCase() !== trimmed.toLowerCase());
    const next = [trimmed, ...withoutDupe].slice(0, MAX_HISTORY_ITEMS);
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.error('Error saving search history:', error);
    return getSearchHistory();
  }
};

export const removeSearchHistoryTerm = async (term: string): Promise<string[]> => {
  try {
    const current = await getSearchHistory();
    const next = current.filter((t) => t !== term);
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.error('Error removing search history term:', error);
    return getSearchHistory();
  }
};

export const clearSearchHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
};

// ---------- Favorites sort ----------

export type FavoritesSort = 'added' | 'rating' | 'title' | 'year';

const isFavoritesSort = (value: unknown): value is FavoritesSort =>
  value === 'added' || value === 'rating' || value === 'title' || value === 'year';

export const getSavedFavoritesSort = async (): Promise<FavoritesSort> => {
  try {
    const value = await AsyncStorage.getItem(FAVORITES_SORT_KEY);
    return isFavoritesSort(value) ? value : 'added';
  } catch (error) {
    console.error('Error reading favorites sort:', error);
    return 'added';
  }
};

export const saveFavoritesSort = async (sort: FavoritesSort): Promise<void> => {
  try {
    await AsyncStorage.setItem(FAVORITES_SORT_KEY, sort);
  } catch (error) {
    console.error('Error saving favorites sort:', error);
  }
};

// ---------- Watch region ----------

/** Returns the saved ISO 3166-1 region code, or null when nothing is stored yet. */
export const getSavedWatchRegion = async (): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(WATCH_REGION_KEY);
    return value && /^[A-Z]{2}$/.test(value) ? value : null;
  } catch (error) {
    console.error('Error reading watch region:', error);
    return null;
  }
};

export const saveWatchRegion = async (region: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(WATCH_REGION_KEY, region);
  } catch (error) {
    console.error('Error saving watch region:', error);
  }
};
