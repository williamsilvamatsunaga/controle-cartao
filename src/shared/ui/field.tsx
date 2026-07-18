import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Fonts, Layout, Radius, Spacing, Type } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

type FieldProps = TextInputProps & {
  label: string;
  error?: string;
  /** Remove top spacing when first in a group */
  flush?: boolean;
};

export function Field({ label, error, style, flush, ...rest }: FieldProps) {
  const colors = useTheme();

  return (
    <View style={[styles.wrap, flush && styles.flush]}>
      <Text style={[styles.label, { color: colors.text, fontFamily: Fonts.sansSemiBold }]}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.textTertiary}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: error ? colors.danger : colors.border,
            backgroundColor: colors.surface,
            fontFamily: Fonts.sans,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text style={[styles.error, { color: colors.danger, fontFamily: Fonts.sans }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: Layout.fieldGap },
  flush: { marginTop: 0 },
  label: {
    fontSize: Type.body,
    marginBottom: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.twoHalf,
    paddingVertical: Spacing.twoHalf,
    fontSize: Type.bodyLg,
    minHeight: Layout.minTap,
  },
  error: {
    fontSize: Type.label,
    marginTop: Spacing.two,
  },
});
