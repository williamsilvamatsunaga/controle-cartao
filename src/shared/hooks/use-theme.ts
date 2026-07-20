import { Colors, type ColorSchemeName, type ThemeColors } from '@/shared/constants/theme';

export function useTheme(): ThemeColors {
  return Colors.light;
}

export function useColorSchemeName(): ColorSchemeName {
  return 'light';
}
