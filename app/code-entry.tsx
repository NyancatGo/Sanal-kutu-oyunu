import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CombinationLock, type CombinationLockStatus } from '@/components/CombinationLock';
import { HoldButton } from '@/components/HoldButton';
import { ScoreStrip } from '@/components/ScoreStrip';
import { ScreenContainer } from '@/components/ScreenContainer';
import {
  CODE_TIME_LIMIT,
  Colors,
  Font,
  LOCK_MS,
  Radius,
  Shadow,
  Spacing,
} from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { useTimer } from '@/hooks/useTimer';
import { getRandomQuestion } from '@/utils/getRandomQuestion';
import { validateCode } from '@/utils/validateCode';

const EMPTY_CODE = [0, 0, 0, 0];

export default function CodeEntry() {
  const { state, dispatch } = useGame();
  const [digits, setDigits] = useState(EMPTY_CODE);
  const [lockStatus, setLockStatus] = useState<CombinationLockStatus>('idle');
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (state.phase !== 'code') return;
    setDigits(EMPTY_CODE);
    setLockStatus('idle');
  }, [state.phase, state.activePlayer]);

  useEffect(() => {
    if (state.phase === 'setup') router.replace('/');
    else if (state.phase === 'player-select') router.replace('/player-select');
    else if (state.phase === 'reveal') router.replace('/reveal');
    else if (state.phase === 'question') router.replace('/question');
    else if (state.phase === 'result') router.replace('/result');
  }, [state.phase]);

  const handleTimeout = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
      () => {},
    );
    dispatch({
      type: 'CODE_FAIL',
      payload: {
        playerId: state.activePlayer,
        cooldownUntil: Date.now() + LOCK_MS,
        message: 'Süre doldu.',
      },
    });
  }, [dispatch, state.activePlayer]);

  const { remaining } = useTimer({
    seconds: CODE_TIME_LIMIT,
    running: state.phase === 'code' && lockStatus !== 'success',
    onExpire: handleTimeout,
    resetKey: `${state.phase}-${state.activePlayer}-${state.roundNumber}`,
  });

  const handleDigitsChange = (nextDigits: number[]) => {
    setDigits(nextDigits);
    if (lockStatus !== 'idle') setLockStatus('idle');
    if (state.lastCodeError) dispatch({ type: 'CLEAR_CODE_ERROR' });
  };

  const handleReset = () => {
    setDigits(EMPTY_CODE);
    setLockStatus('idle');
    if (state.lastCodeError) dispatch({ type: 'CLEAR_CODE_ERROR' });
  };

  const handleSubmit = () => {
    const activeCooldown = state.playerCooldownUntil[state.activePlayer] ?? 0;
    const result = validateCode(
      digits.join(''),
      state.config.secretCode,
      Date.now(),
      activeCooldown,
    );
    if (!result.ok) {
      setLockStatus('error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      const cooldownUntil =
        result.reason === 'mismatch' ? Date.now() + LOCK_MS : activeCooldown;
      dispatch({
        type: 'CODE_FAIL',
        payload: {
          playerId: state.activePlayer,
          cooldownUntil,
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

  const activeName =
    state.activePlayer === 1 ? state.config.player1 : state.config.player2;

  const ratio = Math.max(0, Math.min(1, remaining / CODE_TIME_LIMIT));
  const critical = remaining <= 5 && remaining > 0;
  const warning = remaining <= 10 && remaining > 5;
  const timerColor = critical
    ? Colors.danger
    : warning
    ? Colors.highlight
    : Colors.primary;

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

      <View style={[styles.timerCard, { borderColor: timerColor }]}>
        <View style={styles.timerRow}>
          <View style={[styles.timerIcon, { backgroundColor: timerColor }]}>
            <Ionicons name="timer-outline" size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.timerLabel}>Kalan Süre</Text>
            <Text style={[styles.timerValue, { color: timerColor }]}>
              {remaining}
              <Text style={styles.timerUnit}> sn</Text>
            </Text>
          </View>
          <Text style={styles.timerHint}>Şifre için {CODE_TIME_LIMIT} sn</Text>
        </View>
        <View style={styles.timerTrack}>
          <View
            style={[
              styles.timerFill,
              { width: `${ratio * 100}%`, backgroundColor: timerColor },
            ]}
          />
        </View>
      </View>

      <View style={styles.centerBlock}>
        <View style={styles.kicker}>
          <Text style={styles.kickerText}>
            {activeName || `Oyuncu ${state.activePlayer}`} · Şifre Kutusu
          </Text>
        </View>
        <Text style={styles.title}>Kilidi Çöz</Text>
        <Text style={styles.sub}>Kartlardan gelen 4 haneli kodu kilitte ayarla.</Text>

        <CombinationLock
          digits={digits}
          onChange={handleDigitsChange}
          onReset={handleReset}
          onSubmit={handleSubmit}
          disabled={lockStatus === 'success'}
          status={lockStatus}
          lockRemaining={0}
        />

        <View style={styles.statusRow}>
          {state.lastCodeError ? (
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
  errorText: { color: Colors.danger, fontWeight: '700' },
  hintText: { color: Colors.muted, fontSize: Font.small },
  timerCard: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 2,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timerIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerLabel: {
    color: Colors.muted,
    fontSize: Font.small - 1,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerValue: {
    fontSize: Font.heading,
    fontWeight: '900',
    lineHeight: Font.heading + 2,
  },
  timerUnit: {
    fontSize: Font.small,
    fontWeight: '800',
    color: Colors.muted,
  },
  timerHint: {
    color: Colors.muted,
    fontSize: Font.small - 1,
    fontWeight: '700',
    textAlign: 'right',
    maxWidth: 90,
  },
  timerTrack: {
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
});
