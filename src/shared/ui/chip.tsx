import { Pressable, StyleSheet, Text } from 'react-native';
import { Fonts, Radius, Spacing, Type } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected = false, onPress }: ChipProps) {
  const colors = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          borderRadius: Radius.sm,
          backgroundColor: selected ? colors.accent : colors.surfaceMuted,
          opacity: pressed ? 0.88 : 1,
        },
      ]}>
      <Text
        style={{
          color: selected ? colors.onAccent : colors.text,
          fontFamily: selected ? Fonts.sansSemiBold : Fonts.sansMedium,
          fontSize: Type.body,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.twoHalf,
  },
});
