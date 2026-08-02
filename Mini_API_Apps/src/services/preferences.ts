// ==========================================
// WatchWise — Preferences Service (AsyncStorage)
// ==========================================

import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@watchwise_theme';

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
