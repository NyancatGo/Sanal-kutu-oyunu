import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ActionButton } from '@/components/ActionButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
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
    if (state.phase === 'setup' && !state.teacherUnlocked) {
      router.replace('/');
    }
  }, [state.phase, state.teacherUnlocked]);

  const canStart = useMemo(() => {
    if (!player1.trim() || !player2.trim()) return false;
    if (!/^\d{4}$/.test(secretCode)) return false;
    return true;
  }, [player1, player2, secretCode]);

  if (state.phase === 'setup' && !state.teacherUnlocked) {
    return null;
  }

  const onStart = () => {
    if (!player1.trim() || !player2.trim()) {
      setError('Oyuncu adları boş olamaz.');
      return;
    }
    if (!/^\d{4}$/.test(secretCode)) {
      setError('Şifre tam 4 rakam olmalı.');
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
      <View style={styles.header}>
        <View style={styles.teacherMark}>
          <Ionicons name="school-outline" size={22} color={Colors.primaryDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Oyun Kurulumu</Text>
          <Text style={styles.sub}>Öğretmen paneli</Text>
        </View>
      </View>

      <View style={styles.ruleStrip}>
        <Ionicons name="lock-closed-outline" size={18} color={Colors.primaryDark} />
        <Text style={styles.ruleText}>Bu sürüm 4 haneli mekanik kilit ile oynanır.</Text>
      </View>

      <Section title="Oyuncular" icon="people-outline">
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

      <Section title="Şifre" icon="keypad-outline">
        <Field label="Doğru şifre (4 rakam)">
          <TextInput
            style={[styles.input, styles.codeInput]}
            value={secretCode}
            onChangeText={(v) => setSecretCode(v.replace(/\D/g, '').slice(0, 4))}
            placeholder="Örn: 2468"
            placeholderTextColor={Colors.muted}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />
        </Field>
      </Section>

      <Section title="Kategori" icon="library-outline">
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

      <Section title="Zorluk" icon="sparkles-outline">
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

      <Section title="Süre" icon="timer-outline">
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
        icon="play"
      />
      <View style={{ height: Spacing.sm }} />
      <ActionButton
        label="İptal"
        variant="outline"
        fullWidth
        icon="close"
        onPress={() => {
          dispatch({ type: 'LOCK_TEACHER' });
          router.replace('/');
        }}
      />
    </ScreenContainer>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  teacherMark: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  title: { fontSize: Font.title, fontWeight: '900', color: Colors.primaryDark },
  sub: { color: Colors.muted, marginTop: 2, fontWeight: '700' },
  ruleStrip: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    backgroundColor: Colors.cream,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent,
    marginBottom: Spacing.lg,
  },
  ruleText: {
    flex: 1,
    color: Colors.primaryDark,
    fontWeight: '800',
    lineHeight: Font.body * 1.35,
  },
  section: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Font.body,
    fontWeight: '900',
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  label: { fontSize: Font.small, color: Colors.muted, fontWeight: '800' },
  input: {
    backgroundColor: '#F9FBFD',
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
    fontWeight: '900',
    textAlign: 'center',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: '#F9FBFD',
  },
  chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: Font.small + 1, fontWeight: '900', color: Colors.text },
  chipTextSelected: { color: '#fff' },
  error: {
    color: Colors.danger,
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
});
