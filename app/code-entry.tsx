import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Keypad } from '@/components/Keypad';
import { PlayerBadge } from '@/components/PlayerBadge';
import { ActionButton } from '@/components/ActionButton';
import { Colors, Font, Radius, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { validateCode } from '@/utils/validateCode';
import { getRandomQuestion } from '@/utils/getRandomQuestion';

const LOCK_MS = 3000;

export default function CodeEntry() {
  const { state, dispatch } = useGame();
  const [input, setInput] = useState('');
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    if (state.phase !== 'code') return;
    const id = setInterval(() => setNowTick(Date.now()), 250);
    return () => clearInterval(id);
  }, [state.phase]);

  const locked = nowTick < state.lockUntil;
  const lockRemaining = locked ? Math.ceil((state.lockUntil - nowTick) / 1000) : 0;

  useEffect(() => {
    if (state.phase === 'question') {
      router.replace('/question');
    }
  }, [state.phase]);

  const handleDigit = (d: string) => {
    if (locked) return;
    if (input.length >= 8) return;
    setInput((prev) => prev + d);
    if (state.lastCodeError) dispatch({ type: 'CLEAR_CODE_ERROR' });
  };

  const handleClear = () => {
    if (locked) return;
    setInput('');
    if (state.lastCodeError) dispatch({ type: 'CLEAR_CODE_ERROR' });
  };

  const handleSubmit = () => {
    const result = validateCode(input, state.config.secretCode, Date.now(), state.lockUntil);
    if (!result.ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      dispatch({
        type: 'CODE_FAIL',
        payload: {
          lockUntil: result.reason === 'mismatch' ? Date.now() + LOCK_MS : state.lockUntil,
          message: result.message,
        },
      });
      setInput('');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const question = getRandomQuestion(
      state.config.category,
      state.config.difficulty,
      state.usedQuestionIds,
    );
    dispatch({ type: 'CODE_SUCCESS', payload: { question } });
  };

  const maskedInput =
    input.length === 0
      ? '— — — —'
      : input.split('').map(() => '●').join(' ');

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <PlayerBadge name={state.config.player1} playerNumber={1} compact />
        <Text style={styles.vs}>vs</Text>
        <PlayerBadge name={state.config.player2} playerNumber={2} compact />
      </View>

      <View style={styles.centerBlock}>
        <Text style={styles.vaultEmoji}>🗝️</Text>
        <Text style={styles.title}>Şifreyi Gir</Text>
        <Text style={styles.sub}>Kartlardan çözdüğünüz kodu yazın.</Text>

        <View style={[styles.display, locked && styles.displayLocked]}>
          <Text style={styles.displayText}>{maskedInput}</Text>
        </View>

        <View style={styles.statusRow}>
          {locked ? (
            <Text style={styles.lockText}>
              Kilitli · {lockRemaining} sn
            </Text>
          ) : state.lastCodeError ? (
            <Text style={styles.errorText}>{state.lastCodeError}</Text>
          ) : (
            <Text style={styles.hintText}>{input.length} hane</Text>
          )}
        </View>
      </View>

      <Keypad
        onDigit={handleDigit}
        onClear={handleClear}
        onSubmit={handleSubmit}
        disabled={locked}
      />

      <View style={{ height: Spacing.md }} />
      <ActionButton
        label="Kuruluma Dön"
        variant="ghost"
        onPress={() => router.replace('/setup')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  vs: { fontWeight: '800', color: Colors.muted },
  centerBlock: { alignItems: 'center', gap: Spacing.xs, marginVertical: Spacing.md },
  vaultEmoji: { fontSize: 56 },
  title: { fontSize: Font.title, fontWeight: '800', color: Colors.primaryDark },
  sub: { color: Colors.muted, marginBottom: Spacing.md },
  display: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    minWidth: 220,
    alignItems: 'center',
  },
  displayLocked: { borderColor: Colors.danger },
  displayText: {
    fontSize: Font.huge - 12,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 2,
  },
  statusRow: { minHeight: 28, marginTop: 8, justifyContent: 'center' },
  lockText: { color: Colors.danger, fontWeight: '700' },
  errorText: { color: Colors.danger, fontWeight: '600' },
  hintText: { color: Colors.muted, fontSize: Font.small },
});
