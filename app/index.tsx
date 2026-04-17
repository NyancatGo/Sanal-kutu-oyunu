import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { HoldButton } from '@/components/HoldButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';

const STEPS = [
  { icon: 'school-outline', text: 'Öğretmen oyunu kurar', detail: 'Şifre, kategori & zorluk' },
  { icon: 'extension-puzzle-outline', text: 'Kartlardan şifre çözülür', detail: 'Fiziksel ipuçları' },
  { icon: 'lock-open-outline', text: 'Kilit doğru kodla açılır', detail: '4 haneli mekanik kilit' },
  { icon: 'trophy-outline', text: 'Final sorusu kazandırır', detail: 'Sözlü cevap, öğretmen puanlar' },
] as const;

export default function Home() {
  const { dispatch } = useGame();
  const float = useRef(new Animated.Value(0)).current;
  const spark = useRef(new Animated.Value(0)).current;
  const heroFade = useRef(new Animated.Value(0)).current;
  const stepAnims = useRef(STEPS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Hero entrance
    Animated.timing(heroFade, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Step cards stagger entrance
    Animated.stagger(
      100,
      stepAnims.map((a) =>
        Animated.spring(a, {
          toValue: 1,
          tension: 120,
          friction: 10,
          useNativeDriver: true,
        }),
      ),
    ).start();

    // Lock float loop
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    const sparkLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(spark, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(spark, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    floatLoop.start();
    sparkLoop.start();
    return () => {
      floatLoop.stop();
      sparkLoop.stop();
    };
  }, [float, spark, heroFade, stepAnims]);

  const bodyTranslate = float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const shackleTranslate = float.interpolate({ inputRange: [0, 1], outputRange: [0, -2] });
  const sparkOpacity = spark.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.9] });
  const heroScale = heroFade.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
  const heroTranslateY = heroFade.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <ScreenContainer scroll>
      <Animated.View
        style={[
          styles.hero,
          {
            opacity: heroFade,
            transform: [{ scale: heroScale }, { translateY: heroTranslateY }],
          },
        ]}
      >
        {/* Decorative glow behind lock */}
        <View style={styles.heroGlow} />

        <View style={styles.lockScene}>
          <Animated.View
            style={[styles.shackle, { transform: [{ translateY: shackleTranslate }] }]}
          />
          <Animated.View
            style={[styles.lockBody, { transform: [{ translateY: bodyTranslate }] }]}
          >
            <Ionicons name="lock-closed" size={54} color={Colors.ink} />
            <Animated.View style={[styles.lockSpark, { opacity: sparkOpacity }]} />
          </Animated.View>
        </View>

        <View style={styles.titleBlock}>
          <View style={styles.badgePill}>
            <Ionicons name="game-controller-outline" size={12} color={Colors.primary} />
            <Text style={styles.eyebrow}>Hibrit eğitsel challenge</Text>
          </View>
          <Text style={styles.title}>Şifre Kutusu</Text>
          <Text style={styles.subtitle}>
            Fiziksel ipuçlarını çöz, sanal kilidi aç, final sorusunda turu kazan.
          </Text>
        </View>
      </Animated.View>

      <View style={styles.sectionLabel}>
        <Ionicons name="list-outline" size={16} color={Colors.primary} />
        <Text style={styles.sectionLabelText}>Nasıl Oynanır?</Text>
      </View>

      <View style={styles.steps}>
        {STEPS.map((step, index) => {
          const anim = stepAnims[index];
          const translateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          });
          return (
            <Animated.View
              key={step.text}
              style={[
                styles.step,
                { opacity: anim, transform: [{ translateY }] },
              ]}
            >
              <View style={styles.stepLeft}>
                <View style={styles.stepNumBadge}>
                  <Text style={styles.stepNum}>{index + 1}</Text>
                </View>
                {index < STEPS.length - 1 && <View style={styles.stepLine} />}
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepIcon}>
                  <Ionicons name={step.icon} size={20} color={Colors.primaryDark} />
                </View>
                <View style={styles.stepTextBlock}>
                  <Text style={styles.stepText}>{step.text}</Text>
                  <Text style={styles.stepDetail}>{step.detail}</Text>
                </View>
              </View>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.teacherPanel}>
        <View style={styles.teacherHeader}>
          <View style={styles.teacherBadge}>
            <Ionicons name="school" size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.teacherTitle}>Öğretmen Paneli</Text>
            <Text style={styles.teacherSub}>Kurulum ekranı basılı tutma ile açılır.</Text>
          </View>
        </View>
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
    paddingBottom: Spacing.sm,
  },
  heroGlow: {
    position: 'absolute',
    top: 20,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.accent,
    opacity: 0.12,
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
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.softBlue,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
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
    paddingHorizontal: Spacing.sm,
  },
  // ── Section label ──
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    paddingLeft: 4,
  },
  sectionLabelText: {
    fontSize: Font.small,
    color: Colors.primary,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // ── Steps ──
  steps: { gap: 0 },
  step: {
    flexDirection: 'row',
    gap: Spacing.sm,
    minHeight: 72,
  },
  stepLeft: {
    alignItems: 'center',
    width: 30,
  },
  stepNumBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    color: '#fff',
    fontWeight: '900',
    fontSize: Font.small,
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  stepContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.sm,
    paddingLeft: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
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
  stepTextBlock: {
    flex: 1,
    gap: 2,
    paddingTop: 2,
  },
  stepText: { color: Colors.text, fontSize: Font.body, fontWeight: '800' },
  stepDetail: { color: Colors.muted, fontSize: Font.small - 1, fontWeight: '600' },
  // ── Teacher panel ──
  teacherPanel: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    ...Shadow.md,
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  teacherBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherTitle: { color: Colors.primaryDark, fontSize: Font.heading - 2, fontWeight: '900' },
  teacherSub: { color: Colors.muted, fontWeight: '700', fontSize: Font.small },
});
