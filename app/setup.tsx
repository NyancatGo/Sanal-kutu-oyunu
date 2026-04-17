import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ActionButton } from '@/components/ActionButton';
import { Colors, Font, Radius, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import {
  CategoryLabels,
  DifficultyLabels,
  type Category,
  type Difficulty,
} from '@/types/question';

const CATEGORIES: Category[] = ['genel-kultur', 'matematik', 'fen', 'tarih', 'zeka'];
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const TIME_OPTIONS = [15, 30, 45, 60];

export default function Setup() {
  const { state, dispatch } = useGame();
  const [player1, setPlayer1] = useState(state.config.player1);
  const [player2, setPlayer2] = useState(state.config.player2);
  const [secretCode, setSecretCode] = useState(state.config.secretCode);
  const [category, setCategory] = useState<Category>(state.config.category);
  const [difficulty, setDifficulty] = useState<Difficulty>(state.config.difficulty);
  const [timeLimit, setTimeLimit] = useState<number>(state.config.timeLimit || 30);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.teacherUnlocked) {
      router.replace('/');
    }
  }, [state.teacherUnlocked]);

  const canStart = useMemo(() => {
    if (!player1.trim() || !player2.trim()) return false;
    if (!/^\d{3,8}$/.test(secretCode)) return false;
    return true;
  }, [player1, player2, secretCode]);

  if (!state.teacherUnlocked) {
    return null;
  }

  const onStart = () => {
    if (!player1.trim() || !player2.trim()) {
      setError('Oyuncu adları boş olamaz.');
      return;
    }
    if (!/^\d{3,8}$/.test(secretCode)) {
      setError('Şifre 3–8 haneli sayı olmalı.');
      return;
    }
    setError(null);
    dispatch({
      type: 'SETUP_GAME',
      payload: {
        player1: player1.trim(),
        player2: player2.trim(),
        secretCode,
        category,
        difficulty,
        timeLimit,
      },
    });
    router.replace('/code-entry');
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>Oyun Kurulumu</Text>
      <Text style={styles.sub}>Öğretmen alanı — oyunu ayarla ve başlat.</Text>

      <Section title="Oyuncular">
        <Field label="Oyuncu 1">
          <TextInput
            style={styles.input}
            value={player1}
            onChangeText={setPlayer1}
            placeholder="İsim"
            placeholderTextColor={Colors.muted}
            maxLength={20}
          />
        </Field>
        <Field label="Oyuncu 2">
          <TextInput
            style={styles.input}
            value={player2}
            onChangeText={setPlayer2}
            placeholder="İsim"
            placeholderTextColor={Colors.muted}
            maxLength={20}
          />
        </Field>
      </Section>

      <Section title="Şifre">
        <Field label="Doğru şifre (3–8 rakam)">
          <TextInput
            style={[styles.input, styles.codeInput]}
            value={secretCode}
            onChangeText={(v) => setSecretCode(v.replace(/\D/g, '').slice(0, 8))}
            placeholder="Örn: 2468"
            placeholderTextColor={Colors.muted}
            keyboardType="number-pad"
            maxLength={8}
            secureTextEntry
          />
        </Field>
      </Section>

      <Section title="Kategori">
        <View style={styles.chipRow}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={CategoryLabels[c]}
              selected={category === c}
              onPress={() => setCategory(c)}
            />
          ))}
        </View>
      </Section>

      <Section title="Zorluk">
        <View style={styles.chipRow}>
          {DIFFICULTIES.map((d) => (
            <Chip
              key={d}
              label={DifficultyLabels[d]}
              selected={difficulty === d}
              onPress={() => setDifficulty(d)}
            />
          ))}
        </View>
      </Section>

      <Section title="Süre">
        <View style={styles.chipRow}>
          {TIME_OPTIONS.map((t) => (
            <Chip
              key={t}
              label={`${t} sn`}
              selected={timeLimit === t}
              onPress={() => setTimeLimit(t)}
            />
          ))}
        </View>
      </Section>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={{ height: Spacing.md }} />
      <ActionButton
        label="Oyunu Başlat"
        variant="primary"
        fullWidth
        disabled={!canStart}
        onPress={onStart}
      />
      <View style={{ height: Spacing.sm }} />
      <ActionButton
        label="İptal"
        variant="ghost"
        fullWidth
        onPress={() => {
          dispatch({ type: 'LOCK_TEACHER' });
          router.replace('/');
        }}
      />
    </ScreenContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: Font.title, fontWeight: '800', color: Colors.primaryDark },
  sub: { color: Colors.muted, marginTop: 4, marginBottom: Spacing.lg },
  section: { marginBottom: Spacing.lg, gap: Spacing.sm },
  sectionTitle: {
    fontSize: Font.body,
    fontWeight: '700',
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  label: { fontSize: Font.small, color: Colors.muted, fontWeight: '600' },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: Font.body + 1,
    color: Colors.text,
  },
  codeInput: {
    fontSize: Font.heading,
    letterSpacing: 6,
    fontWeight: '700',
    textAlign: 'center',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: Font.small + 1, fontWeight: '700', color: Colors.text },
  chipTextSelected: { color: '#fff' },
  error: {
    color: Colors.danger,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
});
