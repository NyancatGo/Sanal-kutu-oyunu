import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';

type Props = {
  name: string;
  playerNumber: 1 | 2;
  active?: boolean;
  compact?: boolean;
};

export function PlayerBadge({ name, playerNumber, active, compact }: Props) {
  const accent = playerNumber === 1 ? Colors.teal : Colors.coral;
  return (
    <View
      style={[
        styles.wrap,
        compact && styles.wrapCompact,
        compact && styles.compactWidth,
        { borderColor: active ? accent : Colors.border },
        active && { backgroundColor: playerNumber === 1 ? Colors.softBlue : Colors.cream },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: accent }]}>
        <Ionicons name="person" size={compact ? 14 : 16} color="#fff" />
      </View>
      <View style={{ flexShrink: 1 }}>
        {!compact && <Text style={styles.label}>Oyuncu {playerNumber}</Text>}
        <Text style={[styles.name, compact && styles.nameCompact]} numberOfLines={1}>
          {name || `Oyuncu ${playerNumber}`}
        </Text>
      </View>
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
    ...Shadow.sm,
  },
  wrapCompact: { paddingVertical: 6, paddingHorizontal: Spacing.sm },
  compactWidth: { maxWidth: '48%' },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: Colors.muted,
    fontSize: Font.small - 2,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  name: { fontSize: Font.body, fontWeight: '900', color: Colors.text },
  nameCompact: { fontSize: Font.small + 1 },
});
