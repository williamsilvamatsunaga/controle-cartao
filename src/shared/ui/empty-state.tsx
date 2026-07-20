import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Fonts, Spacing, Type } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import { Button } from './button';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  const colors = useTheme();

  return (
    <View style={styles.wrap}>
      {icon}
      <Text style={[styles.title, { color: colors.text, fontFamily: Fonts.sansSemiBold }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary, fontFamily: Fonts.sans }]}>
        {description}
      </Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  title: {
    fontSize: Type.bodyLg,
    textAlign: 'center',
  },
  description: {
    fontSize: Type.body,
    textAlign: 'center',
    lineHeight: 20,
  },
  action: {
    marginTop: Spacing.two,
    alignSelf: 'stretch',
  },
});
