import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';

type PlayerSide = 1 | 2;

type Props = {
  player1: string;
  player2: string;
  scoreP1: number;
  scoreP2: number;
  roundNumber: number;
  activePlayer?: PlayerSide | null;
  showRound?: boolean;
};

export function ScoreStrip({
  player1,
  player2,
  scoreP1,
  scoreP2,
  roundNumber,
  activePlayer = null,
  showRound = true,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Side
        name={player1}
        score={scoreP1}
        side={1}
        active={activePlayer === 1}
      />
      <View style={styles.center}>
        {showRound ? (
          <View style={styles.roundPill}>
            <Ionicons name="flame" size={12} color={Colors.accent} />
            <Text style={styles.roundText}>Tur {roundNumber}</Text>
          </View>
        ) : (
          <Text style={styles.vs}>VS</Text>
        )}
      </View>
      <Side
        name={player2}
        score={scoreP2}
        side={2}
        active={activePlayer === 2}
      />
    </View>
  );
}

function Side({
  name,
  score,
  side,
  active,
}: {
  name: string;
  score: number;
  side: PlayerSide;
  active: boolean;
}) {
  const accent = side === 1 ? Colors.teal : Colors.coral;
  const softBg = side === 1 ? Colors.softBlue : Colors.cream;
  return (
    <View
      style={[
        styles.side,
        { borderColor: active ? accent : Colors.border },
        active && { backgroundColor: softBg },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: accent }]}>
        <Ionicons name="person" size={14} color="#fff" />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.label} numberOfLines={1}>
          Oyuncu {side}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {name || `Oyuncu ${side}`}
        </Text>
      </View>
      <View style={[styles.scoreBox, { borderColor: accent }]}>
        <Text style={[styles.scoreText, { color: accent }]}>{score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.lg,
    borderWidth: 2,
    backgroundColor: Colors.surface,
    ...Shadow.sm,
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, minWidth: 0 },
  label: {
    color: Colors.muted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    color: Colors.text,
    fontSize: Font.small + 1,
    fontWeight: '900',
  },
  scoreBox: {
    minWidth: 30,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  scoreText: {
    fontSize: Font.body + 2,
    fontWeight: '900',
    lineHeight: Font.body + 4,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  vs: {
    color: Colors.muted,
    fontWeight: '900',
    fontSize: Font.small,
  },
  roundPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.accent,
    backgroundColor: Colors.cream,
  },
  roundText: {
    color: Colors.primaryDark,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
