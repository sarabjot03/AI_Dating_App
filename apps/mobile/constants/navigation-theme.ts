import { DarkTheme, type Theme } from '@react-navigation/native';

import { Brand } from '@/constants/theme';

export const SparkNavigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Brand.pink,
    background: Brand.background,
    card: Brand.surface,
    text: Brand.text,
    border: Brand.border,
    notification: Brand.pink,
  },
};
