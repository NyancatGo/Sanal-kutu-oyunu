import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/ScreenContainer';
import { QuestionCard } from '@/components/QuestionCard';
import { Timer } from '@/components/Timer';
import { PlayerBadge } from '@/components/PlayerBadge';
import { ActionButton } from '@/components/ActionButton';
import { Colors, Font, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { useTimer } from '@/hooks/useTimer';

export default function QuestionScreen() {
  const { state, dispatch } = useGame();
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
    if (state.phase === 'handoff') router.replace('/handoff');
    if (state.phase === 'result') router.replace('/result');
  }, [state.phase]);

  if (!state.currentQuestion) {
    return (
      <ScreenContainer>
        <Text style={{ color: Colors.muted }}>Soru bulunamadı.</Text>
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

      <Text style={styles.hint}>
        Oyuncu cevabı sözlü verir. Öğretmen sonucu işaretler.
      </Text>

      <View style={styles.actions}>
        <ActionButton label="Doğru" variant="success" fullWidth onPress={onCorrect} />
        <View style={{ height: Spacing.sm }} />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <ActionButton label="Yanlış" variant="danger" fullWidth onPress={onWrong} />
          </View>
          <View style={{ width: Spacing.sm }} />
          <View style={{ flex: 1 }}>
            <ActionButton label="Süre Doldu" variant="outline" fullWidth onPress={onWrong} />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: { alignItems: 'center', marginBottom: Spacing.md },
  timerWrap: { alignItems: 'center' },
  hint: {
    color: Colors.muted,
    fontSize: Font.small,
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  actions: { marginTop: Spacing.sm },
  row: { flexDirection: 'row' },
});
