export const Colors = {
  // Surfaces
  bg: '#F1F5FB',
  bgSoft: '#E9F0F8',
  surface: '#FFFFFF',
  surfaceMuted: '#F7FAFD',

  // Brand
  primary: '#0E7C7B',
  primaryDark: '#0B2230',
  ink: '#091824',

  // Accents
  accent: '#F5BD3D',
  accentSoft: '#FFE9B0',
  highlight: '#F26D5B',
  teal: '#13A89E',
  coral: '#F26D5B',
  gold: '#F5BD3D',

  // Text
  text: '#0F1F2A',
  muted: '#5F7388',
  mutedSoft: '#94A3B6',

  // Borders & layers
  border: '#DDE6EF',
  borderStrong: '#C4D2E0',
  divider: '#EAF0F6',

  // States
  success: '#16A974',
  successSoft: '#E5F7EE',
  danger: '#E04848',
  dangerSoft: '#FCE7E7',
  warning: '#F2A23B',
  warningSoft: '#FCEFD9',

  // Misc
  cream: '#FFF6E2',
  softBlue: '#E5F1FB',
  metal: '#D7E0EA',
  metalDark: '#73808F',
  overlay: 'rgba(11, 34, 48, 0.55)',
  shadow: 'rgba(11, 24, 36, 0.18)',
};

export const Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Font = {
  micro: 11,
  small: 13,
  body: 16,
  bodyLg: 18,
  heading: 22,
  title: 28,
  display: 36,
  huge: 56,
};

export const Weight = {
  regular: '500' as const,
  semibold: '700' as const,
  bold: '800' as const,
  black: '900' as const,
};

export const Shadow = {
  xs: {
    shadowColor: Colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sm: {
    shadowColor: Colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  md: {
    shadowColor: Colors.ink,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  lg: {
    shadowColor: Colors.ink,
    shadowOpacity: 0.14,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 9,
  },
};

export const LOCK_MS = 5000;
export const CODE_TIME_LIMIT = 20;
