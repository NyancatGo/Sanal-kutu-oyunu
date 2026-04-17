import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { HoldButton } from '@/components/HoldButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';

const STEPS = [
  { icon: 'school-outline', text: 'Öğretmen oyunu kurar' },
  { icon: 'extension-puzzle-outline', text: 'Kartlardan şifre çözülür' },
  { icon: 'lock-open-outline', text: 'Kilit doğru kodla açılır' },
  { icon: 'trophy-outline', text: 'Final sorusu kazandırır' },
] as const;

export default function Home() {
  const { dispatch } = useGame();
  return (
    <ScreenContainer scroll>
      <View style={styles.hero}>
        <View style={styles.lockScene}>
          <View style={styles.shackle} />
          <View style={styles.lockBody}>
            <Ionicons name="lock-closed" size={54} color={Colors.ink} />
            <View style={styles.lockSpark} />
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Hibrit eğitsel challenge</Text>
          <Text style={styles.title}>Şifre Kutusu</Text>
          <Text style={styles.subtitle}>
            Fiziksel ipuçlarını çöz, sanal kilidi aç, final sorusunda turu kazan.
          </Text>
        </View>
      </View>

      <View style={styles.steps}>
        {STEPS.map((step, index) => (
          <View key={step.text} style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name={step.icon} size={20} color={Colors.primaryDark} />
            </View>
            <Text style={styles.stepNum}>{index + 1}</Text>
            <Text style={styles.stepText}>{step.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.teacherPanel}>
        <Text style={styles.teacherTitle}>Öğretmen paneli</Text>
        <Text style={styles.teacherSub}>Kurulum ekranı basılı tutma ile açılır.</Text>
        <HoldButton
          label="Oyunu Kur"
          holdLabel="Açılıyor..."
          icon="school-outline"
          onComplete={() => {
            dispatch({ type: 'UNLOCK_TEACHER' });
            router.push('/setup');
          }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingTop: Spacing.md,
  },
  lockScene: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  shackle: {
    position: 'absolute',
    top: 4,
    width: 120,
    height: 112,
    borderTopWidth: 16,
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderColor: Colors.teal,
    borderTopLeftRadius: 64,
    borderTopRightRadius: 64,
  },
  lockBody: {
    width: 146,
    height: 122,
    borderRadius: 34,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E3A90E',
    ...Shadow.lg,
  },
  lockSpark: {
    position: 'absolute',
    right: 22,
    top: 20,
    width: 26,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface,
    opacity: 0.75,
    transform: [{ rotate: '-18deg' }],
  },
  titleBlock: { alignItems: 'center', gap: Spacing.sm },
  eyebrow: {
    color: Colors.primary,
    fontSize: Font.small,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: Font.title + 8,
    fontWeight: '900',
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Font.body,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: Font.body * 1.45,
  },
  steps: { marginTop: Spacing.xl, gap: Spacing.sm },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  stepIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    color: Colors.teal,
    fontWeight: '900',
    fontSize: Font.body + 2,
    width: 22,
    textAlign: 'center',
  },
  stepText: { color: Colors.text, fontSize: Font.body, fontWeight: '800', flex: 1 },
  teacherPanel: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    ...Shadow.md,
  },
  teacherTitle: { color: Colors.primaryDark, fontSize: Font.heading, fontWeight: '900' },
  teacherSub: { color: Colors.muted, fontWeight: '700', lineHeight: Font.body * 1.35 },
});
