import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ActionButton } from '@/components/ActionButton';
import { Celebration } from '@/components/Celebration';
import { Colors, Font, Radius, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';

export default function Result() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (state.result === 'p1' || state.result === 'p2') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else if (state.result === 'none') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
  }, [state.result]);

  const winnerName =
    state.result === 'p1'
      ? state.config.player1
      : state.result === 'p2'
      ? state.config.player2
      : null;

  const accentColor =
    state.result === 'p1'
      ? Colors.primary
      : state.result === 'p2'
      ? Colors.highlight
      : Colors.muted;

  const title = winnerName ? `${winnerName} kazandı!` : 'Kazanan Yok';
  const emoji = winnerName ? '🏆' : '🤝';
  const sub = winnerName
    ? 'Final sorusunu bilen oyuncu tur galibi.'
    : 'İki oyuncu da soruyu bilemedi. Tekrar dene!';

  const hasWinner = !!winnerName;

  return (
    <ScreenContainer>
      <View style={styles.center}>
        <View style={[styles.trophy, { backgroundColor: accentColor }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
        <Text style={styles.sub}>{sub}</Text>

        {state.currentQuestion && (
          <View style={styles.qBox}>
            <Text style={styles.qLabel}>Final sorusu</Text>
            <Text style={styles.qText}>{state.currentQuestion.question}</Text>
            <Text style={styles.qAnswerLabel}>Cevap</Text>
            <Text style={styles.qAnswerText}>{state.currentQuestion.answer}</Text>
          </View>
        )}
      </View>
      <Celebration active={hasWinner} />

      <ActionButton
        label="Yeni Oyun (aynı ayar)"
        variant="primary"
        fullWidth
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
        onPress={() => {
          dispatch({ type: 'RESET_GAME' });
          router.replace('/');
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  trophy: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  emoji: { fontSize: 72 },
  title: { fontSize: Font.title + 2, fontWeight: '800', textAlign: 'center' },
  sub: { color: Colors.muted, textAlign: 'center', marginBottom: Spacing.lg },
  qBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    gap: 6,
  },
  qLabel: {
    fontSize: Font.small,
    color: Colors.muted,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  qText: { fontSize: Font.body + 1, color: Colors.text, fontWeight: '600' },
  qAnswerLabel: {
    fontSize: Font.small,
    color: Colors.muted,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
  },
  qAnswerText: {
    fontSize: Font.body + 1,
    color: Colors.success,
    fontWeight: '800',
  },
});
