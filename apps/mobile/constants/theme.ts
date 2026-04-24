/**
 * Spark — black + pink brand (Bumble-inspired density, not Hinge blue).
 * Light/dark entries match so the app always reads as the same brand.
 */

import { Platform } from 'react-native';

export const Brand = {
  background: '#000000',
  surface: '#121212',
  surfaceElevated: '#1B1B1B',
  surfaceCard: '#141414',
  pink: '#FF2D8B',
  pinkMuted: '#FF5BA3',
  pinkDark: '#D61F74',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textMuted: '#737373',
  border: '#2A2A2A',
  overlay: 'rgba(0,0,0,0.55)',
  success: '#34D399',
  danger: '#F87171',
} as const;

const legacy = {
  text: Brand.text,
  background: Brand.background,
  tint: Brand.pink,
  icon: Brand.textMuted,
  tabIconDefault: Brand.textMuted,
  tabIconSelected: Brand.pink,
  surface: Brand.surface,
  surfaceElevated: Brand.surfaceElevated,
  border: Brand.border,
};

export const Colors = {
  light: legacy,
  dark: legacy,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
