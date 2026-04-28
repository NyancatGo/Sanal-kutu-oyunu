import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';

type Props = {
  remaining: number;
  total: number;
  variant?: 'normal' | 'compact';
};

export function Timer({ remaining, total, variant = 'normal' }: Props) {
  const ratio = Math.max(0, Math.min(1, total > 0 ? remaining / total : 0));
  const critical = remaining <= 5 && remaining > 0;
  const warning = remaining <= 10 && remaining > 5;
  const color = critical ? Colors.danger : warning ? Colors.warning : Colors.primary;
  const softBg = critical ? Colors.dangerSoft : warning ? Colors.warningSoft : Colors.softBlue;

  const pulse = useRef(new Animated.Value(0)).current;
  const tick = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    tick.setValue(0.86);
    Animated.spring(tick, {
      toValue: 1,
      tension: 220,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [remaining, tick]);

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });
  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });
  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.55],
  });

  if (variant === 'compact') {
    return (
      <View style={styles.compactWrap}>
        <View style={[styles.compactIcon, { backgroundColor: softBg }]}>
          <Ionicons name="timer-outline" size={18} color={color} />
        </View>
        <Animated.Text style={[styles.compactNum, { color, transform: [{ scale: tick }] }]}>
          {remaining}
        </Animated.Text>
        <Text style={styles.compactUnit}>sn</Text>
        <View style={styles.compactBar}>
          <View
            style={[
              styles.compactBarFill,
              { width: `${ratio * 100}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  }

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
          <View style={[styles.iconBubble, { backgroundColor: softBg }]}>
            <Ionicons name="timer-outline" size={18} color={color} />
          </View>
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
    width: 156,
    height: 156,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 156,
    height: 156,
    borderRadius: 78,
  },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    ...Shadow.md,
  },
  iconBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  time: {
    fontSize: Font.huge - 6,
    fontWeight: '900',
    lineHeight: Font.huge - 4,
    letterSpacing: -1,
  },
  unit: {
    fontSize: Font.small - 1,
    color: Colors.muted,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  barTrack: {
    width: '90%',
    height: 8,
    backgroundColor: Colors.divider,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: Radius.pill },
  compactWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactNum: {
    fontSize: Font.heading,
    fontWeight: '900',
    minWidth: 32,
    textAlign: 'center',
  },
  compactUnit: {
    fontSize: Font.small - 1,
    color: Colors.muted,
    fontWeight: '800',
  },
  compactBar: {
    flex: 1,
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.divider,
    overflow: 'hidden',
    marginLeft: Spacing.sm,
  },
  compactBarFill: { height: '100%', borderRadius: Radius.pill },
});
