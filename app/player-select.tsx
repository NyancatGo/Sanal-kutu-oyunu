import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScoreStrip } from '@/components/ScoreStrip';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import type { PlayerId } from '@/types/game';

export default function PlayerSelect() {
  const { state, dispatch } = useGame();
  const [nowTick, setNowTick] = useState(Date.now());
  const cardAnims = useRef([new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    if (state.phase === 'setup') router.replace('/');
    else if (state.phase === 'code') router.replace('/code-entry');
    else if (state.phase === 'reveal') router.replace('/reveal');
    else if (state.phase === 'question') router.replace('/question');
    else if (state.phase === 'result') router.replace('/result');
  }, [state.phase]);

  useEffect(() => {
    cardAnims.forEach((a) => a.setValue(0));
    Animated.stagger(
      110,
      cardAnims.map((a) =>
        Animated.spring(a, {
          toValue: 1,
          tension: 140,
          friction: 10,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [cardAnims]);

  useEffect(() => {
    if (state.phase !== 'player-select') return;
    const id = setInterval(() => setNowTick(Date.now()), 250);
    return () => clearInterval(id);
  }, [state.phase]);

  const isQuestionHandoff =
    state.currentQuestion !== null && state.failedQuestionPlayer !== null;

  const heading = isQuestionHandoff ? 'Soru Devri' : 'Kilidi Kim Açacak?';
  const subtitle = isQuestionHandoff
    ? 'Aynı soru diğer oyuncuya geçiyor. Telefonu devralan oyuncu kendi kartına bassın.'
    : 'Telefonu alan oyuncu kendi kartına bassın ve 4 haneli şifreyi girsin.';

  const onSelect = (playerId: PlayerId) => {
    const now = Date.now();
    Haptics.selectionAsync().catch(() => {});
    if (isQuestionHandoff) {
      dispatch({ type: 'SELECT_PLAYER_FOR_QUESTION', payload: { playerId, now } });
    } else {
      dispatch({ type: 'SELECT_PLAYER_FOR_CODE', payload: { playerId, now } });
    }
  };

  return (
    <ScreenContainer scroll>
      <ScoreStrip
        player1={state.config.player1}
        player2={state.config.player2}
        scoreP1={state.scores.p1}
        scoreP2={state.scores.p2}
        roundNumber={state.roundNumber}
        activePlayer={null}
      />

      <View style={styles.headerBlock}>
        <View style={styles.kicker}>
          <Ionicons
            name={isQuestionHandoff ? 'swap-horizontal' : 'hand-left-outline'}
            size={14}
            color={Colors.primaryDark}
          />
          <Text style={styles.kickerText}>
            {isQuestionHandoff ? 'Sıra Değişti' : 'Oyuncu Seç'}
          </Text>
        </View>
        <Text style={styles.title}>{heading}</Text>
        <Text style={styles.sub}>{subtitle}</Text>
      </View>

      {state.lastCodeError && !isQuestionHandoff && (
        <View style={styles.errorPill}>
          <Ionicons name="alert-circle" size={16} color={Colors.danger} />
          <Text style={styles.errorText}>{state.lastCodeError}</Text>
        </View>
      )}

      <View style={styles.cards}>
        {[1, 2].map((n, idx) => {
          const playerId = n as PlayerId;
          const name =
            playerId === 1 ? state.config.player1 : state.config.player2;
          const score = playerId === 1 ? state.scores.p1 : state.scores.p2;
          const cooldownUntil = state.playerCooldownUntil[playerId] ?? 0;
          const cooldownRemaining =
            cooldownUntil > nowTick ? Math.ceil((cooldownUntil - nowTick) / 1000) : 0;
          const failedThisQuestion =
            isQuestionHandoff && state.failedQuestionPlayer === playerId;
          const disabled = cooldownRemaining > 0 || failedThisQuestion;

          const accent = playerId === 1 ? Colors.teal : Colors.coral;
          const softBg = playerId === 1 ? Colors.softBlue : Colors.cream;

          const anim = cardAnims[idx];
          const translateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [28, 0],
          });
          const scale = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.92, 1],
          });

          return (
            <Animated.View
              key={playerId}
              style={{
                opacity: anim,
                transform: [{ translateY }, { scale }],
              }}
            >
              <Pressable
                onPress={() => !disabled && onSelect(playerId)}
                disabled={disabled}
                style={({ pressed }) => [
                  styles.card,
                  { borderColor: disabled ? Colors.border : accent },
                  !disabled && { backgroundColor: softBg },
                  disabled && styles.cardDisabled,
                  pressed && !disabled && styles.cardPressed,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.avatar, { backgroundColor: accent }]}>
                    <Ionicons name="person" size={28} color="#fff" />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.playerLabel}>Oyuncu {playerId}</Text>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {name || `Oyuncu ${playerId}`}
                    </Text>
                  </View>
                  <View style={styles.scoreBox}>
                    <Text style={styles.scoreText}>{score}</Text>
                    <Text style={styles.scoreLabel}>Skor</Text>
                  </View>
                </View>

                <View style={styles.statusRow}>
                  {failedThisQuestion ? (
                    <StatusPill
                      icon="close-circle"
                      color={Colors.danger}
                      label="Bu soruda denedi"
                    />
                  ) : cooldownRemaining > 0 ? (
                    <StatusPill
                      icon="time-outline"
                      color={Colors.danger}
                      label={`${cooldownRemaining} sn bekle`}
                    />
                  ) : (
                    <StatusPill
                      icon="checkmark-circle"
                      color={Colors.success}
                      label={isQuestionHandoff ? 'Sen dene' : 'Hazır · Dokun'}
                    />
                  )}
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.footerNote}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.muted} />
        <Text style={styles.footerText}>
          {isQuestionHandoff
            ? 'Yanlış cevap veren oyuncu aynı soruyu yeniden deneyemez.'
            : 'Yanlış şifre girilirse ilgili oyuncu 5 saniye bekler.'}
        </Text>
      </View>
    </ScreenContainer>
  );
}

function StatusPill({
  icon,
  color,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  label: string;
}) {
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  kicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.cream,
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
    fontSize: Font.title,
    fontWeight: '900',
    color: Colors.primaryDark,
    textAlign: 'center',
    marginTop: 2,
  },
  sub: {
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: Font.body * 1.4,
    paddingHorizontal: Spacing.md,
    fontWeight: '700',
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
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.danger,
    fontWeight: '800',
    fontSize: Font.small,
  },
  cards: {
    gap: Spacing.md,
  },
  card: {
    borderWidth: 2,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    gap: Spacing.md,
    ...Shadow.md,
  },
  cardDisabled: {
    backgroundColor: '#F3F5F8',
    opacity: 0.75,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  playerLabel: {
    color: Colors.muted,
    fontSize: Font.small - 1,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playerName: {
    fontSize: Font.heading - 2,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  scoreBox: {
    alignItems: 'center',
    minWidth: 48,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.md,
    backgroundColor: Colors.ink,
  },
  scoreText: {
    color: Colors.accent,
    fontSize: Font.heading,
    fontWeight: '900',
    lineHeight: Font.heading + 2,
  },
  scoreLabel: {
    color: Colors.metal,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusRow: {
    alignItems: 'flex-start',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    backgroundColor: Colors.surface,
  },
  pillText: {
    fontSize: Font.small,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  footerText: {
    flex: 1,
    color: Colors.muted,
    fontSize: Font.small,
    fontWeight: '700',
    lineHeight: Font.small * 1.4,
  },
});
