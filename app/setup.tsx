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
import { generateDistinctSecretCodes } from '@/utils/generateSecretCode';
import { getRandomQuestion } from '@/utils/getRandomQuestion';

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
  medium: Colors.warning,
  hard: Colors.danger,
};

export default function Setup() {
  const { state, dispatch } = useGame();
  const [group1, setGroup1] = useState(state.config.group1);
  const [group2, setGroup2] = useState(state.config.group2);
  const [digitCategory, setDigitCategory] = useState<Category>(state.config.digitCategory);
  const [digitDifficulty, setDigitDifficulty] = useState<Difficulty>(state.config.digitDifficulty);
  const [digitTimeLimit, setDigitTimeLimit] = useState<number>(state.config.digitTimeLimit || 30);
  const [finalCategory, setFinalCategory] = useState<Category>(state.config.finalCategory);
  const [finalDifficulty, setFinalDifficulty] = useState<Difficulty>(state.config.finalDifficulty);
  const [finalTimeLimit, setFinalTimeLimit] = useState<number>(state.config.finalTimeLimit || 30);
  const [codeTimeLimit, setCodeTimeLimit] = useState<number>(state.config.codeTimeLimit || 30);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.phase === 'setup' && !state.teacherUnlocked) {
      router.replace('/');
    }
  }, [state.phase, state.teacherUnlocked]);

  const canStart = useMemo(() => {
    return !!group1.trim() && !!group2.trim();
  }, [group1, group2]);

  if (state.phase === 'setup' && !state.teacherUnlocked) {
    return null;
  }

  const onStart = () => {
    if (!group1.trim() || !group2.trim()) {
      setError('Grup adları boş olamaz.');
      return;
    }

    const config = {
      group1: group1.trim(),
      group2: group2.trim(),
      digitCategory,
      digitDifficulty,
      digitTimeLimit,
      finalCategory,
      finalDifficulty,
      finalTimeLimit,
      codeTimeLimit,
    };

    setError(null);
    dispatch({
      type: 'SETUP_GAME',
      payload: {
        config,
        secretCodes: generateDistinctSecretCodes(),
        firstQuestion: getRandomQuestion(digitCategory, digitDifficulty),
      },
    });
    router.replace('/starter-select');
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => {
            dispatch({ type: 'LOCK_TEACHER' });
            router.replace('/');
          }}
          hitSlop={10}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.primaryDark} />
        </Pressable>
        <View style={styles.topBarTitle}>
          <Text style={styles.eyebrow}>Öğretmen Paneli</Text>
          <Text style={styles.title}>Oyun Kurulumu</Text>
        </View>
        <View style={styles.teacherMark}>
          <Ionicons name="school" size={18} color={Colors.primaryDark} />
        </View>
      </View>

      <Section title="Gruplar" icon="people" tone={Colors.teal} description="Yarışacak iki grubun adlarını girin.">
        <View style={styles.groupRow}>
          <GroupInput
            tone={Colors.teal}
            badge="1"
            value={group1}
            onChange={setGroup1}
            placeholder="Birinci grup"
          />
          <GroupInput
            tone={Colors.coral}
            badge="2"
            value={group2}
            onChange={setGroup2}
            placeholder="İkinci grup"
          />
        </View>
      </Section>

      <QuestionSettings
        title="Şifre Soruları"
        icon="key"
        description="Doğru cevap, gizli kod hanesini kazandırır."
        tone={Colors.primary}
        category={digitCategory}
        difficulty={digitDifficulty}
        timeLimit={digitTimeLimit}
        onCategory={setDigitCategory}
        onDifficulty={setDigitDifficulty}
        onTimeLimit={setDigitTimeLimit}
      />

      <QuestionSettings
        title="Final Sorusu"
        icon="trophy"
        description="Kilidi açan grup finale girer. Bilen kazanır."
        tone={Colors.coral}
        category={finalCategory}
        difficulty={finalDifficulty}
        timeLimit={finalTimeLimit}
        onCategory={setFinalCategory}
        onDifficulty={setFinalDifficulty}
        onTimeLimit={setFinalTimeLimit}
      />

      <Section title="Kilit Süresi" icon="lock-open" tone={Colors.accent} description="Şifreyi girmek için verilen süre.">
        <View style={styles.timeRow}>
          {[20, 30, 45, 60].map((t) => {
            const selected = codeTimeLimit === t;
            return (
              <Pressable
                key={t}
                onPress={() => setCodeTimeLimit(t)}
                style={[
                  styles.timeCard,
                  selected && { borderColor: Colors.accent, backgroundColor: Colors.ink },
                ]}
              >
                <Text
                  style={[
                    styles.timeNumber,
                    selected && { color: Colors.accent },
                  ]}
                >
                  {t}
                </Text>
                <Text
                  style={[styles.timeUnit, selected && { color: Colors.metal }]}
                >
                  saniye
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color={Colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={{ height: Spacing.sm }} />
      <ActionButton
        label="Oyunu Başlat"
        variant="primary"
        size="lg"
        fullWidth
        disabled={!canStart}
        onPress={onStart}
        icon="play"
      />
    </ScreenContainer>
  );
}

function GroupInput({
  tone,
  badge,
  value,
  onChange,
  placeholder,
}: {
  tone: string;
  badge: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.groupInputCard}>
      <View style={[styles.groupBadge, { backgroundColor: tone }]}>
        <Text style={styles.groupBadgeText}>{badge}</Text>
      </View>
      <TextInput
        style={styles.groupInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.mutedSoft}
        maxLength={20}
      />
    </View>
  );
}

function QuestionSettings({
  title,
  icon,
  description,
  tone,
  category,
  difficulty,
  timeLimit,
  onCategory,
  onDifficulty,
  onTimeLimit,
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  description: string;
  tone: string;
  category: Category;
  difficulty: Difficulty;
  timeLimit: number;
  onCategory: (category: Category) => void;
  onDifficulty: (difficulty: Difficulty) => void;
  onTimeLimit: (timeLimit: number) => void;
}) {
  return (
    <Section title={title} icon={icon} tone={tone} description={description}>
      <SubLabel>Kategori</SubLabel>
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={CategoryLabels[c]}
            icon={CATEGORY_ICONS[c]}
            selected={category === c}
            onPress={() => onCategory(c)}
            tone={tone}
          />
        ))}
      </View>

      <SubLabel>Zorluk</SubLabel>
      <View style={styles.segmentRow}>
        {DIFFICULTIES.map((d) => {
          const selected = difficulty === d;
          const color = DIFFICULTY_COLORS[d];
          return (
            <Pressable
              key={d}
              onPress={() => onDifficulty(d)}
              style={[
                styles.segment,
                selected && { backgroundColor: color, borderColor: color },
              ]}
            >
              <View
                style={[
                  styles.segmentDot,
                  { backgroundColor: selected ? '#fff' : color },
                ]}
              />
              <Text style={[styles.segmentText, selected && { color: '#fff' }]}>
                {DifficultyLabels[d]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SubLabel>Süre</SubLabel>
      <View style={styles.timeRow}>
        {TIME_OPTIONS.map((t) => {
          const selected = timeLimit === t;
          return (
            <Pressable
              key={t}
              onPress={() => onTimeLimit(t)}
              style={[
                styles.timeCard,
                selected && { borderColor: tone, backgroundColor: Colors.ink },
              ]}
            >
              <Text
                style={[
                  styles.timeNumber,
                  selected && { color: Colors.accent },
                ]}
              >
                {t}
              </Text>
              <Text
                style={[styles.timeUnit, selected && { color: Colors.metal }]}
              >
                saniye
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Section>
  );
}

function Section({
  title,
  icon,
  tone,
  description,
  children,
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tone: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: tone }]}>
          <Ionicons name={icon} size={16} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {description && <Text style={styles.sectionDesc}>{description}</Text>}
        </View>
      </View>
      {children}
    </View>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subLabel}>{children}</Text>;
}

function Chip({
  label,
  icon,
  selected,
  onPress,
  tone,
}: {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  selected: boolean;
  onPress: () => void;
  tone: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && { backgroundColor: tone, borderColor: tone },
        pressed && { opacity: 0.85 },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={selected ? '#fff' : Colors.primary}
        />
      )}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.xs,
  },
  topBarTitle: { flex: 1, gap: 2 },
  eyebrow: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: Font.title - 2,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -0.4,
  },
  teacherMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...Shadow.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: Font.body + 1,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  sectionDesc: {
    fontSize: Font.small,
    color: Colors.muted,
    fontWeight: '600',
    marginTop: 1,
  },
  subLabel: {
    color: Colors.muted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 6,
  },
  groupRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  groupInputCard: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  groupBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupBadgeText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: Font.body - 2,
  },
  groupInput: {
    flex: 1,
    fontSize: Font.body,
    color: Colors.ink,
    fontWeight: '700',
    paddingVertical: 4,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceMuted,
  },
  chipText: {
    fontSize: Font.small,
    fontWeight: '800',
    color: Colors.ink,
  },
  chipTextSelected: { color: '#fff' },
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
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceMuted,
  },
  segmentDot: { width: 8, height: 8, borderRadius: 4 },
  segmentText: {
    fontSize: Font.small,
    fontWeight: '900',
    color: Colors.ink,
  },
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
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceMuted,
  },
  timeNumber: {
    fontSize: Font.heading - 2,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  timeUnit: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.dangerSoft,
    borderWidth: 1,
    borderColor: Colors.danger,
    marginBottom: Spacing.sm,
  },
  errorText: {
    color: Colors.danger,
    fontWeight: '800',
    fontSize: Font.small,
  },
});
