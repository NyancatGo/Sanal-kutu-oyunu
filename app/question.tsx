import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ActionButton } from '@/components/ActionButton';
import { HoldButton } from '@/components/HoldButton';
import { QuestionCard } from '@/components/QuestionCard';
import { ScoreStrip } from '@/components/ScoreStrip';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Timer } from '@/components/Timer';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { useTimer } from '@/hooks/useTimer';

export default function QuestionScreen() {
  const { state, dispatch } = useGame();
  const [showAnswer, setShowAnswer] = useState(false);
  const total = state.config.timeLimit || 30;

  const handleTimeout = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    dispatch({ type: 'ANSWER_WRONG_OR_TIMEOUT' });
  }, [dispatch]);

  const { remaining } = useTimer({
    seconds: total,
    running: state.phase === 'question',
    onExpire: handleTimeout,
    resetKey: `${state.activePlayer}-${state.currentQuestion?.id}`,
  });

  // Entrance animations — re-run when question or active player changes.
  const timerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const decisionAnim = useRef(new Animated.Value(0)).current;
  const secondaryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setShowAnswer(false);

    timerAnim.setValue(0);
    cardAnim.setValue(0);
    decisionAnim.setValue(0);
    secondaryAnim.setValue(0);

    Animated.sequence([
      Animated.spring(timerAnim, {
        toValue: 1,
        tension: 140,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.stagger(90, [
        Animated.spring(decisionAnim, {
          toValue: 1,
          tension: 160,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(secondaryAnim, {
          toValue: 1,
          tension: 160,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [
    state.currentQuestion?.id,
    state.activePlayer,
    cardAnim,
    decisionAnim,
    secondaryAnim,
    timerAnim,
  ]);

  useEffect(() => {
    if (state.phase === 'setup') router.replace('/');
    else if (state.phase === 'code') router.replace('/code-entry');
    else if (state.phase === 'reveal') router.replace('/reveal');
    else if (state.phase === 'handoff') router.replace('/handoff');
    else if (state.phase === 'result') router.replace('/result');
  }, [state.phase]);

  if (!state.currentQuestion || state.phase !== 'question') {
    return (
      <ScreenContainer>
        <View style={styles.loading}>
          <Text style={{ color: Colors.muted }}>Hazırlanıyor...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const onCorrect = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    dispatch({ type: 'ANSWER_CORRECT' });
  };
  const onWrong = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    dispatch({ type: 'ANSWER_WRONG_OR_TIMEOUT' });
  };
  const { answer, teacherNote } = state.currentQuestion;

  const timerScale = timerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });
  const timerTranslate = timerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 0],
  });
  const cardTranslate = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 0],
  });
  const decisionTranslate = decisionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });
  const secondaryTranslate = secondaryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });

  const attemptLabel = state.firstAttempterFailed ? 'İkinci Deneme' : 'İlk Deneme';
  const attemptColor = state.firstAttempterFailed ? Colors.coral : Colors.teal;

  return (
    <ScreenContainer scroll>
      <ScoreStrip
        player1={state.config.player1}
        player2={state.config.player2}
        scoreP1={state.scores.p1}
        scoreP2={state.scores.p2}
        roundNumber={state.roundNumber}
        activePlayer={state.activePlayer}
      />

      <View style={styles.attemptRow}>
        <View style={[styles.attemptPill, { borderColor: attemptColor }]}>
          <Ionicons
            name={state.firstAttempterFailed ? 'refresh' : 'flash'}
            size={12}
            color={attemptColor}
          />
          <Text style={[styles.attemptText, { color: attemptColor }]}>
            {attemptLabel}
          </Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.timerWrap,
          {
            opacity: timerAnim,
            transform: [{ scale: timerScale }, { translateY: timerTranslate }],
          },
        ]}
      >
        <Timer remaining={remaining} total={total} />
      </Animated.View>

      <View style={{ height: Spacing.md }} />

      <Animated.View
        style={{
          opacity: cardAnim,
          transform: [{ translateY: cardTranslate }],
        }}
      >
        <QuestionCard
          category={state.currentQuestion.category}
          difficulty={state.currentQuestion.difficulty}
          question={state.currentQuestion.question}
        />
      </Animated.View>

      {showAnswer ? (
        <Pressable
          onPress={() => setShowAnswer(false)}
          style={({ pressed }) => [
            styles.answerBox,
            styles.answerBoxRevealed,
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={styles.answerHeader}>
            <Ionicons name="eye-off-outline" size={18} color={Colors.success} />
            <Text style={styles.answerLabel}>Gizlemek için dokun</Text>
          </View>
          <Text style={styles.answerText}>{answer}</Text>
          {teacherNote && <Text style={styles.noteText}>{teacherNote}</Text>}
        </Pressable>
      ) : (
        <HoldButton
          label="Öğretmen · Cevabı Göster"
          holdLabel="Açılıyor..."
          icon="eye-outline"
          durationMs={900}
          onComplete={() => setShowAnswer(true)}
          style={styles.answerHold}
        />
      )}

      <Text style={styles.hint}>Oyuncu sözlü cevap verir. Öğretmen sonucu işaretler.</Text>

      <View style={styles.actions}>
        <Animated.View
          style={{
            opacity: decisionAnim,
            transform: [{ translateY: decisionTranslate }],
          }}
        >
          <ActionButton
            label="Doğru"
            variant="success"
            fullWidth
            onPress={onCorrect}
            icon="checkmark-circle"
          />
        </Animated.View>

        <View style={{ height: Spacing.sm }} />

        <Animated.View
          style={{
            opacity: secondaryAnim,
            transform: [{ translateY: secondaryTranslate }],
          }}
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <ActionButton
                label="Yanlış"
                variant="danger"
                fullWidth
                onPress={onWrong}
                icon="close-circle"
              />
            </View>
            <View style={{ width: Spacing.sm }} />
            <View style={{ flex: 1 }}>
              <ActionButton
                label="Süre Doldu"
                variant="outline"
                fullWidth
                onPress={onWrong}
                icon="timer-outline"
              />
            </View>
          </View>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  timerWrap: { alignItems: 'center' },
  attemptRow: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  attemptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    backgroundColor: Colors.surface,
  },
  attemptText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hint: {
    color: Colors.muted,
    fontSize: Font.small,
    textAlign: 'center',
    marginVertical: Spacing.md,
    fontWeight: '700',
  },
  actions: { marginTop: Spacing.sm },
  row: { flexDirection: 'row' },
  answerBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 8,
    ...Shadow.sm,
  },
  answerBoxRevealed: {
    borderColor: Colors.success,
    backgroundColor: Colors.successSoft,
  },
  answerHold: { marginTop: Spacing.md, borderColor: Colors.muted },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  answerLabel: {
    fontSize: Font.small,
    color: Colors.muted,
    fontWeight: '800',
    textAlign: 'center',
  },
  answerText: {
    fontSize: Font.body + 2,
    fontWeight: '900',
    color: Colors.success,
    textAlign: 'center',
  },
  noteText: {
    fontSize: Font.small,
    color: Colors.muted,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '700',
  },
});
