import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CombinationLock, type CombinationLockStatus } from '@/components/CombinationLock';
import { HoldButton } from '@/components/HoldButton';
import { PlayerBadge } from '@/components/PlayerBadge';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Font, Shadow, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { getRandomQuestion } from '@/utils/getRandomQuestion';
import { validateCode } from '@/utils/validateCode';

const LOCK_MS = 3000;
const EMPTY_CODE = [0, 0, 0, 0];

export default function CodeEntry() {
  const { state, dispatch } = useGame();
  const [digits, setDigits] = useState(EMPTY_CODE);
  const [lockStatus, setLockStatus] = useState<CombinationLockStatus>('idle');
  const [nowTick, setNowTick] = useState(Date.now());
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state.phase !== 'code') return;
    const id = setInterval(() => setNowTick(Date.now()), 250);
    return () => clearInterval(id);
  }, [state.phase]);

  useEffect(
    () => () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    },
    [],
  );

  const locked = nowTick < state.lockUntil;
  const lockRemaining = locked ? Math.ceil((state.lockUntil - nowTick) / 1000) : 0;
  const displayedStatus: CombinationLockStatus = locked ? 'locked' : lockStatus;

  useEffect(() => {
    if (state.phase === 'setup') router.replace('/');
    else if (state.phase === 'reveal') router.replace('/reveal');
    else if (state.phase === 'question') router.replace('/question');
    else if (state.phase === 'handoff') router.replace('/handoff');
    else if (state.phase === 'result') router.replace('/result');
  }, [state.phase]);

  useEffect(() => {
    if (!locked && lockStatus === 'error') {
      setLockStatus('idle');
    }
  }, [locked, lockStatus]);

  const handleDigitsChange = (nextDigits: number[]) => {
    if (locked) return;
    setDigits(nextDigits);
    if (lockStatus !== 'idle') setLockStatus('idle');
    if (state.lastCodeError) dispatch({ type: 'CLEAR_CODE_ERROR' });
  };

  const handleReset = () => {
    if (locked) return;
    setDigits(EMPTY_CODE);
    setLockStatus('idle');
    if (state.lastCodeError) dispatch({ type: 'CLEAR_CODE_ERROR' });
  };

  const handleSubmit = () => {
    const result = validateCode(digits.join(''), state.config.secretCode, Date.now(), state.lockUntil);
    if (!result.ok) {
      setLockStatus('error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      dispatch({
        type: 'CODE_FAIL',
        payload: {
          lockUntil: result.reason === 'mismatch' ? Date.now() + LOCK_MS : state.lockUntil,
          message: result.message,
        },
      });
      setDigits(EMPTY_CODE);
      return;
    }

    setLockStatus('success');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const question = getRandomQuestion(
      state.config.category,
      state.config.difficulty,
      state.usedQuestionIds,
    );
    successTimer.current = setTimeout(() => {
      dispatch({ type: 'CODE_SUCCESS', payload: { question } });
    }, 320);
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <PlayerBadge name={state.config.player1} playerNumber={1} compact />
        <Text style={styles.vs}>vs</Text>
        <PlayerBadge name={state.config.player2} playerNumber={2} compact />
      </View>

      <View style={styles.centerBlock}>
        <View style={styles.kicker}>
          <Text style={styles.kickerText}>Şifre Kutusu</Text>
        </View>
        <Text style={styles.title}>Kilidi Çöz</Text>
        <Text style={styles.sub}>Kartlardan gelen 4 haneli kodu kilitte ayarla.</Text>

        <CombinationLock
          digits={digits}
          onChange={handleDigitsChange}
          onReset={handleReset}
          onSubmit={handleSubmit}
          disabled={locked || lockStatus === 'success'}
          status={displayedStatus}
          lockRemaining={lockRemaining}
        />

        <View style={styles.statusRow}>
          {locked ? (
            <Text style={styles.lockText}>Kilitli · {lockRemaining} sn</Text>
          ) : state.lastCodeError ? (
            <Text style={styles.errorText}>{state.lastCodeError}</Text>
          ) : (
            <Text style={styles.hintText}>Mekanik kilit hazır</Text>
          )}
        </View>
      </View>

      <View style={{ height: Spacing.md }} />
      <HoldButton
        label="Öğretmen · Kuruluma Dön"
        holdLabel="Açılıyor..."
        icon="school-outline"
        onComplete={() => {
          dispatch({ type: 'UNLOCK_TEACHER' });
          router.replace('/setup');
        }}
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
  vs: { fontWeight: '900', color: Colors.muted },
  centerBlock: { alignItems: 'center', gap: Spacing.xs, marginVertical: Spacing.md },
  kicker: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    backgroundColor: Colors.cream,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.accent,
    ...Shadow.sm,
  },
  kickerText: {
    color: Colors.primaryDark,
    fontSize: Font.small,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: Font.title + 2,
    fontWeight: '900',
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  sub: {
    color: Colors.muted,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    lineHeight: Font.body * 1.35,
  },
  statusRow: {
    minHeight: 30,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockText: { color: Colors.danger, fontWeight: '800' },
  errorText: { color: Colors.danger, fontWeight: '700' },
  hintText: { color: Colors.muted, fontSize: Font.small },
});
