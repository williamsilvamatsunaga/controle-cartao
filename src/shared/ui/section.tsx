import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';
import { Fonts, Layout, Spacing, Type } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

type SectionProps = ViewProps & {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Extra space above (for first section after header, set false) */
  spaced?: boolean;
};

/** One job per section: title + content with consistent vertical rhythm. */
export function Section({
  title,
  subtitle,
  children,
  spaced = true,
  style,
  ...rest
}: SectionProps) {
  const colors = useTheme();

  return (
    <View style={[spaced && styles.spaced, style]} {...rest}>
      {title ? (
        <View style={styles.heading}>
          <Text style={[styles.title, { color: colors.text, fontFamily: Fonts.sansSemiBold }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.subtitle, { color: colors.textSecondary, fontFamily: Fonts.sans }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  spaced: {
    marginTop: Layout.sectionGap - Layout.blockGap,
  },
  heading: {
    marginBottom: Spacing.two,
    gap: Spacing.one,
  },
  title: {
    fontSize: Type.bodyLg,
  },
  subtitle: {
    fontSize: Type.label,
    lineHeight: 18,
  },
});
