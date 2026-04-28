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
import { getRandomQuestion } from '@/utils/getRandomQuestion';

export default function QuestionScreen() {
  const { state, dispatch } = useGame();
  const [showAnswer, setShowAnswer] = useState(false);
  const isReady = state.phase === 'ready';
  const isFinal =
    state.phase === 'final-question' || (isReady && state.readyMode === 'final');
  const question = isFinal ? state.finalQuestion : state.currentQuestion;
  const total = isFinal ? state.config.finalTimeLimit : state.config.digitTimeLimit;

  const timerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const decisionAnim = useRef(new Animated.Value(0)).current;
  const secondaryAnim = useRef(new Animated.Value(0)).current;

  const getNextDigitQuestion = useCallback(() => {
    return getRandomQuestion(
      state.config.digitCategory,
      state.config.digitDifficulty,
      state.usedQuestionIds,
    );
  }, [state.config.digitCategory, state.config.digitDifficulty, state.usedQuestionIds]);

  const handleWrong = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    if (isFinal) {
      dispatch({ type: 'FINAL_ANSWER_WRONG_OR_TIMEOUT' });
      return;
    }
    dispatch({
      type: 'NORMAL_ANSWER_WRONG_OR_TIMEOUT',
      payload: { nextQuestion: getNextDigitQuestion() },
    });
  }, [dispatch, getNextDigitQuestion, isFinal]);

  const handleTimeout = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    if (isFinal) {
      dispatch({ type: 'FINAL_ANSWER_WRONG_OR_TIMEOUT' });
      return;
    }
    dispatch({
      type: 'NORMAL_ANSWER_WRONG_OR_TIMEOUT',
      payload: { nextQuestion: getNextDigitQuestion() },
    });
  }, [dispatch, getNextDigitQuestion, isFinal]);

  const { remaining } = useTimer({
    seconds: total,
    running: state.phase === 'question' || state.phase === 'final-question',
    onExpire: handleTimeout,
    resetKey: `${state.phase}-${state.activeGroup}-${question?.id}-${state.finalFailedGroup ?? 'none'}`,
  });

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
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.stagger(80, [
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
    question?.id,
    state.activeGroup,
    state.phase,
    cardAnim,
    decisionAnim,
    secondaryAnim,
    timerAnim,
  ]);

  useEffect(() => {
    if (state.phase === 'setup') router.replace('/');
    else if (state.phase === 'starter-selection') router.replace('/starter-select');
    else if (state.phase === 'digit-reveal') router.replace('/reveal');
    else if (state.phase === 'code-entry') router.replace('/code-entry');
    else if (state.phase === 'code-handoff') router.replace('/code-handoff');
    else if (state.phase === 'result') router.replace('/result');
  }, [state.phase]);

  if (!question || (state.phase !== 'ready' && state.phase !== 'question' && state.phase !== 'final-question')) {
    return (
      <ScreenContainer>
        <View style={styles.loading}>
          <Text style={{ color: Colors.muted }}>Hazırlanıyor…</Text>
        </View>
      </ScreenContainer>
    );
  }

  const onCorrect = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (isFinal) {
      dispatch({ type: 'FINAL_ANSWER_CORRECT' });
    } else {
      dispatch({ type: 'NORMAL_ANSWER_CORRECT' });
    }
  };

  const { answer, teacherNote } = question;
  const activeName =
    state.activeGroup === 1 ? state.config.group1 : state.config.group2;
  const activeDigits = state.revealedDigits[state.activeGroup];
  const activeAccent = state.activeGroup === 1 ? Colors.teal : Colors.coral;

  const cardTranslate = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 0],
  });
  const decisionTranslate = decisionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });
  const secondaryTranslate = secondaryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  if (isReady) {
    const readyScale = timerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.92, 1],
    });
    return (
      <ScreenContainer>
        <ScoreStrip
          group1={state.config.group1}
          group2={state.config.group2}
          digitsG1={state.revealedDigits[1]}
          digitsG2={state.revealedDigits[2]}
          activeGroup={state.activeGroup}
          centerLabel={isFinal ? 'Final' : 'Hane'}
        />

        <View style={styles.readyWrap}>
          <Animated.View
            style={[
              styles.readyCard,
              isFinal && styles.readyCardFinal,
              { opacity: timerAnim, transform: [{ scale: readyScale }] },
            ]}
          >
            <View
              style={[
                styles.readyIcon,
                { backgroundColor: isFinal ? Colors.coral : Colors.primary },
              ]}
            >
              <Ionicons
                name={isFinal ? 'trophy' : 'help-buoy'}
                size={36}
                color="#fff"
              />
            </View>
            <Text
              style={[
                styles.readyKicker,
                { color: isFinal ? Colors.coral : Colors.primary },
              ]}
            >
              {isFinal
                ? 'Final sorusu hazır'
                : `${activeDigits.length + 1}. hane sorusu hazır`}
            </Text>
            <Text style={styles.readyTitle}>
              {activeName || `Grup ${state.activeGroup}`}
            </Text>
            <Text style={styles.readySub}>hazır mı?</Text>

            <View style={styles.readyMetaRow}>
              <View style={styles.readyMeta}>
                <Ionicons name="timer-outline" size={14} color={Colors.muted} />
                <Text style={styles.readyMetaText}>{total} saniye</Text>
              </View>
              <View style={[styles.readyMetaDivider]} />
              <View style={styles.readyMeta}>
                <Ionicons
                  name={isFinal ? 'trophy-outline' : 'key-outline'}
                  size={14}
                  color={Colors.muted}
                />
                <Text style={styles.readyMetaText}>
                  {isFinal ? 'Tek soru' : 'Bir hane'}
                </Text>
              </View>
            </View>

            <Text style={styles.readyText}>
              {isFinal
                ? 'Süre, final başlatılınca akmaya başlar. Bilen grup oyunu kazanır.'
                : 'Süre, soru başlatılınca akmaya başlar. Doğru cevap haneyi açar.'}
            </Text>

            {isFinal && state.finalFailedGroup !== null && (
              <View style={styles.finalNoteBox}>
                <Ionicons name="repeat" size={14} color={Colors.coral} />
                <Text style={styles.finalNoteText}>
                  Aynı final sorusu diğer gruba geçti.
                </Text>
              </View>
            )}
          </Animated.View>

          {state.lastCodeError && (
            <View style={styles.errorPill}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{state.lastCodeError}</Text>
            </View>
          )}
        </View>

        <ActionButton
          label={isFinal ? 'Finali Başlat' : 'Soruyu Başlat'}
          variant={isFinal ? 'accent' : 'primary'}
          size="lg"
          fullWidth
          icon="play-circle"
          onPress={() => dispatch({ type: 'START_READY_QUESTION' })}
        />
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
        centerLabel={isFinal ? 'Final' : 'Hane'}
      />

      <View style={styles.activeRow}>
        <View style={[styles.activeChip, { backgroundColor: activeAccent }]}>
          <Ionicons name="people" size={12} color="#fff" />
          <Text style={styles.activeChipText} numberOfLines={1}>
            {activeName || `Grup ${state.activeGroup}`}
          </Text>
        </View>
        <View style={styles.attemptPill}>
          <Ionicons
            name={isFinal ? 'trophy' : 'key-outline'}
            size={11}
            color={Colors.primaryDark}
          />
          <Text style={styles.attemptText}>
            {isFinal ? 'Final Sorusu' : `${activeDigits.length + 1}. Hane Sorusu`}
          </Text>
        </View>
      </View>

      {state.lastCodeError && !isFinal && (
        <View style={styles.errorPill}>
          <Ionicons name="alert-circle" size={16} color={Colors.danger} />
          <Text style={styles.errorText}>{state.lastCodeError}</Text>
        </View>
      )}

      <Animated.View
        style={[
          styles.timerWrap,
          {
            opacity: timerAnim,
            transform: [
              {
                scale: timerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.85, 1],
                }),
              },
            ],
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
          category={question.category}
          difficulty={question.difficulty}
          question={question.question}
          variant={isFinal ? 'final' : 'normal'}
        />
      </Animated.View>

      {showAnswer ? (
        <Pressable
          onPress={() => setShowAnswer(false)}
          style={({ pressed }) => [
            styles.answerBox,
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={styles.answerHeader}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.answerLabel}>Doğru cevap · gizlemek için dokun</Text>
          </View>
          <Text style={styles.answerText}>{answer}</Text>
          {teacherNote && <Text style={styles.noteText}>{teacherNote}</Text>}
        </Pressable>
      ) : (
        <View style={styles.answerHoldWrap}>
          <HoldButton
            label="Öğretmen · Cevabı Göster"
            holdLabel="Açılıyor…"
            icon="eye-outline"
            durationMs={800}
            onComplete={() => setShowAnswer(true)}
            variant="subtle"
          />
        </View>
      )}

      <Text style={styles.hint}>
        {isFinal
          ? 'Finali bilen grup oyunu kazanır. Yanlışsa aynı soru diğer gruba geçer.'
          : 'Doğru cevap haneyi açar. Yanlışta sıra diğer gruba geçer.'}
      </Text>

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
            size="lg"
            fullWidth
            onPress={onCorrect}
            icon="checkmark-circle"
          />
        </Animated.View>

        <View style={{ height: Spacing.sm }} />

        <Animated.View
          style={[
            styles.row,
            {
              opacity: secondaryAnim,
              transform: [{ translateY: secondaryTranslate }],
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <ActionButton
              label="Yanlış"
              variant="danger"
              fullWidth
              onPress={handleWrong}
              icon="close-circle"
            />
          </View>
          <View style={{ width: Spacing.sm }} />
          <View style={{ flex: 1 }}>
            <ActionButton
              label="Süre Doldu"
              variant="outline"
              fullWidth
              onPress={handleTimeout}
              icon="timer-outline"
            />
          </View>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  readyWrap: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  readyCard: {
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.lg,
    paddingVertical: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    ...Shadow.lg,
  },
  readyCardFinal: {
    borderColor: Colors.coral,
    backgroundColor: '#FFF8F4',
  },
  readyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  readyKicker: {
    fontSize: Font.small - 1,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  readyTitle: {
    color: Colors.ink,
    fontSize: Font.title,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  readySub: {
    color: Colors.muted,
    fontSize: Font.body,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: -2,
  },
  readyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  readyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readyMetaText: {
    color: Colors.muted,
    fontSize: Font.small,
    fontWeight: '800',
  },
  readyMetaDivider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.border,
  },
  readyText: {
    color: Colors.muted,
    fontSize: Font.small + 1,
    fontWeight: '600',
    lineHeight: (Font.small + 1) * 1.5,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.xs,
  },
  finalNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: Colors.coral,
    marginTop: Spacing.xs,
  },
  finalNoteText: {
    color: Colors.coral,
    fontSize: Font.small,
    fontWeight: '900',
  },
  timerWrap: { alignItems: 'center', marginTop: Spacing.md },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    flexShrink: 1,
    maxWidth: '60%',
  },
  activeChipText: {
    color: '#fff',
    fontSize: Font.small,
    fontWeight: '900',
    letterSpacing: -0.1,
    flexShrink: 1,
  },
  attemptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  attemptText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.dangerSoft,
    borderWidth: 1,
    borderColor: Colors.danger,
    marginVertical: Spacing.sm,
  },
  errorText: {
    color: Colors.danger,
    fontWeight: '800',
    fontSize: Font.small,
  },
  hint: {
    color: Colors.muted,
    fontSize: Font.small,
    textAlign: 'center',
    marginVertical: Spacing.md,
    fontWeight: '600',
    lineHeight: Font.small * 1.5,
  },
  actions: { marginTop: 4 },
  row: { flexDirection: 'row' },
  answerBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.success,
    backgroundColor: Colors.successSoft,
    gap: 8,
    ...Shadow.xs,
  },
  answerHoldWrap: { marginTop: Spacing.md },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    alignItems: 'center',
  },
  answerLabel: {
    fontSize: Font.small,
    color: Colors.success,
    fontWeight: '800',
    textAlign: 'center',
  },
  answerText: {
    fontSize: Font.bodyLg,
    fontWeight: '900',
    color: Colors.success,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  noteText: {
    fontSize: Font.small,
    color: Colors.muted,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '600',
  },
});
