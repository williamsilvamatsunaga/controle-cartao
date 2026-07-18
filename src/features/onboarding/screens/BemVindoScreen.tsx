import { Fonts } from '@/shared/constants/theme';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  interpolate,
  interpolateColor,
  runOnJS,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Check, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { setStatusBarStyle } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ONBOARDING_DATA, type OnboardingSlide } from '../data/slides';
import { marcarPrimeiraVezConcluida } from '@/shared/storage';

const colors = {
  primary: '#0F766E',
  surface: '#FFFFFF',
  textPrimary: '#0B1412',
  textTertiary: '#4A5C57',
  textInverse: '#FFFFFF',
  borderDefault: '#CDD8D5',
};

const spacing = {
  xs: 8,
  sm: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
};

const AUTH_WAVE_HEIGHT = 56;
const SHEET_MIN_HEIGHT = 280;
const HERO_TOP_ROW = 44;
const WAVE_VB_W = 390;
const WAVE_CREST = 2;
const WAVE_TROUGH = 54;
const WAVE_TILES = 3;

function buildWavePath(period: number) {
  const sx = period / WAVE_VB_W;
  const C = WAVE_CREST;
  const T = WAVE_TROUGH;
  let d = '';
  for (let i = 0; i < WAVE_TILES; i++) {
    const off = period * i;
    const X = (n: number) => (off + n * sx).toFixed(1);
    if (i === 0) d += `M${X(0)} ${C}`;
    d += ` C ${X(65)} ${C} ${X(130)} ${T} ${X(195)} ${T}`;
    d += ` C ${X(260)} ${T} ${X(325)} ${C} ${X(390)} ${C}`;
  }
  const totalW = (period * WAVE_TILES).toFixed(1);
  d += ` L${totalW} ${AUTH_WAVE_HEIGHT} L0 ${AUTH_WAVE_HEIGHT} Z`;
  return d;
}

