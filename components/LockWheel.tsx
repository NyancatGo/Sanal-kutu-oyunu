import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Colors, Font, Radius, Shadow } from '@/constants/theme';

const ITEM_H = 44;
const VISIBLE_HALF = 2; // 2 cells above + current + 2 below = 5 visible
const OFFSETS = [-3, -2, -1, 0, 1, 2, 3];

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
  const drag = useRef(new Animated.Value(0)).current;
  const lastStepRef = useRef(0);
  const committingRef = useRef(false);

  // Reset the strip position whenever `value` prop changes externally
  // (e.g. after commit snaps back, we want drag=0 with new value shown).
  useEffect(() => {
    drag.stopAnimation();
    drag.setValue(0);
    committingRef.current = false;
  }, [drag, value]);

  const commit = useCallback(
    (steps: number) => {
      if (committingRef.current) return;
      if (steps === 0) {
        Animated.spring(drag, {
          toValue: 0,
          tension: 220,
          friction: 22,
          useNativeDriver: true,
        }).start();
        return;
      }
      committingRef.current = true;
      const target = -steps * ITEM_H;
      Animated.timing(drag, {
        toValue: target,
        duration: 140,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          // Snap back to zero position BEFORE propagating the new value,
          // so the next render uses drag=0 with the new value and there's
          // no single-frame "future-value" flash in the window.
          drag.setValue(0);
          onChange(mod10(value + steps));
        } else {
          committingRef.current = false;
        }
      });
    },
    [drag, onChange, value],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: (_, g) =>
          !disabled && Math.abs(g.dy) > 4 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderGrant: () => {
          lastStepRef.current = 0;
          drag.stopAnimation();
          drag.setValue(0);
        },
        onPanResponderMove: (_, g) => {
          if (committingRef.current) return;
          drag.setValue(g.dy);
          const steps = Math.round(-g.dy / ITEM_H);
          if (steps !== lastStepRef.current) {
            lastStepRef.current = steps;
            Haptics.selectionAsync().catch(() => {});
          }
        },
        onPanResponderRelease: (_, g) => {
          commit(Math.round(-g.dy / ITEM_H));
        },
        onPanResponderTerminate: () => commit(0),
      }),
    [commit, disabled, drag],
  );

  const step = useCallback(
    (direction: 1 | -1) => {
      if (disabled || committingRef.current) return;
      Haptics.selectionAsync().catch(() => {});
      commit(direction);
    },
    [commit, disabled],
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

      <View style={styles.reelWrap} {...panResponder.panHandlers}>
        <View style={styles.window} pointerEvents="none">
          <View
            style={[
              styles.windowInner,
              isError && styles.windowError,
              isSuccess && styles.windowSuccess,
            ]}
          />
        </View>

        <View style={styles.strip} pointerEvents="none">
          {OFFSETS.map((off) => {
            const digit = mod10(value + off);
            const translateY = drag.interpolate({
              inputRange: [-1, 1],
              outputRange: [-1 + off * ITEM_H, 1 + off * ITEM_H],
              extrapolate: 'extend',
            });
            return (
              <Animated.View
                key={off}
                style={[styles.cell, { transform: [{ translateY }] }]}
              >
                <Text
                  style={[
                    styles.digit,
                    isError && styles.digitError,
                    isSuccess && styles.digitSuccess,
                  ]}
                >
                  {digit}
                </Text>
              </Animated.View>
            );
          })}
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

const REEL_H = (VISIBLE_HALF * 2 + 1) * ITEM_H; // 5 cells visible

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
    justifyContent: 'center',
    alignItems: 'center',
  },
  strip: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: ITEM_H,
    marginTop: -ITEM_H / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
