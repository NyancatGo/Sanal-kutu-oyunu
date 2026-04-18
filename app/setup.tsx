import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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

const CATEGORY_ICONS: Record<Category, React.ComponentProps<typeof Ionicons>['name']> = {
  'genel-kultur': 'earth-outline',
  matematik: 'calculator-outline',
  fen: 'flask-outline',
  tarih: 'time-outline',
  zeka: 'bulb-outline',
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: Colors.success,
  medium: Colors.highlight,
  hard: Colors.danger,
};

export default function Setup() {
  const { state, dispatch } = useGame();
  const [player1, setPlayer1] = useState(state.config.player1);
  const [player2, setPlayer2] = useState(state.config.player2);
  const [secretCode, setSecretCode] = useState(state.config.secretCode);
  const [category, setCategory] = useState<Category>(state.config.category);
  const [difficulty, setDifficulty] = useState<Difficulty>(state.config.difficulty);
  const [timeLimit, setTimeLimit] = useState<number>(state.config.timeLimit || 30);
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const codeInputRefs = useRef<(TextInput | null)[]>([]);

  // Digit box entrance animations
  const digitAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    Animated.stagger(
      60,
      digitAnims.map((a) =>
        Animated.spring(a, {
          toValue: 1,
          tension: 160,
          friction: 10,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [digitAnims]);

  // Animate digit boxes when code changes
  useEffect(() => {
    const codeDigits = secretCode.split('');
    codeDigits.forEach((_, i) => {
      if (digitAnims[i]) {
        digitAnims[i].setValue(0.85);
        Animated.spring(digitAnims[i], {
          toValue: 1,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [secretCode, digitAnims]);

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
    router.replace('/player-select');
  };

  const codeDigits = secretCode.padEnd(4, ' ').split('').slice(0, 4);
  const codeDigitCount = secretCode.replace(/\D/g, '').length;
  const codeReady = /^\d{4}$/.test(secretCode);

  const updateCodeDigit = (index: number, value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    const nextDigits = codeDigits.slice();

    if (!digitsOnly) {
      nextDigits[index] = ' ';
      setSecretCode(nextDigits.join('').replace(/\s+$/g, ''));
      return;
    }

    digitsOnly
      .slice(0, 4 - index)
      .split('')
      .forEach((digit, offset) => {
        nextDigits[index + offset] = digit;
      });

    setSecretCode(nextDigits.join('').replace(/\s+$/g, ''));

    const nextIndex = index + digitsOnly.length;
    if (nextIndex < 4) {
      codeInputRefs.current[nextIndex]?.focus();
    } else {
      codeInputRefs.current[3]?.blur();
    }
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

      <Section title="Oyuncular" icon="people-outline" accent={Colors.teal}>
        <Field label="Oyuncu 1" hint="Birinci oyuncunun adı">
          <TextInput
            style={styles.input}
            value={player1}
            onChangeText={setPlayer1}
            placeholder="İsim"
            placeholderTextColor={Colors.muted}
            maxLength={20}
          />
        </Field>
        <Field label="Oyuncu 2" hint="İkinci oyuncunun adı">
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

      <Section title="Şifre" icon="keypad-outline" accent={Colors.accent}>
        <View style={styles.codeBlock}>
          <View style={styles.codeEntryRow}>
            <View style={styles.digitRow}>
              {codeDigits.map((d, i) => {
                const filled = d.trim() !== '';
                const scale = digitAnims[i]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1],
                }) ?? 1;
                return (
                  <Animated.View
                    key={i}
                    style={[
                      styles.digitBox,
                      filled && styles.digitBoxFilled,
                      { transform: [{ scale }], opacity: digitAnims[i] ?? 1 },
                    ]}
                  >
                    <TextInput
                      ref={(ref) => {
                        codeInputRefs.current[i] = ref;
                      }}
                      style={[styles.digitInput, filled && styles.digitInputFilled]}
                      value={filled ? d : ''}
                      onChangeText={(value) => updateCodeDigit(i, value)}
                      onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace' && !filled && i > 0) {
                          codeInputRefs.current[i - 1]?.focus();
                        }
                      }}
                      placeholder="–"
                      placeholderTextColor={Colors.muted}
                      keyboardType="number-pad"
                      inputMode="numeric"
                      secureTextEntry={filled && !showCode}
                      selectTextOnFocus
                    />
                  </Animated.View>
                );
              })}
            </View>
            <Pressable
              onPress={() => setShowCode((visible) => !visible)}
              style={({ pressed }) => [
                styles.eyeButton,
                pressed && { opacity: 0.75 },
              ]}
            >
              <Ionicons
                name={showCode ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={Colors.muted}
              />
            </Pressable>
          </View>
          <Text style={styles.codeHint}>
            {codeReady
              ? '✓ Şifre hazır'
              : `${4 - codeDigitCount} rakam daha`}
          </Text>
        </View>
      </Section>

      <Section title="Kategori" icon="library-outline" accent={Colors.primary}>
        <View style={styles.chipRow}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={CategoryLabels[c]}
              icon={CATEGORY_ICONS[c]}
              selected={category === c}
              onPress={() => setCategory(c)}
            />
          ))}
        </View>
      </Section>

      <Section title="Zorluk" icon="sparkles-outline" accent={Colors.highlight}>
        <View style={styles.segmentRow}>
          {DIFFICULTIES.map((d) => {
            const sel = difficulty === d;
            const color = DIFFICULTY_COLORS[d];
            return (
              <Pressable
                key={d}
                onPress={() => setDifficulty(d)}
                style={[
                  styles.segment,
                  sel && { backgroundColor: color, borderColor: color },
                ]}
              >
                <View style={[styles.segmentDot, { backgroundColor: sel ? '#fff' : color }]} />
                <Text style={[styles.segmentText, sel && { color: '#fff' }]}>
                  {DifficultyLabels[d]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title="Süre" icon="timer-outline" accent={Colors.coral}>
        <View style={styles.timeRow}>
          {TIME_OPTIONS.map((t) => {
            const sel = timeLimit === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTimeLimit(t)}
                style={[styles.timeCard, sel && styles.timeCardSelected]}
              >
                <Text style={[styles.timeNumber, sel && styles.timeNumberSelected]}>
                  {t}
                </Text>
                <Text style={[styles.timeUnit, sel && styles.timeUnitSelected]}>sn</Text>
              </Pressable>
            );
          })}
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
  accent,
  children,
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconBox, accent ? { backgroundColor: accent } : null]}>
          <Ionicons name={icon} size={16} color="#fff" />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {hint && <Text style={styles.fieldHint}>{hint}</Text>}
    </View>
  );
}

function Chip({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
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
      {icon && (
        <Ionicons name={icon} size={14} color={selected ? '#fff' : Colors.primary} />
      )}
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
    borderRadius: Radius.lg,
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
  sectionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: Font.body,
    fontWeight: '900',
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  label: { fontSize: Font.small, color: Colors.muted, fontWeight: '800' },
  fieldHint: { fontSize: 11, color: Colors.muted, fontWeight: '600', fontStyle: 'italic' },
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
  // ── Code preview ──
  codeBlock: {
    gap: Spacing.sm,
    alignItems: 'center',
  },
  codeEntryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
  },
  digitRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  digitBox: {
    width: 52,
    height: 62,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: '#F9FBFD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBoxFilled: {
    borderColor: Colors.accent,
    backgroundColor: Colors.ink,
    ...Shadow.sm,
  },
  digitInput: {
    width: '100%',
    height: '100%',
    fontSize: Font.heading + 4,
    fontWeight: '900',
    color: Colors.muted,
    lineHeight: Font.heading + 8,
    textAlign: 'center',
    padding: 0,
  },
  digitInputFilled: {
    color: Colors.accent,
  },
  eyeButton: {
    width: 52,
    height: 62,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#F9FBFD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeHint: {
    fontSize: Font.small,
    color: Colors.muted,
    fontWeight: '700',
  },
  // ── Chips / Categories ──
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  // ── Difficulty segments ──
  segmentRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: '#F9FBFD',
  },
  segmentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  segmentText: {
    fontSize: Font.small + 1,
    fontWeight: '900',
    color: Colors.text,
  },
  // ── Time cards ──
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  timeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: '#F9FBFD',
  },
  timeCardSelected: {
    borderColor: Colors.coral,
    backgroundColor: Colors.ink,
    ...Shadow.sm,
  },
  timeNumber: {
    fontSize: Font.heading,
    fontWeight: '900',
    color: Colors.text,
  },
  timeNumberSelected: {
    color: Colors.coral,
  },
  timeUnit: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.muted,
    textTransform: 'uppercase',
  },
  timeUnitSelected: {
    color: Colors.metal,
  },
  error: {
    color: Colors.danger,
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
});
