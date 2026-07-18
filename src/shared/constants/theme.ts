/**
 * Design tokens — Meu Cartão
 * Strategy: Restrained product UI.
 * Mood: ledger sob luz fria — tinta pinheiro, papel frio, um carimbo teal decisivo.
 * Neutrals tint toward teal (hue ~175), never cream/warm sand/purple.
 */

type Palette = {
  /** App canvas behind content */
  background: string;
  /** Primary content plate (cards, sheets) */
  surface: string;
  /** Nested / inset plate */
  surfaceMuted: string;
  /** Slightly lifted plate (header strips, selected rows) */
  surfaceRaised: string;
  /** @deprecated use surfaceMuted */
  backgroundElement: string;
  /** @deprecated use accentSurface */
  backgroundSelected: string;
  border: string;
  borderStrong: string;
  divider: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentHover: string;
  onAccent: string;
  focusRing: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  warningSurface: string;
  warningBorder: string;
  dangerSurface: string;
  dangerBorder: string;
  successSurface: string;
  successBorder: string;
  accentSurface: string;
  accentBorder: string;
  infoSurface: string;
  infoBorder: string;
  track: string;
  overlay: string;
};

export const Colors: { light: Palette } = {
  light: {
    background: '#F0F4F3',
    surface: '#FFFFFF',
    surfaceMuted: '#E4EBE9',
    surfaceRaised: '#FFFFFF',
    backgroundElement: '#E4EBE9',
    backgroundSelected: '#E6F4F2',
    border: '#CDD8D5',
    borderStrong: '#A3B5B0',
    divider: '#DEE7E4',
    text: '#0B1412',
    textSecondary: '#4A5C57',
    textTertiary: '#6B7F79',
    accent: '#0F766E',
    accentHover: '#0D9488',
    onAccent: '#FFFFFF',
    focusRing: '#0F766E',
    success: '#047857',
    warning: '#B45309',
    danger: '#B91C1C',
    info: '#0E7490',
    warningSurface: '#FFF8EB',
    warningBorder: '#E8C47A',
    dangerSurface: '#FEF2F2',
    dangerBorder: '#F0B4B4',
    successSurface: '#ECFDF5',
    successBorder: '#86D4B0',
    accentSurface: '#E6F4F2',
    accentBorder: '#99D5CE',
    infoSurface: '#E0F7FA',
    infoBorder: '#67E8F9',
    track: '#D5DEDC',
    overlay: 'rgba(11, 20, 18, 0.45)',
  },
};

export type ThemeColors = Palette;
export type ThemeColor = keyof ThemeColors;
export type ColorSchemeName = keyof typeof Colors;

export const Fonts = {
  sans: 'IBMPlexSans_400Regular',
  sansMedium: 'IBMPlexSans_500Medium',
  sansSemiBold: 'IBMPlexSans_600SemiBold',
  sansBold: 'IBMPlexSans_700Bold',
  mono: 'IBMPlexMono_500Medium',
  monoSemiBold: 'IBMPlexMono_600SemiBold',
  webSans: 'IBM Plex Sans, ui-sans-serif, system-ui, sans-serif',
  webMono: 'IBM Plex Mono, ui-monospace, monospace',
} as const;

export const Type = {
  caption: 12,
  label: 13,
  body: 14,
  bodyLg: 16,
  title: 18,
  titleLg: 22,
  display: 28,
} as const;

/** Vertical rhythm — use these for section/block gaps, not ad-hoc margins. */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  twoHalf: 12,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const Layout = {
  screenPaddingX: Spacing.four,
  screenPaddingTop: Spacing.four,
  screenPaddingBottom: Spacing.seven,
  sectionGap: Spacing.five,
  blockGap: Spacing.three,
  inlineGap: Spacing.two,
  fieldGap: Spacing.three,
  maxContentWidth: 800,
  hitSlop: 12,
  minTap: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const BottomTabInset = 50;
export const MaxContentWidth = Layout.maxContentWidth;

/** Semantic color for commitment % (fintech traffic light). */
export function commitmentColor(percent: number, colors: ThemeColors): string {
  if (percent <= 40) return colors.success;
  if (percent <= 60) return colors.warning;
  return colors.danger;
}
