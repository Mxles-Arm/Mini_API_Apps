// ==========================================
// WatchWise — Theme Context (Dark/Light Mode)
// ==========================================
// The chosen theme persists across launches. Until a choice is
// made, the app follows the device setting.

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/colors';
import { ThemeMode, getSavedTheme, saveTheme } from '@/services/preferences';

interface ThemeContextType {
  mode: ThemeMode;
  colors: typeof Colors.dark;
  toggleTheme: () => void;
  isDark: boolean;
  /** True once the saved preference has been read from storage. */
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  colors: Colors.dark,
  toggleTheme: () => {},
  isDark: true,
  ready: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();

  // null = no explicit choice yet, so the device setting wins.
  const [override, setOverride] = useState<ThemeMode | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const saved = await getSavedTheme();
      if (cancelled) return;
      if (saved) setOverride(saved);
      setReady(true);
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const mode: ThemeMode = override ?? (systemScheme === 'light' ? 'light' : 'dark');

  const toggleTheme = useCallback(() => {
    setOverride((prev) => {
      const current = prev ?? (systemScheme === 'light' ? 'light' : 'dark');
      const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
      saveTheme(next);
      return next;
    });
  }, [systemScheme]);

  const value = useMemo<ThemeContextType>(
    () => ({
      mode,
      colors: Colors[mode],
      toggleTheme,
      isDark: mode === 'dark',
      ready,
    }),
    [mode, toggleTheme, ready]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => useContext(ThemeContext);
