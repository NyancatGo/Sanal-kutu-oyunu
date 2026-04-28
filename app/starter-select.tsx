import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ActionButton } from '@/components/ActionButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import type { GroupId } from '@/types/game';

type Stage = 'idle' | 'spinning' | 'revealed';

const SPIN_DURATION = 2400;
const TICK_INTERVAL = 90;

export default function StarterSelect() {
  const { state, dispatch } = useGame();
  const [stage, setStage] = useState<Stage>('idle');
  const [highlight, setHighlight] = useState<GroupId>(1);
  const [winner, setWinner] = useState<GroupId | null>(null);

  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterAnim = useRef(new Animated.Value(0)).current;
  const winnerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state.phase === 'setup') router.replace('/');
    else if (state.phase === 'ready' || state.phase === 'question' || state.phase === 'final-question') router.replace('/question');
    else if (state.phase === 'digit-reveal') router.replace('/reveal');
    else if (state.phase === 'code-entry') router.replace('/code-entry');
    else if (state.phase === 'code-handoff') router.replace('/code-handoff');
    else if (state.phase === 'result') router.replace('/result');
  }, [state.phase]);

  useEffect(() => {
    Animated.timing(enterAnim, {
      toValue: 1,
      duration: 480,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enterAnim]);

  useEffect(() => {
    return () => {
      if (tickTimer.current) clearInterval(tickTimer.current);
      if (stopTimer.current) clearTimeout(stopTimer.current);
    };
  }, []);

  const startDraw = useCallback(() => {
    if (stage === 'spinning') return;
    setStage('spinning');
    setWinner(null);
    winnerAnim.setValue(0);
    pulseAnim.setValue(0);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 480,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 480,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Haptics.selectionAsync().catch(() => {});

    tickTimer.current = setInterval(() => {
      setHighlight((prev) => (prev === 1 ? 2 : 1));
      Haptics.selectionAsync().catch(() => {});
    }, TICK_INTERVAL);

    stopTimer.current = setTimeout(() => {
      if (tickTimer.current) {
        clearInterval(tickTimer.current);
        tickTimer.current = null;
      }
      pulseAnim.stopAnimation();
      const picked: GroupId = Math.random() < 0.5 ? 1 : 2;
      setHighlight(picked);
      setWinner(picked);
      setStage('revealed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Animated.spring(winnerAnim, {
        toValue: 1,
        tension: 140,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, SPIN_DURATION);
  }, [stage, pulseAnim, winnerAnim]);

  const handleContinue = () => {
    if (winner === null) return;
    dispatch({ type: 'CONFIRM_FIRST_GROUP', payload: { groupId: winner } });
    router.replace('/question');
  };

  if (state.phase !== 'starter-selection') {
    return (
      <ScreenContainer>
        <View style={styles.loading}>
          <Text style={{ color: Colors.muted }}>Yönlendiriliyor…</Text>
        </View>
      </ScreenContainer>
    );
  }

  const enterTranslate = enterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });
  const winnerScale = winnerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });

  const winnerName =
    winner === 1
      ? state.config.group1
      : winner === 2
      ? state.config.group2
      : null;

  return (
    <ScreenContainer>
      <Animated.View
        style={[
          styles.headerBlock,
          { opacity: enterAnim, transform: [{ translateY: enterTranslate }] },
        ]}
      >
        <View style={styles.kickerPill}>
          <Ionicons name="shuffle" size={12} color={Colors.primary} />
          <Text style={styles.kickerText}>Adil Başlangıç</Text>
        </View>
        <Text style={styles.title}>İlk Grup Belirleniyor</Text>
        <Text style={styles.sub}>
          Sistem rastgele bir grup seçer. İlk soruyu seçilen grup cevaplar.
        </Text>
      </Animated.View>

      <View style={styles.cards}>
        <GroupCard
          name={state.config.group1 || 'Grup 1'}
          groupNumber={1}
          highlighted={stage !== 'idle' && highlight === 1}
          isWinner={stage === 'revealed' && winner === 1}
          spinning={stage === 'spinning'}
          pulseScale={pulseScale}
          winnerScale={winnerScale}
        />
        <View style={styles.vs}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        <GroupCard
          name={state.config.group2 || 'Grup 2'}
          groupNumber={2}
          highlighted={stage !== 'idle' && highlight === 2}
          isWinner={stage === 'revealed' && winner === 2}
          spinning={stage === 'spinning'}
          pulseScale={pulseScale}
          winnerScale={winnerScale}
        />
      </View>

      <View style={styles.bannerSlot}>
        {stage === 'revealed' && winnerName && (
          <Animated.View
            style={[
              styles.banner,
              {
                opacity: winnerAnim,
                transform: [{ scale: winnerScale }],
                borderColor: winner === 1 ? Colors.teal : Colors.coral,
                backgroundColor: winner === 1 ? Colors.softBlue : Colors.cream,
              },
            ]}
          >
            <Ionicons
              name="sparkles"
              size={18}
              color={winner === 1 ? Colors.teal : Colors.coral}
            />
            <Text
              style={[
                styles.bannerText,
                { color: winner === 1 ? Colors.teal : Colors.coral },
              ]}
              numberOfLines={2}
            >
              İlk soruyu {winnerName} cevaplayacak!
            </Text>
          </Animated.View>
        )}
        {stage === 'spinning' && (
          <View style={styles.spinningHint}>
            <Ionicons name="sync" size={16} color={Colors.muted} />
            <Text style={styles.spinningText}>Rastgele seçim yapılıyor…</Text>
          </View>
        )}
      </View>

      <View style={{ flex: 1 }} />

      {stage === 'idle' && (
        <ActionButton
          label="Çekilişi Başlat"
          variant="primary"
          size="lg"
          fullWidth
          icon="dice"
          onPress={startDraw}
        />
      )}
      {stage === 'revealed' && (
        <ActionButton
          label="Devam Et"
          variant="primary"
          size="lg"
          fullWidth
          icon="arrow-forward-circle"
          onPress={handleContinue}
        />
      )}
    </ScreenContainer>
  );
}

