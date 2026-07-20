import { StyleSheet, Text, View } from 'react-native';
import { Fonts, Spacing, Type, commitmentColor } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

type CommitmentGaugeProps = {
  percent: number;
  label?: string;
  height?: number;
};

export function CommitmentGauge({
  percent,
  label,
  height = 12,
}: CommitmentGaugeProps) {
  const colors = useTheme();
  const fill = commitmentColor(percent, colors);
  const width = `${Math.min(Math.max(percent, 0), 100)}%` as `${number}%`;

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.track,
          {
            backgroundColor: colors.track,
            height,
            borderRadius: height / 2,
          },
        ]}>
        <View
          style={[
            styles.fill,
            {
              width,
              backgroundColor: fill,
              height,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
      {label ? (
        <Text style={[styles.label, { color: fill, fontFamily: Fonts.sansSemiBold }]}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.twoHalf, marginTop: Spacing.two },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {},
  label: {
    fontSize: Type.body,
    textAlign: 'center',
  },
});
