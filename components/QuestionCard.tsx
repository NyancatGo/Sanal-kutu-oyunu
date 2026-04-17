import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Font, Radius, Spacing } from '@/constants/theme';
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
};

export function QuestionCard({ category, difficulty, question }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.tags}>
        <View style={[styles.tag, styles.tagPrimary]}>
          <Text style={[styles.tagText, { color: '#fff' }]}>
            {CategoryLabels[category]}
          </Text>
        </View>
        <View style={[styles.tag, styles.tagAccent]}>
          <Text style={[styles.tagText, { color: Colors.primaryDark }]}>
            {DifficultyLabels[difficulty]}
          </Text>
        </View>
      </View>
      <Text style={styles.question}>{question}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  tags: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  tagPrimary: { backgroundColor: Colors.primary },
  tagAccent: { backgroundColor: Colors.accent },
  tagText: { fontSize: Font.small, fontWeight: '700' },
  question: {
    fontSize: Font.heading,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: Font.heading * 1.35,
  },
});
