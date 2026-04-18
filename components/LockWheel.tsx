import React, { useCallback, useEffect, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Colors, Font, Radius, Shadow } from '@/constants/theme';

const ITEM_H = 44;
const VISIBLE_HALF = 2; // 5 cells visible
const REEL_H = (VISIBLE_HALF * 2 + 1) * ITEM_H;
const REPEATS = 30;
const TOTAL_ITEMS = 10 * REPEATS;
const CENTER_BASE = Math.floor(REPEATS / 2) * 10; // 150 — start index for digit 0 at center
const RECENTER_THRESHOLD = 80;

type Status = 'idle' | 'locked' | 'error' | 'success';

type Props = {
  value: number;
  disabled?: boolean;
  status?: Status;
  onChange: (value: number) => void;
};

function mod10(n: number) {
  return ((n % 10) + 10) % 10;
}

export function LockWheel({ value, disabled, status = 'idle', onChange }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const currentDigitRef = useRef(value);
  const suppressEventRef = useRef(false);
  const initialOffset = (CENTER_BASE + value) * ITEM_H;

  // Ensure position matches `value` after mount on all platforms (contentOffset
  // prop alone is flaky on Android).
  useEffect(() => {
    suppressEventRef.current = true;
    scrollRef.current?.scrollTo({
      y: (CENTER_BASE + value) * ITEM_H,
      animated: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync scroll position when the parent changes `value` externally (e.g. reset).
  useEffect(() => {
    if (currentDigitRef.current === value) return;
    currentDigitRef.current = value;
    suppressEventRef.current = true;
    scrollRef.current?.scrollTo({
      y: (CENTER_BASE + value) * ITEM_H,
      animated: false,
    });
  }, [value]);

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (suppressEventRef.current) {
        suppressEventRef.current = false;
        return;
      }
      const y = e.nativeEvent.contentOffset.y;
      const idx = Math.round(y / ITEM_H);
      const digit = mod10(idx);

      if (digit !== currentDigitRef.current) {
        currentDigitRef.current = digit;
        Haptics.selectionAsync().catch(() => {});
        onChange(digit);
      }

      // Re-center silently when drifting toward edges to avoid running
      // out of items on long scroll sessions.
      const centerIdx = CENTER_BASE + digit;
      if (Math.abs(idx - centerIdx) > RECENTER_THRESHOLD) {
        suppressEventRef.current = true;
        scrollRef.current?.scrollTo({
          y: centerIdx * ITEM_H,
          animated: false,
        });
      }
    },
    [onChange],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      if (disabled) return;
      Haptics.selectionAsync().catch(() => {});
      const nextDigit = mod10(currentDigitRef.current + dir);
      currentDigitRef.current = nextDigit;
      const targetY = (CENTER_BASE + nextDigit) * ITEM_H;
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
      onChange(nextDigit);
    },
    [disabled, onChange],
  );

  const isError = status === 'error';
  const isSuccess = status === 'success';

  return (
    <View
      style={[
        styles.wheel,
        disabled && styles.wheelDisabled,
        isError && styles.wheelError,
        isSuccess && styles.wheelSuccess,
      ]}
    >
      <Pressable
        onPress={() => step(1)}
        disabled={disabled}
        style={styles.chevron}
        hitSlop={6}
        accessibilityLabel="Rakamı artır"
      >
        <Ionicons
          name="chevron-up"
          size={18}
          color={disabled ? Colors.metalDark : Colors.teal}
        />
      </Pressable>

      <View style={styles.reelWrap}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_H}
          snapToAlignment="start"
          decelerationRate="fast"
          bounces={false}
          overScrollMode="never"
          scrollEnabled={!disabled}
          contentOffset={{ x: 0, y: initialOffset }}
          contentContainerStyle={styles.scrollContent}
          onMomentumScrollEnd={handleMomentumEnd}
          removeClippedSubviews
          nestedScrollEnabled
        >
          {Array.from({ length: TOTAL_ITEMS }).map((_, i) => (
            <View key={i} style={styles.cell}>
              <Text
                style={[
                  styles.digit,
                  isError && styles.digitError,
                  isSuccess && styles.digitSuccess,
                ]}
              >
                {mod10(i)}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View pointerEvents="none" style={styles.window}>
          <View
            style={[
              styles.windowInner,
              isError && styles.windowError,
              isSuccess && styles.windowSuccess,
            ]}
          />
        </View>

        <View pointerEvents="none" style={styles.fadeTop} />
        <View pointerEvents="none" style={styles.fadeBottom} />
      </View>

      <Pressable
        onPress={() => step(-1)}
        disabled={disabled}
        style={styles.chevron}
        hitSlop={6}
        accessibilityLabel="Rakamı azalt"
      >
        <Ionicons
          name="chevron-down"
          size={18}
          color={disabled ? Colors.metalDark : Colors.teal}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wheel: {
    width: 62,
    borderRadius: Radius.lg,
    backgroundColor: Colors.ink,
    borderWidth: 1,
    borderColor: '#1F2F40',
    alignItems: 'center',
    paddingVertical: 6,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  wheelDisabled: {
    opacity: 0.65,
  },
  wheelError: {
    borderColor: Colors.danger,
  },
  wheelSuccess: {
    borderColor: Colors.success,
  },
  chevron: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 26,
  },
  reelWrap: {
    width: '100%',
    height: REEL_H,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingTop: VISIBLE_HALF * ITEM_H,
    paddingBottom: VISIBLE_HALF * ITEM_H,
  },
  cell: {
    height: ITEM_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontSize: Font.heading + 6,
    fontWeight: '900',
    color: Colors.surface,
    textAlign: 'center',
    lineHeight: ITEM_H - 2,
    includeFontPadding: false,
  },
  digitError: {
    color: '#FFD4D4',
  },
  digitSuccess: {
    color: '#CFF7E3',
  },
  window: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: (REEL_H - ITEM_H) / 2,
    height: ITEM_H,
    borderRadius: Radius.md,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  windowInner: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.accent,
    backgroundColor: 'rgba(248, 197, 55, 0.18)',
  },
  windowError: {
    borderColor: Colors.danger,
    backgroundColor: 'rgba(217, 65, 65, 0.22)',
  },
  windowSuccess: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(15, 159, 110, 0.22)',
  },
  fadeTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: ITEM_H * 0.85,
    backgroundColor: Colors.ink,
    opacity: 0.55,
  },
  fadeBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: ITEM_H * 0.85,
    backgroundColor: Colors.ink,
    opacity: 0.55,
  },
});
