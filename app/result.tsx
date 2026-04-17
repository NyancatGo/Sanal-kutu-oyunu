import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ActionButton } from '@/components/ActionButton';
import { Celebration } from '@/components/Celebration';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';

export default function Result() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (state.phase !== 'result' || !state.result) {
      router.replace('/');
      return;
    }
    if (state.result === 'p1' || state.result === 'p2') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else if (state.result === 'none') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
  }, [state.phase, state.result]);

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
    state.result === 'p1' ? Colors.teal : state.result === 'p2' ? Colors.coral : Colors.muted;

  const title = winnerName ? `${winnerName} kazandı!` : 'Kazanan Yok';
  const sub = winnerName
    ? 'Final sorusunu bilen oyuncu tur galibi.'
    : 'İki oyuncu da soruyu bilemedi. Tekrar dene!';

  const hasWinner = !!winnerName;

  return (
    <ScreenContainer scroll>
      <View style={styles.center}>
        <View style={[styles.trophy, { backgroundColor: accentColor }]}>
          <Ionicons name={hasWinner ? 'trophy' : 'hand-left-outline'} size={62} color="#fff" />
        </View>
        <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
        <Text style={styles.sub}>{sub}</Text>

        {state.currentQuestion && (
          <View style={styles.qBox}>
            <Text style={styles.qLabel}>Final sorusu</Text>
            <Text style={styles.qText}>{state.currentQuestion.question}</Text>
            <View style={styles.answerDivider} />
            <Text style={styles.qAnswerLabel}>Cevap</Text>
            <Text style={styles.qAnswerText}>{state.currentQuestion.answer}</Text>
          </View>
        )}
      </View>
      <Celebration active={hasWinner} />

      <ActionButton
        label="Yeni Oyun"
        variant="primary"
        fullWidth
        icon="reload"
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
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  trophy: {
    width: 132,
    height: 132,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.lg,
  },
  title: { fontSize: Font.title + 2, fontWeight: '900', textAlign: 'center' },
  sub: {
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontWeight: '700',
    lineHeight: Font.body * 1.35,
  },
  qBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    gap: 7,
    ...Shadow.md,
  },
  qLabel: {
    fontSize: Font.small,
    color: Colors.muted,
    textTransform: 'uppercase',
    fontWeight: '900',
  },
  qText: { fontSize: Font.body + 1, color: Colors.text, fontWeight: '800', lineHeight: 24 },
  answerDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  qAnswerLabel: {
    fontSize: Font.small,
    color: Colors.muted,
    textTransform: 'uppercase',
    fontWeight: '900',
  },
  qAnswerText: {
    fontSize: Font.body + 1,
    color: Colors.success,
    fontWeight: '900',
  },
});
