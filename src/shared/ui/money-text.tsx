import { Text, type TextProps } from 'react-native';
import { Fonts, Type, commitmentColor, type ThemeColors } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

type MoneyTextProps = TextProps & {
  value: number;
  prefix?: string;
  tone?: 'default' | 'secondary' | 'commitment';
  commitmentPercent?: number;
  size?: 'sm' | 'md' | 'lg';
};

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function MoneyText({
  value,
  prefix = 'R$ ',
  tone = 'default',
  commitmentPercent,
  size = 'md',
  style,
  ...rest
}: MoneyTextProps) {
  const colors = useTheme();
  const color = resolveColor(tone, colors, commitmentPercent);
  const fontSize = size === 'lg' ? Type.title : size === 'sm' ? Type.label : Type.body;

  return (
    <Text
      style={[
        {
          color,
          fontFamily: Fonts.monoSemiBold,
          fontSize,
          fontVariant: ['tabular-nums'],
        },
        style,
      ]}
      {...rest}>
      {prefix}
      {formatBRL(value)}
    </Text>
  );
}

function resolveColor(
  tone: MoneyTextProps['tone'],
  colors: ThemeColors,
  commitmentPercent?: number,
): string {
  if (tone === 'commitment' && commitmentPercent != null) {
    return commitmentColor(commitmentPercent, colors);
  }
  if (tone === 'secondary') return colors.textSecondary;
  return colors.text;
}
