import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ActionButton } from '@/components/ActionButton';
import { HoldButton } from '@/components/HoldButton';
import { PlayerBadge } from '@/components/PlayerBadge';
import { QuestionCard } from '@/components/QuestionCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Timer } from '@/components/Timer';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { useTimer } from '@/hooks/useTimer';

export default function QuestionScreen() {
  const { state, dispatch } = useGame();
  const [showAnswer, setShowAnswer] = useState(false);
  const total = state.config.timeLimit || 30;
  const activeName =
    state.activePlayer === 1 ? state.config.player1 : state.config.player2;

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

  useEffect(() => {
    setShowAnswer(false);
  }, [state.currentQuestion?.id, state.activePlayer]);

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

  return (
    <ScreenContainer scroll>
      <View style={styles.topRow}>
        <PlayerBadge name={activeName} playerNumber={state.activePlayer} active />
      </View>

      <View style={styles.timerWrap}>
        <Timer remaining={remaining} total={total} />
      </View>

      <View style={{ height: Spacing.md }} />

      <QuestionCard
        category={state.currentQuestion.category}
        difficulty={state.currentQuestion.difficulty}
        question={state.currentQuestion.question}
      />

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
        <ActionButton label="Doğru" variant="success" fullWidth onPress={onCorrect} icon="checkmark" />
        <View style={{ height: Spacing.sm }} />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <ActionButton label="Yanlış" variant="danger" fullWidth onPress={onWrong} icon="close" />
          </View>
          <View style={{ width: Spacing.sm }} />
          <View style={{ flex: 1 }}>
            <ActionButton label="Süre Doldu" variant="outline" fullWidth onPress={onWrong} icon="timer-outline" />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topRow: { alignItems: 'center', marginBottom: Spacing.md },
  timerWrap: { alignItems: 'center' },
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
