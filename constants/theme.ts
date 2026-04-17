export const Colors = {
  bg: '#F4F7FB',
  surface: '#FFFFFF',
  primary: '#0F766E',
  primaryDark: '#12303A',
  accent: '#F8C537',
  highlight: '#F9734A',
  text: '#14202B',
  muted: '#667789',
  border: '#DCE5EE',
  success: '#0F9F6E',
  danger: '#D94141',
  overlay: 'rgba(15, 23, 42, 0.55)',
  ink: '#0D1B2A',
  teal: '#14B8A6',
  gold: '#F5B93F',
  coral: '#EF6A4A',
  cream: '#FFF7E8',
  softBlue: '#E8F3FF',
  metal: '#D7E0EA',
  metalDark: '#73808F',
  shadow: 'rgba(15, 32, 43, 0.18)',
  successSoft: '#E8F8F0',
  dangerSoft: '#FDECEC',
};

export const Radius = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
  pill: 999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Font = {
  title: 32,
  heading: 24,
  body: 16,
  small: 14,
  huge: 56,
};

export const Shadow = {
  sm: {
    shadowColor: Colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  md: {
    shadowColor: Colors.ink,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  lg: {
    shadowColor: Colors.ink,
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
};
