import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { CombinationLock, type CombinationLockStatus } from '@/components/CombinationLock';
import { ScoreStrip } from '@/components/ScoreStrip';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Timer } from '@/components/Timer';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { useTimer } from '@/hooks/useTimer';
import { getRandomQuestion } from '@/utils/getRandomQuestion';
import { validateCode } from '@/utils/validateCode';

const EMPTY_CODE = [0, 0, 0, 0];

export default function CodeEntry() {
  const { state, dispatch } = useGame();
  const [digits, setDigits] = useState(EMPTY_CODE);
  const [lockStatus, setLockStatus] = useState<CombinationLockStatus>('idle');
  const actionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptFinalized = useRef(false);

  useEffect(
    () => () => {
      if (actionTimer.current) clearTimeout(actionTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (state.phase !== 'code-entry') return;
    if (actionTimer.current) clearTimeout(actionTimer.current);
    attemptFinalized.current = false;
    setDigits(EMPTY_CODE);
    setLockStatus('idle');
  }, [state.phase, state.activeGroup]);

  useEffect(() => {
    if (state.phase === 'setup') router.replace('/');
    else if (state.phase === 'starter-selection') router.replace('/starter-select');
    else if (state.phase === 'ready' || state.phase === 'question' || state.phase === 'final-question') router.replace('/question');
    else if (state.phase === 'digit-reveal') router.replace('/reveal');
    else if (state.phase === 'code-handoff') router.replace('/code-handoff');
    else if (state.phase === 'result') router.replace('/result');
  }, [state.phase]);

  const activeName =
    state.activeGroup === 1 ? state.config.group1 : state.config.group2;
  const activeAccent = state.activeGroup === 1 ? Colors.teal : Colors.coral;
  const earnedDigits = state.revealedDigits[state.activeGroup];
  const canAttempt = earnedDigits.length >= 4;

  const getNextQuestionForOtherGroup = useCallback(() => {
    return getRandomQuestion(
      state.config.digitCategory,
      state.config.digitDifficulty,
      state.usedQuestionIds,
    );
  }, [state.config.digitCategory, state.config.digitDifficulty, state.usedQuestionIds]);

  const sendBackToQuestion = useCallback(
    (message: string) => {
      if (attemptFinalized.current || state.phase !== 'code-entry') return;
      attemptFinalized.current = true;
      setLockStatus('error');
      if (actionTimer.current) clearTimeout(actionTimer.current);
      actionTimer.current = setTimeout(() => {
        dispatch({
          type: 'CODE_FAIL',
          payload: {
            message,
            nextQuestion: getNextQuestionForOtherGroup(),
          },
        });
      }, 520);
    },
    [dispatch, getNextQuestionForOtherGroup, state.phase],
  );

  const handleCodeTimeout = useCallback(() => {
    if (!canAttempt) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    sendBackToQuestion('Süre doldu. Sıra diğer gruba geçti.');
  }, [canAttempt, sendBackToQuestion]);

  const codeTimeLimit = state.config.codeTimeLimit;

  const { remaining } = useTimer({
    seconds: codeTimeLimit,
    running:
      state.phase === 'code-entry' &&
      canAttempt &&
      lockStatus === 'idle' &&
      !attemptFinalized.current,
    onExpire: handleCodeTimeout,
    resetKey: `${state.phase}-${state.activeGroup}-${earnedDigits.join('')}`,
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
    if (!canAttempt || attemptFinalized.current) return;
    attemptFinalized.current = true;
    const result = validateCode(
      digits.join(''),
      state.secretCodes[state.activeGroup],
      Date.now(),
      0,
    );

    if (!result.ok) {
      setLockStatus('error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      if (actionTimer.current) clearTimeout(actionTimer.current);
      actionTimer.current = setTimeout(() => {
        dispatch({
          type: 'CODE_FAIL',
          payload: {
            message: 'Şifre yanlış. Sıra diğer gruba geçti.',
            nextQuestion: getNextQuestionForOtherGroup(),
          },
        });
      }, 520);
      return;
    }

    setLockStatus('success');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const finalQuestion = getRandomQuestion(
      state.config.finalCategory,
      state.config.finalDifficulty,
      state.usedQuestionIds,
    );
    if (actionTimer.current) clearTimeout(actionTimer.current);
    actionTimer.current = setTimeout(() => {
      dispatch({ type: 'CODE_SUCCESS', payload: { finalQuestion } });
      router.replace('/question');
    }, 420);
  };

  if (state.phase !== 'code-entry') {
    return (
      <ScreenContainer>
        <View style={styles.loading}>
          <Text style={{ color: Colors.muted }}>Yönlendiriliyor…</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <ScoreStrip
        group1={state.config.group1}
        group2={state.config.group2}
        digitsG1={state.revealedDigits[1]}
        digitsG2={state.revealedDigits[2]}
        activeGroup={state.activeGroup}
        centerLabel="Kilit"
      />

      <View style={styles.intro}>
        <View style={[styles.activeChip, { backgroundColor: activeAccent }]}>
          <Ionicons name="people" size={12} color="#fff" />
          <Text style={styles.activeChipText} numberOfLines={1}>
            {activeName || `Grup ${state.activeGroup}`}
          </Text>
        </View>
        <Text style={styles.title}>Kilidi Aç</Text>
        <Text style={styles.sub}>
          Kağıda yazdığınız 4 haneli şifreyi {codeTimeLimit} saniye içinde girin.
        </Text>
      </View>

      <View style={styles.timerWrap}>
        <Timer remaining={remaining} total={codeTimeLimit} variant="compact" />
      </View>

      <CombinationLock
        digits={digits}
        onChange={handleDigitsChange}
        onReset={handleReset}
        onSubmit={handleSubmit}
        disabled={lockStatus === 'success' || !canAttempt}
        status={lockStatus}
        lockRemaining={0}
      />

      <View style={styles.statusRow}>
        {state.lastCodeError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={Colors.danger} />
            <Text style={styles.errorText}>{state.lastCodeError}</Text>
          </View>
        ) : (
          <Text style={styles.hintText}>
            {canAttempt
              ? 'Tekerlerle haneyi seçin, ardından kilidi açın.'
              : 'Bu grup henüz dört haneyi tamamlamadı.'}
          </Text>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  intro: {
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    maxWidth: '85%',
    marginBottom: 4,
    ...Shadow.xs,
  },
  activeChipText: {
    color: '#fff',
    fontSize: Font.small,
    fontWeight: '900',
    flexShrink: 1,
  },
  title: {
    fontSize: Font.title,
    fontWeight: '900',
    color: Colors.ink,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  sub: {
    color: Colors.muted,
    fontSize: Font.small + 1,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: (Font.small + 1) * 1.5,
    paddingHorizontal: Spacing.md,
  },
  timerWrap: {
    width: '100%',
    marginBottom: Spacing.sm,
  },
  statusRow: {
    minHeight: 36,
    marginTop: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.dangerSoft,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  errorText: {
    color: Colors.danger,
    fontWeight: '800',
    fontSize: Font.small,
  },
  hintText: {
    color: Colors.muted,
    fontSize: Font.small,
    textAlign: 'center',
    fontWeight: '600',
  },
});
