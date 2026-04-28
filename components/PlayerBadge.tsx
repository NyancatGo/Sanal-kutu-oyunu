import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';

type Props = {
  name: string;
  groupNumber: 1 | 2;
  active?: boolean;
  compact?: boolean;
};

export function PlayerBadge({ name, groupNumber, active, compact }: Props) {
  const accent = groupNumber === 1 ? Colors.teal : Colors.coral;
  const softBg = groupNumber === 1 ? Colors.softBlue : Colors.cream;
  return (
    <View
      style={[
        styles.wrap,
        compact && styles.wrapCompact,
        {
          borderColor: active ? accent : Colors.border,
          backgroundColor: active ? softBg : Colors.surface,
        },
      ]}
    >
      <View style={[styles.dot, compact && styles.dotCompact, { backgroundColor: accent }]}>
        <Ionicons name="people" size={compact ? 13 : 16} color="#fff" />
      </View>
      <View style={{ flexShrink: 1, gap: 1 }}>
        {!compact && <Text style={styles.label}>Grup {groupNumber}</Text>}
        <Text
          style={[styles.name, compact && styles.nameCompact]}
          numberOfLines={1}
        >
          {name || `Grup ${groupNumber}`}
        </Text>
      </View>
      {active && (
        <View style={[styles.activeDot, { backgroundColor: accent }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    ...Shadow.xs,
  },
  wrapCompact: { paddingVertical: 6, paddingHorizontal: Spacing.sm },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompact: { width: 24, height: 24, borderRadius: 12 },
  label: {
    color: Colors.muted,
    fontSize: Font.small - 2,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: { fontSize: Font.body, fontWeight: '900', color: Colors.ink },
  nameCompact: { fontSize: Font.small + 1 },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 'auto',
  },
});
