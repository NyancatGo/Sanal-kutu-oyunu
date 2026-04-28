import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ActionButton } from '@/components/ActionButton';
import { ScoreStrip } from '@/components/ScoreStrip';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { getRandomQuestion } from '@/utils/getRandomQuestion';

export default function Reveal() {
  const { state, dispatch } = useGame();
  const cardAnim = useRef(new Animated.Value(0)).current;
  const digitAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state.phase !== 'digit-reveal') {
      if (state.phase === 'setup') router.replace('/');
      else if (state.phase === 'starter-selection') router.replace('/starter-select');
      else if (state.phase === 'ready' || state.phase === 'question' || state.phase === 'final-question') router.replace('/question');
      else if (state.phase === 'code-entry') router.replace('/code-entry');
      else if (state.phase === 'code-handoff') router.replace('/code-handoff');
      else if (state.phase === 'result') router.replace('/result');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    cardAnim.setValue(0);
    digitAnim.setValue(0);
    shineAnim.setValue(0);
    ringAnim.setValue(0);

    const shineLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    const ringLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    Animated.parallel([
      Animated.spring(cardAnim, {
        toValue: 1,
        tension: 150,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.spring(digitAnim, {
        toValue: 1,
        tension: 180,
        friction: 8,
        useNativeDriver: true,
      }),
      shineLoop,
      ringLoop,
    ]).start();
    return () => {
      shineLoop.stop();
      ringLoop.stop();
    };
  }, [cardAnim, digitAnim, shineAnim, ringAnim, state.phase]);

  if (state.phase !== 'digit-reveal' || !state.lastDigitReveal) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={{ color: Colors.muted }}>Yönlendiriliyor…</Text>
        </View>
      </ScreenContainer>
    );
  }

  const { groupId, digit, position } = state.lastDigitReveal;
  const groupName = groupId === 1 ? state.config.group1 : state.config.group2;
  const accent = groupId === 1 ? Colors.teal : Colors.coral;
  const revealedCount = state.revealedDigits[groupId].length;
  const completed = revealedCount >= 4;
  const cardScale = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });
  const digitScale = digitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });
  const shineTranslate = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 50],
  });
  const ringScale = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });
  const ringOpacity = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0],
  });

  const continueFlow = () => {
    const nextQuestion =
      completed
        ? null
        : getRandomQuestion(
            state.config.digitCategory,
            state.config.digitDifficulty,
            state.usedQuestionIds,
          );
    dispatch({
      type: 'CONTINUE_AFTER_DIGIT_REVEAL',
      payload: { nextQuestion },
    });
    router.replace(completed ? '/code-entry' : '/question');
  };

  return (
    <ScreenContainer>
      <ScoreStrip
        group1={state.config.group1}
        group2={state.config.group2}
        digitsG1={state.revealedDigits[1]}
        digitsG2={state.revealedDigits[2]}
        activeGroup={groupId}
        centerLabel="Hane"
      />

      <View style={styles.center}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardAnim,
              transform: [{ scale: cardScale }],
              borderColor: accent,
            },
          ]}
        >
          <View style={styles.kickerRow}>
            <View style={[styles.kickerDot, { backgroundColor: accent }]} />
            <Text style={[styles.kicker, { color: accent }]}>
              {position + 1}. HANE AÇILDI
            </Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {groupName || `Grup ${groupId}`}
          </Text>

          <View style={styles.digitStage}>
            <Animated.View
              style={[
                styles.ring,
                {
                  borderColor: accent,
                  transform: [{ scale: ringScale }],
                  opacity: ringOpacity,
                },
              ]}
            />
            <Animated.View
              style={[styles.digitBox, { transform: [{ scale: digitScale }] }]}
            >
              <Animated.View
                style={[
                  styles.shine,
                  {
                    transform: [{ translateX: shineTranslate }, { rotate: '-22deg' }],
                  },
                ]}
              />
              <Text style={styles.digit}>{digit}</Text>
              <View style={styles.digitFooter}>
                <Text style={styles.digitFooterText}>POZİSYON {position + 1}</Text>
              </View>
            </Animated.View>
          </View>

          <View style={styles.progressRow}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i < revealedCount && {
                    backgroundColor: accent,
                  },
                ]}
              />
            ))}
          </View>

          <Text style={styles.sub}>
            {completed
              ? 'Dört hane tamamlandı! Şimdi kağıttaki şifreyi kilide girebilirsiniz.'
              : 'Bu haneyi kağıda yazın. Sıra diğer gruba geçiyor.'}
          </Text>
        </Animated.View>
      </View>

      <ActionButton
        label={completed ? 'Kilidi Açmaya Geç' : 'Sıradaki Soruya Geç'}
        variant="primary"
        size="lg"
        fullWidth
        icon={completed ? 'lock-open' : 'arrow-forward-circle'}
        onPress={continueFlow}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    paddingVertical: Spacing.xl,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    ...Shadow.lg,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kickerDot: { width: 8, height: 8, borderRadius: 4 },
  kicker: {
    fontSize: Font.small - 1,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  title: {
    color: Colors.ink,
    fontSize: Font.heading,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.4,
    maxWidth: '100%',
  },
  digitStage: {
    width: 160,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.sm,
  },
  ring: {
    position: 'absolute',
    width: 130,
    height: 145,
    borderRadius: 28,
    borderWidth: 3,
  },
  digitBox: {
    width: 130,
    height: 145,
    borderRadius: 26,
    backgroundColor: Colors.ink,
    borderWidth: 3,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Shadow.lg,
  },
  shine: {
    position: 'absolute',
    width: 36,
    height: 220,
    backgroundColor: '#fff',
    opacity: 0.18,
  },
  digit: {
    color: Colors.accent,
    fontSize: Font.huge + 16,
    fontWeight: '900',
    lineHeight: Font.huge + 18,
    letterSpacing: -2,
  },
  digitFooter: {
    position: 'absolute',
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(245,189,61,0.4)',
  },
  digitFooterText: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sub: {
    color: Colors.muted,
    fontSize: Font.small + 1,
    fontWeight: '600',
    lineHeight: (Font.small + 1) * 1.5,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  progressDot: {
    width: 36,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.divider,
  },
});
