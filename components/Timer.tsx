import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';

type Props = {
  remaining: number;
  total: number;
};

export function Timer({ remaining, total }: Props) {
  const ratio = Math.max(0, Math.min(1, total > 0 ? remaining / total : 0));
  const color =
    remaining <= 5 ? Colors.danger : remaining <= 10 ? Colors.highlight : Colors.primary;

  return (
    <View style={styles.wrap}>
      <View style={[styles.circle, { borderColor: color }]}>
        <Ionicons name="timer-outline" size={22} color={color} />
        <Text style={[styles.time, { color }]}>{remaining}</Text>
        <Text style={styles.unit}>saniye</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: Spacing.sm, width: '100%' },
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
