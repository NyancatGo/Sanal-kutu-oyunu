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

  useEffect(() => {
    if (state.phase !== 'result' || !state.result) {
      router.replace('/');
      return;
    }
    if (state.result === 'p1' || state.result === 'p2') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    } else if (state.result === 'none') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {},
      );
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
  }, [nameFade, questionFade, state.phase, state.result, strip, trophy]);

  if (state.phase !== 'result' || !state.result) {
    return (
      <ScreenContainer>
        <View style={styles.redirect}>
          <Text style={{ color: Colors.muted }}>Yönlendiriliyor...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const winnerName =
    state.result === 'p1'
      ? state.config.player1
      : state.result === 'p2'
      ? state.config.player2
      : null;

  const accentColor =
    state.result === 'p1'
      ? Colors.teal
      : state.result === 'p2'
      ? Colors.coral
      : Colors.muted;

  const hasWinner = !!winnerName;
  const iconName = hasWinner ? 'trophy' : 'hand-left-outline';

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
    outputRange: [14, 0],
  });
  const stripTranslate = strip.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });
  const questionTranslate = questionFade.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  return (
    <ScreenContainer scroll>
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.trophy,
            {
              backgroundColor: accentColor,
              transform: [{ scale: trophyScale }, { rotate: trophyRotate }],
            },
          ]}
        >
          <Ionicons name={iconName} size={64} color="#fff" />
          {hasWinner && <View style={styles.trophyShine} />}
        </Animated.View>

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
              size={14}
              color={accentColor}
            />
            <Text style={[styles.pillText, { color: accentColor }]}>
              {hasWinner ? 'Tur Galibi' : 'Beraberlik'}
            </Text>
          </View>
          <Text style={[styles.title, { color: accentColor }]}>
            {winnerName ? `${winnerName}!` : 'Kazanan Yok'}
          </Text>
          <Text style={styles.sub}>
            {hasWinner
              ? 'Final sorusunu doğru bildi.'
              : 'İki oyuncu da soruyu bilemedi.'}
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
            player1={state.config.player1}
            player2={state.config.player2}
            scoreP1={state.scores.p1}
            scoreP2={state.scores.p2}
            roundNumber={state.roundNumber}
            activePlayer={
              state.result === 'p1' ? 1 : state.result === 'p2' ? 2 : null
            }
          />
        </Animated.View>

        {state.currentQuestion && (
          <Animated.View
            style={[
              styles.qBox,
              {
                opacity: questionFade,
                transform: [{ translateY: questionTranslate }],
              },
            ]}
          >
            <View style={styles.qHeader}>
              <Ionicons
                name="help-buoy-outline"
                size={18}
                color={Colors.primaryDark}
              />
              <Text style={styles.qLabel}>Final Sorusu</Text>
            </View>
            <Text style={styles.qText}>{state.currentQuestion.question}</Text>
            <View style={styles.answerDivider} />
            <View style={styles.qHeader}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={Colors.success}
              />
              <Text style={styles.qAnswerLabel}>Doğru Cevap</Text>
            </View>
            <Text style={styles.qAnswerText}>
              {state.currentQuestion.answer}
            </Text>
          </Animated.View>
        )}
      </View>

      <Celebration active={hasWinner} />

      <View style={{ height: Spacing.md }} />
      <ActionButton
        label="Sonraki Tur"
        variant="primary"
        fullWidth
        icon="arrow-forward-circle"
        onPress={() => {
          dispatch({ type: 'NEW_ROUND' });
          router.replace('/code-entry');
        }}
      />
      <View style={{ height: Spacing.sm }} />
      <ActionButton
        label="Ana Menü"
        variant="outline"
        fullWidth
        icon="home-outline"
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
  trophy: {
    width: 136,
    height: 136,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
  trophyShine: {
    position: 'absolute',
    top: 18,
    right: 28,
    width: 22,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    opacity: 0.55,
    transform: [{ rotate: '-20deg' }],
  },
  titleBlock: {
    alignItems: 'center',
    gap: 6,
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
  },
  pillText: {
    fontSize: Font.small,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: Font.title + 4,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  sub: {
    color: Colors.muted,
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: Font.body * 1.35,
    fontSize: Font.body,
  },
  qBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    gap: Spacing.sm,
    ...Shadow.md,
  },
  qHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qLabel: {
    fontSize: Font.small,
    color: Colors.muted,
    textTransform: 'uppercase',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  qText: {
    fontSize: Font.body + 1,
    color: Colors.text,
    fontWeight: '800',
    lineHeight: 24,
  },
  answerDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  qAnswerLabel: {
    fontSize: Font.small,
    color: Colors.success,
    textTransform: 'uppercase',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  qAnswerText: {
    fontSize: Font.heading - 2,
    color: Colors.success,
    fontWeight: '900',
  },
});
