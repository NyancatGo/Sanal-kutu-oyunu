import React, { useCallback, useMemo } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Colors, Font, Radius, Shadow } from '@/constants/theme';

type Props = {
  value: number;
  disabled?: boolean;
  status?: 'idle' | 'locked' | 'error' | 'success';
  onChange: (value: number) => void;
};

function nextDigit(value: number, direction: 1 | -1) {
  return (value + direction + 10) % 10;
}

export function LockWheel({ value, disabled, status = 'idle', onChange }: Props) {
  const changeBy = useCallback(
    (direction: 1 | -1) => {
      if (disabled) return;
      Haptics.selectionAsync().catch(() => {});
      onChange(nextDigit(value, direction));
    },
    [disabled, onChange, value],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          !disabled && Math.abs(gesture.dy) > Math.abs(gesture.dx) && Math.abs(gesture.dy) > 8,
        onPanResponderRelease: (_, gesture) => {
          if (Math.abs(gesture.dy) < 12) return;
          changeBy(gesture.dy < 0 ? 1 : -1);
        },
      }),
    [changeBy, disabled],
  );

  const previous = nextDigit(value, -1);
  const next = nextDigit(value, 1);
  const isError = status === 'error';
  const isSuccess = status === 'success';

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.wheel,
        disabled && styles.wheelDisabled,
        isError && styles.wheelError,
        isSuccess && styles.wheelSuccess,
      ]}
    >
      <Pressable
        onPress={() => changeBy(1)}
        disabled={disabled}
        style={styles.chevron}
        hitSlop={6}
      >
        <Ionicons name="chevron-up" size={18} color={disabled ? Colors.metalDark : Colors.teal} />
      </Pressable>

      <Text style={styles.sideNumber}>{previous}</Text>
      <View style={styles.window}>
        <Text style={[styles.currentNumber, isError && styles.errorText, isSuccess && styles.successText]}>
          {value}
        </Text>
      </View>
      <Text style={styles.sideNumber}>{next}</Text>

      <Pressable
        onPress={() => changeBy(-1)}
        disabled={disabled}
        style={styles.chevron}
        hitSlop={6}
      >
        <Ionicons name="chevron-down" size={18} color={disabled ? Colors.metalDark : Colors.teal} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wheel: {
    width: 64,
    height: 158,
    borderRadius: Radius.lg,
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  wheelDisabled: {
    opacity: 0.6,
  },
  wheelError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerSoft,
  },
  wheelSuccess: {
    borderColor: Colors.success,
    backgroundColor: Colors.successSoft,
  },
  chevron: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
  },
  sideNumber: {
    fontSize: Font.body + 2,
    fontWeight: '800',
    color: Colors.metalDark,
  },
  window: {
    width: 54,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  currentNumber: {
    fontSize: Font.heading + 10,
    lineHeight: Font.heading + 14,
    fontWeight: '900',
    color: Colors.surface,
  },
  errorText: {
    color: Colors.danger,
  },
  successText: {
    color: Colors.success,
  },
});