export function BemVindoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useAnimatedRef<Animated.FlatList<OnboardingSlide>>();

  const programmatic = useSharedValue(false);
  useDerivedValue(() => {
    if (programmatic.value) {
      scrollTo(listRef, scrollX.value, 0, false);
    }
  });

  // Hero capped so the sheet always keeps readable space (avoids overflow/crush).
  const heroHeight = useMemo(() => {
    const ideal = Math.round(screenH * 0.48);
    const maxAllowed = Math.max(260, screenH - SHEET_MIN_HEIGHT - insets.bottom);
    return Math.min(Math.max(ideal, 280), maxAllowed);
  }, [screenH, insets.bottom]);

  const slideHeight = Math.max(
    160,
    heroHeight - insets.top - spacing.sm - HERO_TOP_ROW - AUTH_WAVE_HEIGHT,
  );

  const wavePath = useMemo(() => buildWavePath(screenW), [screenW]);
  const waveLoop = screenW;

  useEffect(() => {
    setStatusBarStyle('light');
    return () => setStatusBarStyle('dark');
  }, []);

  const animateToIndex = useCallback(
    (index: number) => {
      programmatic.value = true;
      scrollX.value = withTiming(
        index * screenW,
        { duration: 500, easing: Easing.out(Easing.ease) },
        (finished) => {
          if (finished) programmatic.value = false;
        },
      );
    },
    [programmatic, scrollX, screenW],
  );

  const onScroll = useAnimatedScrollHandler((event) => {
    if (!programmatic.value) {
      scrollX.value = event.contentOffset.x;
    }
  });

  const onIndexChange = useCallback((index: number, fromGesture: boolean) => {
    setCurrentIndex(index);
    if (fromGesture) {
      Haptics.selectionAsync();
    }
  }, []);

  useAnimatedReaction(
    () => {
      const i = Math.round(scrollX.value / screenW);
      return Math.min(Math.max(i, 0), ONBOARDING_DATA.length - 1);
    },
    (index, prev) => {
      if (prev !== null && index !== prev) {
        runOnJS(onIndexChange)(index, !programmatic.value);
      }
    },
    [screenW],
  );

  const isLastSlide = currentIndex === ONBOARDING_DATA.length - 1;

  const exitOpacity = useSharedValue(1);
  const exitStyle = useAnimatedStyle(() => ({ opacity: exitOpacity.value }));
  const isExitingRef = useRef(false);

  const navigateNext = useCallback(async () => {
    await marcarPrimeiraVezConcluida();
    router.replace('/cadastro-perfil');
  }, [router]);

  const goToNextScreen = () => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    if (reduceMotion) {
      navigateNext();
      return;
    }
    exitOpacity.value = withTiming(
      0,
      { duration: 200, easing: Easing.out(Easing.quad) },
      (finished) => {
        if (finished) runOnJS(navigateNext)();
      },
    );
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      animateToIndex(currentIndex + 1);
    } else {
      goToNextScreen();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      animateToIndex(currentIndex - 1);
    }
  };

  const current = ONBOARDING_DATA[currentIndex];

  const renderSlide = useCallback(
    ({ item, index }: { item: OnboardingSlide; index: number }) => (
      <Slide
        item={item}
        index={index}
        scrollX={scrollX}
        reduceMotion={!!reduceMotion}
        screenWidth={screenW}
        slideHeight={slideHeight}
      />
    ),
    [scrollX, reduceMotion, screenW, slideHeight],
  );

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.hero,
          {
            height: heroHeight,
            paddingTop: insets.top + spacing.sm,
            backgroundColor: colors.primary,
          },
        ]}
      >
        <Animated.View style={[styles.heroTopRow, exitStyle]}>
          <Text style={styles.brand} accessibilityRole="header">
            Meu Cartão
          </Text>
          <View pointerEvents={isLastSlide ? 'none' : 'auto'}>
            <Pressable
              onPress={goToNextScreen}
              hitSlop={12}
              style={{ opacity: isLastSlide ? 0 : 1 }}
              accessibilityRole="button"
              accessibilityLabel="Pular"
            >
              <Text style={styles.skip}>Pular</Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.FlatList
          ref={listRef}
          data={ONBOARDING_DATA}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={[styles.carousel, exitStyle, { height: slideHeight }]}
          renderItem={renderSlide}
          getItemLayout={(_, index) => ({
            length: screenW,
            offset: screenW * index,
            index,
          })}
          initialNumToRender={ONBOARDING_DATA.length}
          windowSize={ONBOARDING_DATA.length}
          maxToRenderPerBatch={ONBOARDING_DATA.length}
          removeClippedSubviews={false}
        />

        <OnboardingWave
          scrollX={scrollX}
          reduceMotion={!!reduceMotion}
          period={screenW}
          waveLoop={waveLoop}
          wavePath={wavePath}
        />
      </View>

      <Animated.View
        style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.base }, exitStyle]}
      >
        <Animated.View
          key={current.id}
          entering={
            reduceMotion
              ? undefined
              : FadeInDown.duration(280)
                  .easing(Easing.out(Easing.quad))
                  .withInitialValues({ transform: [{ translateY: 8 }] })
          }
          style={styles.textBlock}
        >
          <Text style={styles.title} accessibilityRole="header">
            {current.title}
          </Text>
          <Text style={styles.description}>{current.description}</Text>
        </Animated.View>

        <View style={styles.footer}>
          <Pagination
            data={ONBOARDING_DATA}
            scrollX={scrollX}
            currentIndex={currentIndex}
            screenWidth={screenW}
          />
          <View style={styles.navButtons}>
            {currentIndex > 0 && (
              <NavButton Icon={ChevronLeft} accessibilityLabel="Voltar" onPress={handlePrev} />
            )}
            <NavButton
              Icon={isLastSlide ? Check : ChevronRight}
              accessibilityLabel={isLastSlide ? 'Começar agora' : 'Próximo'}
              onPress={handleNext}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

function NavButton({
  Icon,
  onPress,
  accessibilityLabel,
}: {
  Icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
    >
      <Icon size={22} color={colors.textInverse} strokeWidth={2.25} />
    </Pressable>
  );
}

