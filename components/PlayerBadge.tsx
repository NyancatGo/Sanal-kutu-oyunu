import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Font, Radius, Spacing } from '@/constants/theme';

type Props = {
  name: string;
  playerNumber: 1 | 2;
  active?: boolean;
  compact?: boolean;
};

export function PlayerBadge({ name, playerNumber, active, compact }: Props) {
  const accent = playerNumber === 1 ? Colors.primary : Colors.highlight;
  return (
    <View
      style={[
        styles.wrap,
        compact && styles.wrapCompact,
        { borderColor: active ? accent : Colors.border },
        active && styles.active,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: accent }]}>
        <Text style={styles.dotText}>{playerNumber}</Text>
      </View>
      <Text style={[styles.name, compact && { fontSize: Font.body }]} numberOfLines={1}>
        {name || `Oyuncu ${playerNumber}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 2,
    backgroundColor: Colors.surface,
  },
  wrapCompact: { paddingVertical: 6, paddingHorizontal: Spacing.sm },
  active: { backgroundColor: '#FFF8E1' },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotText: { color: '#fff', fontWeight: '800', fontSize: Font.small + 1 },
  name: { fontSize: Font.body + 1, fontWeight: '700', color: Colors.text },
});
