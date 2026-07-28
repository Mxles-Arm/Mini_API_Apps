// ==========================================
// WatchWise — Color System
// ==========================================
// Grounded in the projection booth, not the corporate lobby.
// Neutrals carry a violet bias — the color of a dark room lit
// only by a screen. The accent is projector-lamp amber: warm,
// desaturated, reads as light rather than as metal.

export const Colors = {
  dark: {
    background: '#12101A',
    surface: '#1C1926',
    surfaceLight: '#272233',
    card: '#191622',
    primary: '#F0A868',
    primaryDim: '#C9854B',
    accent: '#E4572E',
    text: '#F5F1EC',
    textSecondary: '#9B93A8',
    textMuted: '#655D73',
    border: '#2C2738',
    tabBar: '#0D0B14',
    tabBarActive: '#F0A868',
    tabBarInactive: '#655D73',
    statusBar: 'light',
    gradient: ['rgba(18, 16, 26, 0)', 'rgba(18, 16, 26, 0.8)', '#12101A'],
  },
  light: {
    background: '#F7F4F0',
    surface: '#FFFFFF',
    surfaceLight: '#EFEAE4',
    card: '#FFFFFF',
    primary: '#B96A28',
    primaryDim: '#96521B',
    accent: '#C6431F',
    text: '#1A1622',
    textSecondary: '#5F5769',
    textMuted: '#8E8697',
    border: '#E2DBD3',
    tabBar: '#FFFFFF',
    tabBarActive: '#B96A28',
    tabBarInactive: '#8E8697',
    statusBar: 'dark',
    gradient: ['rgba(247, 244, 240, 0)', 'rgba(247, 244, 240, 0.8)', '#F7F4F0'],
  },
};

// Rating badge colors — desaturated so they read as film stock,
// not as a status dashboard. Still three clearly separable steps.
export const RatingColors = {
  high: '#5FB58A',    // 7.0+
  medium: '#D9A441',  // 5.0 - 6.9
  low: '#C1614F',     // below 5.0
};

// Genre card colors
// One family, not a rainbow: every swatch sits in a narrow
// band of saturation and lightness so the grid reads as a set.
// Hue does the sorting — warm for spectacle, cool for interior,
// earth for period. Bright pop is reserved for Sci-Fi alone.
export const GenreColors: Record<number, string> = {
  28: '#B4483A',    // Action
  12: '#C2703A',    // Adventure
  16: '#4A7FA5',    // Animation
  35: '#D19A3E',    // Comedy
  80: '#3A3F52',    // Crime
  99: '#4F8C7C',    // Documentary
  18: '#7A5A87',    // Drama
  10751: '#C4707E', // Family
  14: '#6B5C99',    // Fantasy
  36: '#8A6E52',    // History
  27: '#8C3230',    // Horror
  10402: '#417F8C', // Music
  9648: '#5A6472',  // Mystery
  10749: '#C06B7D', // Romance
  878: '#3E8FA8',   // Science Fiction
  10770: '#B58248', // TV Movie
  53: '#454B5C',    // Thriller
  10752: '#5F7355', // War
  37: '#96745A',    // Western
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