const OnboardingWave = ({
  scrollX,
  reduceMotion,
  period,
  waveLoop,
  wavePath,
}: {
  scrollX: SharedValue<number>;
  reduceMotion: boolean;
  period: number;
  waveLoop: number;
  wavePath: string;
}) => {
  const waveStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { transform: [{ translateX: 0 }] };
    }
    const offset = scrollX.value % waveLoop;
    return { transform: [{ translateX: -offset }] };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.wave, { width: period * WAVE_TILES }, waveStyle]}>
      <Svg
        width={period * WAVE_TILES}
        height={AUTH_WAVE_HEIGHT}
        viewBox={`0 0 ${period * WAVE_TILES} ${AUTH_WAVE_HEIGHT}`}
        preserveAspectRatio="none"
      >
        <Path d={wavePath} fill={colors.surface} />
      </Svg>
    </Animated.View>
  );
};

const Slide = React.memo(function Slide({
  item,
  index,
  scrollX,
  reduceMotion,
  screenWidth,
  slideHeight,
}: {
  item: OnboardingSlide;
  index: number;
  scrollX: SharedValue<number>;
  reduceMotion: boolean;
  screenWidth: number;
  slideHeight: number;
}) {
  const inputRange = [
    (index - 1) * screenWidth,
    index * screenWidth,
    (index + 1) * screenWidth,
  ];

  const imageStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { transform: [{ translateX: 0 }, { scale: 1 }], opacity: 1 };
    }
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [-screenWidth * 0.3, 0, screenWidth * 0.3],
      'clamp',
    );
    const scale = interpolate(scrollX.value, inputRange, [0.86, 1, 0.86], 'clamp');
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], 'clamp');
    return { transform: [{ translateX }, { scale }], opacity };
  });

  const SlideIcon = item.Icon;
  const iconSize = Math.min(72, Math.round(slideHeight * 0.36));

  return (
    <View style={[styles.slide, { width: screenWidth, height: slideHeight }]}>
      <Animated.View style={[styles.heroVisual, imageStyle]} renderToHardwareTextureAndroid>
        <SlideIcon size={iconSize} color={colors.textInverse} strokeWidth={1.5} />
      </Animated.View>
    </View>
  );
});

const Dot = ({
  index,
  scrollX,
  screenWidth,
}: {
  index: number;
  scrollX: SharedValue<number>;
  screenWidth: number;
}) => {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * screenWidth,
      index * screenWidth,
      (index + 1) * screenWidth,
    ];

    const width = interpolate(scrollX.value, inputRange, [8, 24, 8], 'clamp');
    const progress = interpolate(scrollX.value, inputRange, [0, 1, 0], 'clamp');

    return {
      width,
      backgroundColor: interpolateColor(
        progress,
        [0, 1],
        [colors.borderDefault, colors.primary],
      ),
      opacity: interpolate(progress, [0, 1], [0.6, 1], 'clamp'),
    };
  });

  return <Animated.View style={[styles.dot, dotStyle]} importantForAccessibility="no" />;
};

const Pagination = ({
  data,
  scrollX,
  currentIndex,
  screenWidth,
}: {
  data: typeof ONBOARDING_DATA;
  scrollX: SharedValue<number>;
  currentIndex: number;
  screenWidth: number;
}) => {
  return (
    <View
      style={styles.paginationContainer}
      accessibilityRole="progressbar"
      accessibilityLabel={`Passo ${currentIndex + 1} de ${data.length}`}
    >
      {data.map((item, index) => (
        <Dot key={item.id} index={index} scrollX={scrollX} screenWidth={screenWidth} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  hero: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  heroTopRow: {
    height: HERO_TOP_ROW,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    zIndex: 2,
  },
  brand: {
    color: colors.textInverse,
    fontSize: 18,
    fontFamily: Fonts.sansBold,
    letterSpacing: 0.2,
  },
  skip: {
    color: colors.textInverse,
    fontSize: 15,
    fontFamily: Fonts.sansSemiBold,
    opacity: 0.95,
  },
  carousel: {
    width: '100%',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroVisual: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    justifyContent: 'space-between',
  },
  textBlock: {
    alignItems: 'flex-start',
    gap: 0,
  },
  title: {
    fontFamily: Fonts.sansBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.textPrimary,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textTertiary,
    marginTop: spacing.base,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.xl,
    marginTop: spacing.lg,
  },
  navButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnPressed: {
    opacity: 0.85,
  },
  wave: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.borderDefault,
  },
});
