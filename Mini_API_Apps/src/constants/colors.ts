// ==========================================
// WatchWise — Color System
// ==========================================
// Cinematic dark theme with warm gold accent
// Designed for movie browsing — immersive & elegant

export const Colors = {
  dark: {
    background: '#0D1B2A',
    surface: '#1B2838',
    surfaceLight: '#243447',
    card: '#162233',
    primary: '#E2B616',
    primaryDim: '#C49B0E',
    accent: '#E50914',
    text: '#FFFFFF',
    textSecondary: '#8899AA',
    textMuted: '#556677',
    border: '#2A3A4A',
    tabBar: '#0A1520',
    tabBarActive: '#E2B616',
    tabBarInactive: '#556677',
    statusBar: 'light',
    gradient: ['rgba(13, 27, 42, 0)', 'rgba(13, 27, 42, 0.8)', '#0D1B2A'],
  },
  light: {
    background: '#F5F7FA',
    surface: '#FFFFFF',
    surfaceLight: '#EEF1F5',
    card: '#FFFFFF',
    primary: '#C49B0E',
    primaryDim: '#A88200',
    accent: '#E50914',
    text: '#0D1B2A',
    textSecondary: '#5A6A7A',
    textMuted: '#8899AA',
    border: '#DEE3EA',
    tabBar: '#FFFFFF',
    tabBarActive: '#C49B0E',
    tabBarInactive: '#8899AA',
    statusBar: 'dark',
    gradient: ['rgba(245, 247, 250, 0)', 'rgba(245, 247, 250, 0.8)', '#F5F7FA'],
  },
};

// Rating badge colors
export const RatingColors = {
  high: '#2ECC71',    // 7.0+
  medium: '#F1C40F',  // 5.0 - 6.9
  low: '#E74C3C',     // below 5.0
};

// Genre card colors
export const GenreColors: Record<number, string> = {
  28: '#E74C3C',    // Action
  12: '#E67E22',    // Adventure
  16: '#3498DB',    // Animation
  35: '#F1C40F',    // Comedy
  80: '#2C3E50',    // Crime
  99: '#1ABC9C',    // Documentary
  18: '#8E44AD',    // Drama
  10751: '#E91E63', // Family
  14: '#9B59B6',    // Fantasy
  36: '#795548',    // History
  27: '#C0392B',    // Horror
  10402: '#00BCD4', // Music
  9648: '#607D8B',  // Mystery
  10749: '#FF4081', // Romance
  878: '#00E5FF',   // Science Fiction
  10770: '#FF9800', // TV Movie
  53: '#37474F',    // Thriller
  10752: '#4CAF50', // War
  37: '#8D6E63',    // Western
};

// Genre icons (Ionicons names)
export const GenreIcons: Record<number, string> = {
  28: 'flame',
  12: 'compass',
  16: 'color-palette',
  35: 'happy',
  80: 'skull',
  99: 'videocam',
  18: 'heart-half',
  10751: 'people',
  14: 'sparkles',
  36: 'time',
  27: 'moon',
  10402: 'musical-notes',
  9648: 'help-circle',
  10749: 'heart',
  878: 'rocket',
  10770: 'tv',
  53: 'eye',
  10752: 'shield',
  37: 'trail-sign',
};
