import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ActionButton } from '@/components/ActionButton';
import { PlayerBadge } from '@/components/PlayerBadge';
import { ScoreStrip } from '@/components/ScoreStrip';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';

export default function Handoff() {
  const { state, dispatch } = useGame();
  const nextPlayer = state.activePlayer === 1 ? 2 : 1;
  const nextName = nextPlayer === 1 ? state.config.player1 : state.config.player2;
  const prevName =
    state.activePlayer === 1 ? state.config.player1 : state.config.player2;

  const swapAnim = useRef(new Animated.Value(0)).current;
  const arrowPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state.phase === 'setup') router.replace('/');
    else if (state.phase === 'code') router.replace('/code-entry');
    else if (state.phase === 'reveal') router.replace('/reveal');
    else if (state.phase === 'question') router.replace('/question');
    else if (state.phase === 'result') router.replace('/result');
  }, [state.phase]);

  useEffect(() => {
    Animated.timing(swapAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(arrowPulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [arrowPulse, swapAnim]);

  const onContinue = () => {
    dispatch({ type: 'CONTINUE_HANDOFF' });
  };

  // Outgoing player slides left + fades
  const prevTranslate = swapAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });
  const prevOpacity = swapAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [1, 0.4, 0.25],
  });
  // Incoming player slides in from right
  const nextTranslate = swapAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 0],
  });
  const nextOpacity = swapAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.3, 1],
  });
  const nextScale = swapAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  const arrowScale = arrowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });
  const arrowTranslate = arrowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 6],
  });

  return (
    <ScreenContainer>
      <View style={styles.center}>
        <ScoreStrip
          player1={state.config.player1}
          player2={state.config.player2}
          scoreP1={state.scores.p1}
          scoreP2={state.scores.p2}
          roundNumber={state.roundNumber}
          activePlayer={nextPlayer}
        />

        <View style={styles.swapRow}>
          <Animated.View
            style={[
              styles.swapCard,
              {
                opacity: prevOpacity,
                transform: [{ translateX: prevTranslate }],
              },
            ]}
          >
            <Text style={styles.cardLabel}>Bilmedi</Text>
            <PlayerBadge
              name={prevName}
              playerNumber={state.activePlayer}
              compact
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.swapArrow,
              {
                transform: [
                  { scale: arrowScale },
                  { translateX: arrowTranslate },
                ],
              },
            ]}
          >
            <Ionicons
              name="arrow-forward"
              size={28}
              color={Colors.primaryDark}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.swapCard,
              {
                opacity: nextOpacity,
                transform: [
                  { translateX: nextTranslate },
                  { scale: nextScale },
                ],
              },
            ]}
          >
            <Text style={[styles.cardLabel, { color: Colors.success }]}>
              Sıra
            </Text>
            <PlayerBadge name={nextName} playerNumber={nextPlayer} compact />
          </Animated.View>
        </View>

        <View style={styles.infoPanel}>
          <View style={styles.infoHeader}>
            <Ionicons
              name="swap-horizontal"
              size={22}
              color={Colors.primaryDark}
            />
            <Text style={styles.infoTitle}>Sıra Değişti</Text>
          </View>
          <Text style={styles.infoText}>
            Aynı final sorusu şimdi {nextName || `Oyuncu ${nextPlayer}`}'e
            geçiyor. Yeni süre başlayacak.
          </Text>
        </View>
      </View>

      <ActionButton
        label="Devam Et"
        variant="accent"
        fullWidth
        onPress={onContinue}
        icon="arrow-forward-circle"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    width: '100%',
  },
  swapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
  },
  swapCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: Colors.muted,
  },
  swapArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  infoPanel: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    ...Shadow.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoTitle: {
    fontSize: Font.heading - 2,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  infoText: {
    color: Colors.muted,
    fontSize: Font.body,
    fontWeight: '700',
    lineHeight: Font.body * 1.4,
  },
});
