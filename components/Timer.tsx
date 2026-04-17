import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';

type Props = {
  remaining: number;
  total: number;
};

export function Timer({ remaining, total }: Props) {
  const ratio = Math.max(0, Math.min(1, total > 0 ? remaining / total : 0));
  const critical = remaining <= 5 && remaining > 0;
  const warning = remaining <= 10 && remaining > 5;
  const color = critical ? Colors.danger : warning ? Colors.highlight : Colors.primary;

  const pulse = useRef(new Animated.Value(0)).current;
  const tick = useRef(new Animated.Value(1)).current;

  // Continuous pulse loop while in critical window (<=5s).
  useEffect(() => {
    if (!critical) {
      pulse.stopAnimation(() => pulse.setValue(0));
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 480,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 480,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [critical, pulse]);

  // Tiny tick bounce when the seconds number changes.
  useEffect(() => {
    tick.setValue(0.85);
    Animated.spring(tick, {
      toValue: 1,
      tension: 220,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [remaining, tick]);

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });
  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.55],
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.circleStage}>
        {critical && (
          <Animated.View
            style={[
              styles.glow,
              {
                backgroundColor: color,
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />
        )}
        <Animated.View
          style={[
            styles.circle,
            {
              borderColor: color,
              transform: critical ? [{ scale: ringScale }] : [],
            },
          ]}
        >
          <Ionicons name="timer-outline" size={22} color={color} />
          <Animated.Text
            style={[styles.time, { color, transform: [{ scale: tick }] }]}
          >
            {remaining}
          </Animated.Text>
          <Text style={styles.unit}>saniye</Text>
        </Animated.View>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${ratio * 100}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: Spacing.sm, width: '100%' },
  circleStage: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  circle: {
    width: 142,
    height: 142,
    borderRadius: 71,
    borderWidth: 7,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  time: { fontSize: Font.huge - 2, fontWeight: '900', lineHeight: Font.huge + 2 },
  unit: { fontSize: Font.small, color: Colors.muted, marginTop: -4, fontWeight: '800' },
  barTrack: {
    width: '100%',
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: Radius.pill },
});