function GroupCard({
  name,
  groupNumber,
  highlighted,
  isWinner,
  spinning,
  pulseScale,
  winnerScale,
}: {
  name: string;
  groupNumber: GroupId;
  highlighted: boolean;
  isWinner: boolean;
  spinning: boolean;
  pulseScale: Animated.AnimatedInterpolation<number>;
  winnerScale: Animated.AnimatedInterpolation<number>;
}) {
  const accent = groupNumber === 1 ? Colors.teal : Colors.coral;
  const softBg = groupNumber === 1 ? Colors.softBlue : Colors.cream;
  const dim = spinning && !highlighted;
  const transform = isWinner
    ? [{ scale: winnerScale }]
    : highlighted
    ? [{ scale: pulseScale }]
    : [{ scale: 1 }];

  return (
    <Animated.View
      style={[
        styles.card,
        (highlighted || isWinner) && {
          borderColor: accent,
          backgroundColor: softBg,
        },
        isWinner && Shadow.lg,
        dim && { opacity: 0.45 },
        { transform },
      ]}
    >
      <View style={[styles.cardIcon, { backgroundColor: accent }]}>
        <Ionicons name="people" size={22} color="#fff" />
      </View>
      <Text style={styles.cardLabel}>Grup {groupNumber}</Text>
      <Text style={styles.cardName} numberOfLines={2}>
        {name}
      </Text>
      {isWinner && (
        <View style={[styles.winnerPill, { backgroundColor: accent }]}>
          <Ionicons name="star" size={11} color="#fff" />
          <Text style={styles.winnerPillText}>SEÇİLDİ</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerBlock: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  kickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.softBlue,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  kickerText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: Font.title - 2,
    fontWeight: '900',
    color: Colors.ink,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  sub: {
    fontSize: Font.small + 1,
    color: Colors.muted,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: (Font.small + 1) * 1.5,
    paddingHorizontal: Spacing.sm,
  },
  cards: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 170,
    ...Shadow.sm,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.xs,
  },
  cardLabel: {
    color: Colors.muted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cardName: {
    color: Colors.ink,
    fontSize: Font.body,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  winnerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    marginTop: 2,
  },
  winnerPillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  vs: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.ink,
    ...Shadow.sm,
  },
  vsText: {
    color: Colors.accent,
    fontSize: Font.small,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bannerSlot: {
    minHeight: 56,
    justifyContent: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  bannerText: {
    fontSize: Font.body,
    fontWeight: '900',
    flexShrink: 1,
    textAlign: 'center',
  },
  spinningHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  spinningText: {
    color: Colors.muted,
    fontSize: Font.body,
    fontWeight: '800',
  },
});
