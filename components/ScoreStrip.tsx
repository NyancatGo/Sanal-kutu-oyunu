import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import type { GroupId } from '@/types/game';

type Props = {
  group1: string;
  group2: string;
  digitsG1: string[];
  digitsG2: string[];
  activeGroup?: GroupId | null;
  centerLabel?: string;
};

export function ScoreStrip({
  group1,
  group2,
  digitsG1,
  digitsG2,
  activeGroup = null,
  centerLabel = 'Şifre',
}: Props) {
  const [showDigits, setShowDigits] = useState(false);

  return (
    <View style={styles.wrap}>
      <Side
        name={group1}
        digits={digitsG1}
        side={1}
        active={activeGroup === 1}
        showDigits={showDigits}
      />
      <View style={styles.center}>
        <View style={styles.centerPill}>
          <Text style={styles.centerText}>{centerLabel}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={showDigits ? 'Şifreleri gizle' : 'Şifreleri göster'}
          onPress={() => setShowDigits((visible) => !visible)}
          hitSlop={6}
          style={({ pressed }) => [
            styles.revealButton,
            showDigits && styles.revealButtonActive,
            pressed && { opacity: 0.75 },
          ]}
        >
          <Ionicons
            name={showDigits ? 'eye-off' : 'eye'}
            size={14}
            color={showDigits ? Colors.ink : Colors.primary}
          />
        </Pressable>
      </View>
      <Side
        name={group2}
        digits={digitsG2}
        side={2}
        active={activeGroup === 2}
        showDigits={showDigits}
      />
    </View>
  );
}

function Side({
  name,
  digits,
  side,
  active,
  showDigits,
}: {
  name: string;
  digits: string[];
  side: GroupId;
  active: boolean;
  showDigits: boolean;
}) {
  const accent = side === 1 ? Colors.teal : Colors.coral;
  return (
    <View
      style={[
        styles.side,
        active && {
          borderColor: accent,
          backgroundColor: side === 1 ? Colors.softBlue : Colors.cream,
        },
      ]}
    >
      <View style={styles.head}>
        <View style={[styles.dot, { backgroundColor: accent }]}>
          <Text style={styles.dotText}>{side}</Text>
        </View>
        <View style={styles.headText}>
          <Text style={styles.label} numberOfLines={1}>
            Grup {side}
          </Text>
          <Text style={styles.name} numberOfLines={1}>
            {name || `Grup ${side}`}
          </Text>
        </View>
        <View style={[styles.countBox, { backgroundColor: accent }]}>
          <Text style={styles.countText}>{digits.length}/4</Text>
        </View>
      </View>
      <View style={styles.digitRow}>
        {[0, 1, 2, 3].map((index) => {
          const revealed = digits[index];
          const filled = !!revealed;
          return (
            <View
              key={index}
              style={[
                styles.digitBox,
                filled && {
                  borderColor: accent,
                  backgroundColor: Colors.ink,
                },
              ]}
            >
              <Text
                style={[
                  styles.digitText,
                  filled && { color: Colors.accent },
                ]}
              >
                {filled && showDigits ? revealed : filled ? '•' : '·'}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 6,
    width: '100%',
  },
  side: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 6,
    ...Shadow.xs,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headText: { flex: 1, minWidth: 0 },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  label: {
    color: Colors.muted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  name: {
    color: Colors.ink,
    fontSize: Font.small,
    fontWeight: '900',
  },
  digitRow: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'space-between',
  },
  digitBox: {
    flex: 1,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceMuted,
  },
  digitText: {
    color: Colors.mutedSoft,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 14,
  },
  countBox: {
    minWidth: 30,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    gap: 6,
  },
  centerPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
  },
  centerText: {
    color: Colors.primaryDark,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  revealButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.xs,
  },
  revealButtonActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
});
