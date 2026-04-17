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
};

export function QuestionCard({ category, difficulty, question }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="help-buoy-outline" size={24} color={Colors.primaryDark} />
        </View>
        <View style={styles.tags}>
          <View style={[styles.tag, styles.tagPrimary]}>
            <Text style={[styles.tagText, { color: '#fff' }]}>{CategoryLabels[category]}</Text>
          </View>
          <View style={[styles.tag, styles.tagAccent]}>
            <Text style={[styles.tagText, { color: Colors.ink }]}>{DifficultyLabels[difficulty]}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.question}>{question}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    ...Shadow.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tags: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', flex: 1 },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },
  tagPrimary: { backgroundColor: Colors.primary },
  tagAccent: { backgroundColor: Colors.accent },
  tagText: { fontSize: Font.small, fontWeight: '900' },
  question: {
    fontSize: Font.heading,
    fontWeight: '900',
    color: Colors.text,
    lineHeight: Font.heading * 1.35,
  },
});
