import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Shadow } from '@/constants/theme';

type Status = 'idle' | 'locked' | 'error' | 'success';

type Props = {
  value: number;
  disabled?: boolean;
  compact?: boolean;
  status?: Status;
  onChange: (value: number) => void;
};

type Dims = {
  wheelWidth: number;
  dialWidth: number;
  slotWidth: number;
  slotHeight: number;
  digitSize: number;
  peekSize: number;
  peekHeight: number;
  chevronHeight: number;
  dialPadding: number;
};

const COMPACT_DIMS: Dims = {
  wheelWidth: 56,
  dialWidth: 48,
  slotWidth: 40,
  slotHeight: 50,
  digitSize: 30,
  peekSize: 15,
  peekHeight: 20,
  chevronHeight: 30,
  dialPadding: 6,
};

const NORMAL_DIMS: Dims = {
  wheelWidth: 64,
  dialWidth: 54,
  slotWidth: 46,
  slotHeight: 56,
  digitSize: 34,
  peekSize: 17,
  peekHeight: 22,
  chevronHeight: 34,
  dialPadding: 8,
};

const HOLD_INITIAL_DELAY = 320;
const HOLD_INTERVAL = 95;
const ANIM_DURATION = 130;

const mod10 = (n: number) => ((n % 10) + 10) % 10;

function LockWheelComponent({
  value,
  disabled,
  compact,
  status = 'idle',
  onChange,
}: Props) {
  const dims = compact ? COMPACT_DIMS : NORMAL_DIMS;

  const valueRef = useRef(value);
  const slide = useRef(new Animated.Value(0)).current;
  const [current, setCurrent] = useState(value);
  const [outgoing, setOutgoing] = useState<{ digit: number; dir: 1 | -1 } | null>(
    null,
  );
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (valueRef.current !== value) {
      valueRef.current = value;
      setCurrent(value);
      setOutgoing(null);
      slide.stopAnimation();
      slide.setValue(0);
    }
  }, [value, slide]);

  useEffect(
    () => () => {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    },
    [],
  );

  const applyChange = useCallback(
    (delta: 1 | -1, animate: boolean, haptic: boolean) => {
      if (disabled) return;
      const prev = valueRef.current;
      const next = mod10(prev + delta);
      if (next === prev) return;
      valueRef.current = next;
      if (haptic) Haptics.selectionAsync().catch(() => {});

      if (animate) {
        setOutgoing({ digit: prev, dir: delta });
        setCurrent(next);
        slide.stopAnimation();
        slide.setValue(0);
        Animated.timing(slide, {
          toValue: 1,
          duration: ANIM_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) setOutgoing(null);
        });
      } else {
        setOutgoing(null);
        setCurrent(next);
        slide.setValue(0);
      }

      onChange(next);
    },
    [disabled, onChange, slide],
  );

  const startHold = useCallback(
    (dir: 1 | -1) => {
      if (disabled) return;
      applyChange(dir, true, true);
      holdTimeoutRef.current = setTimeout(() => {
        holdIntervalRef.current = setInterval(() => {
          applyChange(dir, false, false);
        }, HOLD_INTERVAL);
      }, HOLD_INITIAL_DELAY);
    },
    [applyChange, disabled],
  );

  const stopHold = useCallback(() => {
    const wasRepeating = holdIntervalRef.current !== null;
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    if (wasRepeating) Haptics.selectionAsync().catch(() => {});
  }, []);

  const isError = status === 'error';
  const isSuccess = status === 'success';
  const accent = isSuccess
    ? Colors.success
    : isError
    ? Colors.danger
    : Colors.teal;
  const slotAccent = isSuccess ? Colors.success : isError ? Colors.danger : Colors.accent;
  const slotBg = isSuccess
    ? 'rgba(15, 159, 110, 0.22)'
    : isError
    ? 'rgba(217, 65, 65, 0.22)'
    : 'rgba(248, 197, 55, 0.16)';
  const digitColor = isError
    ? '#FFD9D9'
    : isSuccess
    ? '#D4F6E3'
    : Colors.surface;
  const chevronColor = disabled ? Colors.metalDark : accent;
  const wheelBorder = disabled ? '#24384C' : accent;

  const dir = outgoing?.dir ?? 1;
  const incomingY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [-dir * dims.slotHeight, 0],
  });
  const outgoingY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, dir * dims.slotHeight],
  });
  const incomingOpacity = slide.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0.2, 0.9, 1],
  });
  const outgoingOpacity = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const digitTextStyle = {
    fontSize: dims.digitSize,
    lineHeight: dims.slotHeight,
    color: digitColor,
  };
  const peekTextStyle = {
    fontSize: dims.peekSize,
    lineHeight: dims.peekHeight,
    height: dims.peekHeight,
  };

  return (
    <View
      style={[
        styles.wheel,
        { width: dims.wheelWidth, borderColor: wheelBorder },
        disabled && styles.wheelDisabled,
      ]}
    >
      <StepButton
        dir={1}
        disabled={disabled}
        color={chevronColor}
        height={dims.chevronHeight}
        onPressIn={startHold}
        onPressOut={stopHold}
      />

      <View
        style={[
          styles.dial,
          {
            width: dims.dialWidth,
            borderColor: accent,
            paddingVertical: dims.dialPadding,
          },
        ]}
      >
        <Text
          style={[styles.peek, peekTextStyle]}
          allowFontScaling={false}
          numberOfLines={1}
        >
          {mod10(current + 1)}
        </Text>

        <View
          style={[
            styles.slot,
            {
              width: dims.slotWidth,
              height: dims.slotHeight,
              borderColor: slotAccent,
              backgroundColor: slotBg,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.layer,
              outgoing
                ? {
                    transform: [{ translateY: incomingY }],
                    opacity: incomingOpacity,
                  }
                : null,
            ]}
          >
            <Text
              style={[styles.digit, digitTextStyle]}
              allowFontScaling={false}
              numberOfLines={1}
            >
              {current}
            </Text>
          </Animated.View>
          {outgoing && (
            <Animated.View
              style={[
                styles.layer,
                {
                  transform: [{ translateY: outgoingY }],
                  opacity: outgoingOpacity,
                },
              ]}
            >
              <Text
                style={[styles.digit, digitTextStyle]}
                allowFontScaling={false}
                numberOfLines={1}
              >
                {outgoing.digit}
              </Text>
            </Animated.View>
          )}
        </View>

        <Text
          style={[styles.peek, peekTextStyle]}
          allowFontScaling={false}
          numberOfLines={1}
        >
          {mod10(current - 1)}
        </Text>
      </View>

      <StepButton
        dir={-1}
        disabled={disabled}
        color={chevronColor}
        height={dims.chevronHeight}
        onPressIn={startHold}
        onPressOut={stopHold}
      />
    </View>
  );
}

