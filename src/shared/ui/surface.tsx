import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { Layout, Radius, Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

type SurfaceProps = ViewProps & {
  children: ReactNode;
  muted?: boolean;
  elevated?: boolean;
  tone?: 'default' | 'warning' | 'danger' | 'success' | 'accent' | 'info';
  density?: 'comfortable' | 'compact';
};

export function Surface({
  children,
  muted,
  elevated = true,
  tone = 'default',
  density = 'comfortable',
  style,
  ...rest
}: SurfaceProps) {
  const colors = useTheme();

  const bg =
    tone === 'warning'
      ? colors.warningSurface
      : tone === 'danger'
        ? colors.dangerSurface
        : tone === 'success'
          ? colors.successSurface
          : tone === 'accent'
            ? colors.accentSurface
            : tone === 'info'
              ? colors.infoSurface
              : muted
                ? colors.surfaceMuted
                : elevated
                  ? colors.surfaceRaised
                  : colors.surface;

  const isSemantic = tone !== 'default';

  return (
    <View
      style={[
        styles.base,
        density === 'compact' ? styles.compact : styles.comfortable,
        {
          backgroundColor: bg,
          borderWidth: isSemantic ? 1 : 0,
          borderColor: isSemantic
            ? tone === 'warning'
              ? colors.warningBorder
              : tone === 'danger'
                ? colors.dangerBorder
                : tone === 'success'
                  ? colors.successBorder
                  : tone === 'accent'
                    ? colors.accentBorder
                    : colors.infoBorder
            : 'transparent',
        },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    marginBottom: Layout.blockGap,
  },
  comfortable: {
    padding: Spacing.four,
  },
  compact: {
    padding: Spacing.three,
  },
});
