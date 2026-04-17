import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import { LockWheel } from './LockWheel';

export type CombinationLockStatus = 'idle' | 'locked' | 'error' | 'success';

type Props = {
  digits: number[];
  onChange: (digits: number[]) => void;
  onSubmit: () => void;
  onReset: () => void;
  disabled?: boolean;
  status?: CombinationLockStatus;
  lockRemaining?: number;
};

export function CombinationLock({
  digits,
  onChange,
  onSubmit,
  onReset,
  disabled,
  status = 'idle',
  lockRemaining = 0,
}: Props) {
  const shake = useRef(new Animated.Value(0)).current;
  const successLift = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'error') {
      shake.setValue(0);
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 1, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 70, useNativeDriver: true }),
      ]).start();
    }
  }, [shake, status]);

  useEffect(() => {
    Animated.timing(successLift, {
      toValue: status === 'success' ? 1 : 0,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [status, successLift]);

  useEffect(() => {
    if (status !== 'idle') {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, status]);

  const setDigit = (index: number, value: number) => {
    const next = [...digits];
    next[index] = value;
    onChange(next);
  };

  const translateX = shake.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-9, 0, 9],
  });
  const shackleLift = successLift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -28],
  });
  const shackleRotate = successLift.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-8deg'],
  });
  const dotScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.35],
  });
  const dotOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  const isLocked = disabled || status === 'locked';
  const accent =
    status === 'success'
      ? Colors.success
      : status === 'error' || status === 'locked'
      ? Colors.danger
      : Colors.teal;

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateX }] }]}>
      <View style={styles.shackleSlot}>
        <Animated.View
          style={[
            styles.shackle,
            {
              borderColor: accent,
              transform: [{ translateY: shackleLift }, { rotate: shackleRotate }],
            },
          ]}
        />
      </View>

      <View
        style={[
          styles.body,
          status === 'success' && styles.bodySuccess,
          (status === 'error' || status === 'locked') && styles.bodyError,
        ]}
      >
        <View style={styles.plateScrews}>
          <View style={styles.screw} />
          <View style={styles.screw} />
        </View>

        <View style={styles.bodyHeader}>
          <Animated.View
            style={[
              styles.statusDot,
              {
                backgroundColor: accent,
                transform: [{ scale: dotScale }],
                opacity: dotOpacity,
              },
            ]}
          />
          <Text style={styles.statusText}>
            {status === 'locked'
              ? `Kilitli · ${lockRemaining} sn`
              : status === 'success'
              ? 'Kilit Açıldı'
              : status === 'error'
              ? 'Şifre Yanlış'
              : '4 Haneli Kilit'}
          </Text>
        </View>

        <View style={styles.wheelsRow}>
          {digits.map((digit, index) => (
            <LockWheel
              key={index}
              value={digit}
              status={status}
              disabled={isLocked}
              onChange={(value) => setDigit(index, value)}
            />
          ))}
        </View>

        <View style={styles.codeRail}>
          {digits.map((digit, index) => (
            <View key={index} style={[styles.railCell, { borderColor: accent }]}>
              <Text style={styles.railDigit}>{digit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              if (isLocked) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onReset();
            }}
            disabled={isLocked}
            style={({ pressed }) => [
              styles.resetButton,
              (pressed || isLocked) && { opacity: isLocked ? 0.45 : 0.75 },
            ]}
          >
            <Ionicons name="refresh" size={18} color={Colors.primaryDark} />
            <Text style={styles.resetText}>Sıfırla</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              if (isLocked) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              onSubmit();
            }}
            disabled={isLocked}
            style={({ pressed }) => [
              styles.submitButton,
              (pressed || isLocked) && { opacity: isLocked ? 0.5 : 0.86 },
            ]}
          >
            <Ionicons name="lock-open" size={20} color={Colors.ink} />
            <Text style={styles.submitText}>Kilidi Aç</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  shackleSlot: {
    height: 58,
    width: 168,
    overflow: 'hidden',
    marginBottom: -14,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  shackle: {
    width: 168,
    height: 120,
    borderTopWidth: 17,
    borderLeftWidth: 17,
    borderRightWidth: 17,
    borderBottomWidth: 0,
    borderTopLeftRadius: 84,
    borderTopRightRadius: 84,
    backgroundColor: 'transparent',
  },
  body: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
    ...Shadow.lg,
  },
  bodySuccess: {
    borderColor: Colors.success,
    backgroundColor: Colors.successSoft,
  },
  bodyError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerSoft,
  },
  plateScrews: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  screw: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.metal,
    borderWidth: 1,
    borderColor: Colors.metalDark,
  },
  bodyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    color: Colors.primaryDark,
    fontSize: Font.small,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  wheelsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  codeRail: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  railCell: {
    width: 36,
    height: 28,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.ink,
  },
  railDigit: {
    color: Colors.surface,
    fontWeight: '900',
    fontSize: Font.small,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  resetButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  resetText: {
    color: Colors.primaryDark,
    fontSize: Font.body,
    fontWeight: '800',
  },
  submitButton: {
    flex: 1.4,
    minHeight: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  submitText: {
    color: Colors.ink,
    fontSize: Font.body,
    fontWeight: '900',
  },
});