type StepButtonProps = {
  dir: 1 | -1;
  disabled?: boolean;
  color: string;
  height: number;
  onPressIn: (dir: 1 | -1) => void;
  onPressOut: () => void;
};

function StepButton({
  dir,
  disabled,
  color,
  height,
  onPressIn,
  onPressOut,
}: StepButtonProps) {
  return (
    <Pressable
      onPressIn={() => onPressIn(dir)}
      onPressOut={onPressOut}
      disabled={disabled}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={dir === 1 ? 'Rakamı bir artır' : 'Rakamı bir azalt'}
      style={({ pressed }) => [
        styles.stepButton,
        { minHeight: height },
        pressed && !disabled && styles.stepButtonPressed,
      ]}
    >
      <Ionicons
        name={dir === 1 ? 'chevron-up' : 'chevron-down'}
        size={20}
        color={color}
      />
    </Pressable>
  );
}

export const LockWheel = memo(LockWheelComponent);

const styles = StyleSheet.create({
  wheel: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.ink,
    borderWidth: 1.5,
    alignItems: 'center',
    paddingVertical: 4,
    gap: 3,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  wheelDisabled: {
    opacity: 0.6,
  },
  stepButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  stepButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ scale: 0.94 }],
  },
  dial: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    backgroundColor: '#102437',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  peek: {
    color: Colors.metal,
    fontWeight: '800',
    opacity: 0.5,
    textAlign: 'center',
    includeFontPadding: false,
  },
  slot: {
    borderRadius: Radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontWeight: '900',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
