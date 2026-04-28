import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ActionButton } from '@/components/ActionButton';
import { Celebration } from '@/components/Celebration';
import { ScoreStrip } from '@/components/ScoreStrip';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';

export default function Result() {
  const { state, dispatch } = useGame();
  const trophy = useRef(new Animated.Value(0)).current;
  const nameFade = useRef(new Animated.Value(0)).current;
  const strip = useRef(new Animated.Value(0)).current;
  const questionFade = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state.phase !== 'result' || !state.result) {
      if (state.phase === 'starter-selection') router.replace('/starter-select');
      else if (state.phase === 'ready' || state.phase === 'question' || state.phase === 'final-question') router.replace('/question');
      else if (state.phase === 'digit-reveal') router.replace('/reveal');
      else if (state.phase === 'code-entry') router.replace('/code-entry');
      else if (state.phase === 'code-handoff') router.replace('/code-handoff');
      else router.replace('/');
      return;
    }
    if (state.result === 'g1' || state.result === 'g2') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }

    Animated.sequence([
      Animated.spring(trophy, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(nameFade, {
          toValue: 1,
          duration: 340,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(strip, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(questionFade, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    glowLoop.start();
    return () => glowLoop.stop();
  }, [nameFade, questionFade, state.phase, state.result, strip, trophy, glow]);

  if (state.phase !== 'result' || !state.result) {
    return (
      <ScreenContainer>
        <View style={styles.redirect}>
          <Text style={{ color: Colors.muted }}>Yönlendiriliyor…</Text>
        </View>
      </ScreenContainer>
    );
  }

  const winnerName =
    state.result === 'g1'
      ? state.config.group1
      : state.result === 'g2'
      ? state.config.group2
      : null;

  const accentColor =
    state.result === 'g1'
      ? Colors.teal
      : state.result === 'g2'
      ? Colors.coral
      : Colors.muted;

  const hasWinner = !!winnerName;
  const iconName = hasWinner ? 'trophy' : 'hand-left-outline';
  const finalQuestion = state.finalQuestion;

  const trophyScale = trophy.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });
  const trophyRotate = trophy.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: ['-18deg', '8deg', '0deg'],
  });
  const nameTranslate = nameFade.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });
  const stripTranslate = strip.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });
  const questionTranslate = questionFade.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });
  const glowScale = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });
  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.4],
  });

  return (
    <ScreenContainer scroll>
      <View style={styles.center}>
        <View style={styles.trophyStage}>
          {hasWinner && (
            <Animated.View
              style={[
                styles.trophyGlow,
                {
                  backgroundColor: accentColor,
                  opacity: glowOpacity,
                  transform: [{ scale: glowScale }],
                },
              ]}
            />
          )}
          <Animated.View
            style={[
              styles.trophy,
              {
                backgroundColor: accentColor,
                transform: [{ scale: trophyScale }, { rotate: trophyRotate }],
              },
            ]}
          >
            <Ionicons name={iconName} size={56} color="#fff" />
            {hasWinner && <View style={styles.trophyShine} />}
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.titleBlock,
            {
              opacity: nameFade,
              transform: [{ translateY: nameTranslate }],
            },
          ]}
        >
          <View style={styles.resultPill}>
            <Ionicons
              name={hasWinner ? 'star' : 'alert-circle-outline'}
              size={12}
              color={accentColor}
            />
            <Text style={[styles.pillText, { color: accentColor }]}>
              {hasWinner ? 'OYUNUN GALİBİ' : 'KAZANAN YOK'}
            </Text>
          </View>
          <Text style={[styles.title, { color: accentColor }]}>
            {winnerName ? winnerName : 'Final Bilinemedi'}
          </Text>
          <Text style={styles.sub}>
            {hasWinner
              ? 'Final sorusunu doğru bildi ve oyunu kazandı.'
              : 'İki grup da final sorusunu bilemedi.'}
          </Text>
        </Animated.View>

        <Animated.View
          style={{
            opacity: strip,
            transform: [{ translateY: stripTranslate }],
            width: '100%',
          }}
        >
          <ScoreStrip
            group1={state.config.group1}
            group2={state.config.group2}
            digitsG1={state.revealedDigits[1]}
            digitsG2={state.revealedDigits[2]}
            activeGroup={
              state.result === 'g1' ? 1 : state.result === 'g2' ? 2 : null
            }
            centerLabel="Sonuç"
          />
        </Animated.View>

        {finalQuestion && (
          <Animated.View
            style={[
              styles.qBox,
              {
                opacity: questionFade,
                transform: [{ translateY: questionTranslate }],
              },
            ]}
          >
            <View style={styles.qSection}>
              <View style={styles.qHeader}>
                <View style={styles.qIconWrap}>
                  <Ionicons name="trophy-outline" size={14} color={Colors.coral} />
                </View>
                <Text style={styles.qLabel}>FİNAL SORUSU</Text>
              </View>
              <Text style={styles.qText}>{finalQuestion.question}</Text>
            </View>

            <View style={styles.qDivider} />

            <View style={styles.qSection}>
              <View style={styles.qHeader}>
                <View style={[styles.qIconWrap, { backgroundColor: Colors.successSoft }]}>
                  <Ionicons name="checkmark" size={14} color={Colors.success} />
                </View>
                <Text style={[styles.qLabel, { color: Colors.success }]}>DOĞRU CEVAP</Text>
              </View>
              <Text style={styles.qAnswerText}>{finalQuestion.answer}</Text>
            </View>
          </Animated.View>
        )}
      </View>

      <Celebration active={hasWinner} />

      <View style={{ height: Spacing.lg }} />
      <ActionButton
        label="Ana Menüye Dön"
        variant="primary"
        size="lg"
        fullWidth
        icon="home"
        onPress={() => {
          dispatch({ type: 'RESET_GAME' });
          router.replace('/');
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  redirect: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.md,
  },
  trophyStage: {
    width: 156,
    height: 156,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyGlow: {
    position: 'absolute',
    width: 156,
    height: 156,
    borderRadius: 78,
  },
  trophy: {
    width: 124,
    height: 124,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
  trophyShine: {
    position: 'absolute',
    top: 16,
    right: 26,
    width: 22,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    opacity: 0.55,
    transform: [{ rotate: '-20deg' }],
  },
  titleBlock: {
    alignItems: 'center',
    gap: 8,
  },
  resultPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  pillText: {
    fontSize: Font.small - 1,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: Font.title + 4,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.6,
    paddingHorizontal: Spacing.md,
  },
  sub: {
    color: Colors.muted,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: Font.body * 1.4,
    fontSize: Font.body - 1,
    paddingHorizontal: Spacing.md,
  },
  qBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    gap: Spacing.md,
    ...Shadow.sm,
  },
  qSection: { gap: Spacing.sm },
  qHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#FFF1ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qLabel: {
    fontSize: Font.small - 1,
    color: Colors.coral,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  qText: {
    fontSize: Font.body,
    color: Colors.ink,
    fontWeight: '700',
    lineHeight: Font.body * 1.5,
  },
  qDivider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  qAnswerText: {
    fontSize: Font.heading - 2,
    color: Colors.success,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
});
