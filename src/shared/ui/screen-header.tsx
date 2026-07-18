import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { Fonts, Layout, Spacing, Type } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
};

export function ScreenHeader({
  title,
  subtitle,
  right,
  onBack,
  backLabel = 'Voltar',
}: ScreenHeaderProps) {
  const colors = useTheme();

  return (
    <View style={styles.wrap}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          hitSlop={12}
          style={styles.backBtn}>
          <ArrowLeft size={18} color={colors.accent} strokeWidth={2} />
          <Text style={[styles.back, { color: colors.accent, fontFamily: Fonts.sansMedium }]}>
            {backLabel}
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.row}>
        <View style={styles.titles}>
          <Text
            style={[styles.title, { color: colors.text, fontFamily: Fonts.sansSemiBold }]}
            accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.subtitle, { color: colors.textSecondary, fontFamily: Fonts.sans }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: Layout.blockGap },
  backBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  back: { fontSize: Type.body },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  titles: { flex: 1 },
  title: { fontSize: Type.titleLg, letterSpacing: -0.2 },
  subtitle: { fontSize: Type.body, marginTop: Spacing.one, lineHeight: 20 },
});
