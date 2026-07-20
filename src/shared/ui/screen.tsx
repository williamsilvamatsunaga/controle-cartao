import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Layout } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

type ScreenProps = {
  children?: ReactNode;
  scroll?: boolean;
  loading?: boolean;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  style?: ViewProps['style'];
};

export function Screen({
  children,
  scroll = true,
  loading = false,
  contentContainerStyle,
  style,
}: ScreenProps) {
  const colors = useTheme();

  if (loading) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }, style]}>
        <StatusBar style="dark" />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.fill, contentContainerStyle]}>
      <View style={[styles.inner, styles.fill]}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }, style]}>
      <StatusBar style="dark" />
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fill: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: {
    paddingHorizontal: Layout.screenPaddingX,
    paddingTop: Layout.screenPaddingTop,
    paddingBottom: Layout.screenPaddingBottom,
    flexGrow: 1,
  },
  inner: {
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
  },
});
