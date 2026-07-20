import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Fonts, Spacing, Type } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

type DataRowProps = {
  label: string;
  value?: ReactNode;
  valueText?: string;
  valueColor?: string;
  emphasis?: boolean;
  last?: boolean;
};

/** Label left · value right — spacing only, no hairline clutter. */
export function DataRow({
  label,
  value,
  valueText,
  valueColor,
  emphasis = false,
  last = false,
}: DataRowProps) {
  const colors = useTheme();
  const color = valueColor ?? colors.text;

  return (
    <View style={[styles.row, !last && styles.gap]}>
      <Text
        style={{
          flex: 1,
          color: colors.textSecondary,
          fontFamily: Fonts.sans,
          fontSize: Type.body,
        }}
        numberOfLines={2}>
        {label}
      </Text>
      <View style={styles.valueWrap}>
        {value != null ? (
          value
        ) : (
          <Text
            style={{
              color,
              fontFamily: Fonts.monoSemiBold,
              fontSize: emphasis ? Type.bodyLg : Type.body,
              textAlign: 'right',
            }}>
            {valueText ?? '—'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    minHeight: 28,
  },
  gap: {
    marginBottom: Spacing.twoHalf,
  },
  valueWrap: {
    flexShrink: 0,
    alignItems: 'flex-end',
    maxWidth: '52%',
  },
});
