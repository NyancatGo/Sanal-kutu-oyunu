import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Font, Radius, Spacing } from '@/constants/theme';

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
      <View style={styles.circle}>
        <Text style={[styles.time, { color }]}>{remaining}</Text>
        <Text style={styles.unit}>saniye</Text>
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
  wrap: { alignItems: 'center', gap: Spacing.sm },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: { fontSize: Font.huge, fontWeight: '800', lineHeight: Font.huge + 4 },
  unit: { fontSize: Font.small, color: Colors.muted, marginTop: -4 },
  barTrack: {
    width: '100%',
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: Radius.pill },
});
