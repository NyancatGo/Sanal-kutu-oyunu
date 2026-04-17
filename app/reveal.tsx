import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { PlayerBadge } from '@/components/PlayerBadge';
import { ScoreStrip } from '@/components/ScoreStrip';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';

const REVEAL_MS = 2200;

export default function Reveal() {
  const { state, dispatch } = useGame();
  const shackleLift = useRef(new Animated.Value(0)).current;
  const bodyGlow = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const digitAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    if (state.phase !== 'reveal') {
      if (state.phase === 'setup') router.replace('/');
      else if (state.phase === 'code') router.replace('/code-entry');
      else if (state.phase === 'question') router.replace('/question');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );

    Animated.sequence([
      Animated.timing(bodyGlow, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(shackleLift, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(titleAnim, {
      toValue: 1,
      delay: 280,
      duration: 380,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();

    Animated.stagger(
      90,
      digitAnims.map((a) =>
        Animated.spring(a, {
          toValue: 1,
          tension: 180,
          friction: 12,
          useNativeDriver: true,
        }),
      ),
    ).start();

    const t = setTimeout(() => {
      dispatch({ type: 'START_QUESTION' });
      router.replace('/question');
    }, REVEAL_MS);

    return () => clearTimeout(t);
  }, [bodyGlow, digitAnims, dispatch, shackleLift, state.phase, titleAnim]);

  const activeName =
    state.activePlayer === 1 ? state.config.player1 : state.config.player2;

  const shackleTranslate = shackleLift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -38],
  });
  const shackleRotate = shackleLift.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-14deg'],
  });

  const glowBorder = bodyGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.success],
  });
  const glowBg = bodyGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.surface, Colors.successSoft],
  });

  const titleScale = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });
  const titleTranslate = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const digits = state.config.secretCode.padEnd(4, '•').split('').slice(0, 4);

  return (
    <ScreenContainer>
      <View style={styles.center}>
        <ScoreStrip
          player1={state.config.player1}
          player2={state.config.player2}
          scoreP1={state.scores.p1}
          scoreP2={state.scores.p2}
          roundNumber={state.roundNumber}
          activePlayer={state.activePlayer}
        />
        <View style={styles.lockScene}>
          <Animated.View
            style={[
              styles.shackle,
              {
                borderColor: Colors.success,
                transform: [
                  { translateY: shackleTranslate },
                  { rotate: shackleRotate },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.lockBody,
              {
                borderColor: glowBorder,
                backgroundColor: glowBg,
              },
            ]}
          >
            <Ionicons name="lock-open" size={56} color={Colors.success} />
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.titleBlock,
            {
              opacity: titleAnim,
              transform: [{ scale: titleScale }, { translateY: titleTranslate }],
            },
          ]}
        >
          <View style={styles.successPill}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.pillText}>Şifre Doğru</Text>
          </View>
          <Text style={styles.title}>Kilit Açıldı</Text>
          <Text style={styles.sub}>Final sorusu hazırlanıyor…</Text>
        </Animated.View>

        <View style={styles.digitRow}>
          {digits.map((d, i) => {
            const a = digitAnims[i];
            const scale = a.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 1],
            });
            const translateY = a.interpolate({
              inputRange: [0, 1],
              outputRange: [24, 0],
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.digitBox,
                  { opacity: a, transform: [{ scale }, { translateY }] },
                ]}
              >
                <Text style={styles.digitText}>{d}</Text>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.playerPanel}>
          <Text style={styles.panelLabel}>Sıradaki oyuncu</Text>
          <PlayerBadge
            name={activeName}
            playerNumber={state.activePlayer}
            active
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  lockScene: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 180,
    height: 180,
  },
  shackle: {
    position: 'absolute',
    top: 10,
    width: 118,
    height: 110,
    borderTopWidth: 16,
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderTopLeftRadius: 62,
    borderTopRightRadius: 62,
    backgroundColor: 'transparent',
  },
  lockBody: {
    width: 140,
    height: 116,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    ...Shadow.lg,
  },
  titleBlock: {
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
  },
  successPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.successSoft,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  pillText: {
    color: Colors.success,
    fontWeight: '900',
    fontSize: Font.small,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: Font.title + 6,
    fontWeight: '900',
    color: Colors.success,
    textAlign: 'center',
  },
  sub: {
    color: Colors.muted,
    fontSize: Font.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  digitRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  digitBox: {
    width: 46,
    height: 54,
    borderRadius: Radius.md,
    backgroundColor: Colors.ink,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  digitText: {
    color: Colors.accent,
    fontWeight: '900',
    fontSize: Font.heading + 2,
    lineHeight: Font.heading + 6,
  },
  playerPanel: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  panelLabel: {
    color: Colors.muted,
    fontSize: Font.small,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
