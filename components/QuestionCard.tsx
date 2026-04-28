import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import {
  CategoryLabels,
  DifficultyLabels,
  type Category,
  type Difficulty,
} from '@/types/question';

type Props = {
  category: Category;
  difficulty: Difficulty;
  question: string;
  variant?: 'normal' | 'final';
};

const CATEGORY_ICONS: Record<Category, React.ComponentProps<typeof Ionicons>['name']> = {
  'genel-kultur': 'earth-outline',
  matematik: 'calculator-outline',
  fen: 'flask-outline',
  tarih: 'time-outline',
  zeka: 'bulb-outline',
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: Colors.success,
  medium: Colors.warning,
  hard: Colors.danger,
};

export function QuestionCard({ category, difficulty, question, variant = 'normal' }: Props) {
  const isFinal = variant === 'final';
  const accent = isFinal ? Colors.coral : Colors.primary;
  return (
    <View style={[styles.card, isFinal && styles.cardFinal]}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={styles.header}>
        <View style={styles.tags}>
          <View style={styles.tag}>
            <Ionicons name={CATEGORY_ICONS[category]} size={12} color={Colors.primary} />
            <Text style={styles.tagText}>{CategoryLabels[category]}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: DIFFICULTY_COLORS[difficulty] }]}>
            <Text style={[styles.tagText, { color: '#fff' }]}>{DifficultyLabels[difficulty]}</Text>
          </View>
          {isFinal && (
            <View style={[styles.tag, { backgroundColor: Colors.ink }]}>
              <Ionicons name="trophy" size={11} color={Colors.accent} />
              <Text style={[styles.tagText, { color: Colors.accent }]}>FİNAL</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.question}>{question}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    paddingTop: Spacing.lg + 2,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    overflow: 'hidden',
    ...Shadow.md,
  },
  cardFinal: {
    borderColor: Colors.coral,
    backgroundColor: '#FFF8F4',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tags: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap', flex: 1 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.softBlue,
  },
  tagText: {
    fontSize: Font.small - 1,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  question: {
    fontSize: Font.heading,
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: Font.heading * 1.4,
    letterSpacing: -0.2,
  },
});
