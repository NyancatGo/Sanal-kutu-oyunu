import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/ScreenContainer';
import { PlayerBadge } from '@/components/PlayerBadge';
import { Colors, Font, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';

const REVEAL_MS = 1800;

export default function Reveal() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (state.phase !== 'reveal') {
      if (state.phase === 'setup') router.replace('/');
      else if (state.phase === 'code') router.replace('/code-entry');
      else if (state.phase === 'question') router.replace('/question');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const t = setTimeout(() => {
      dispatch({ type: 'START_QUESTION' });
      router.replace('/question');
    }, REVEAL_MS);
    return () => clearTimeout(t);
  }, [state.phase, dispatch]);

  const activeName =
    state.activePlayer === 1 ? state.config.player1 : state.config.player2;

  return (
    <ScreenContainer>
      <View style={styles.center}>
        <View style={styles.checkBadge}>
          <Text style={styles.checkEmoji}>✓</Text>
        </View>
        <Text style={styles.title}>Şifre Doğru!</Text>
        <Text style={styles.sub}>Final sorusu yükleniyor…</Text>

        <View style={styles.badgeWrap}>
          <PlayerBadge name={activeName} playerNumber={state.activePlayer} active />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  checkBadge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.success,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  checkEmoji: { color: '#fff', fontSize: 80, fontWeight: '900', marginTop: -8 },
  title: {
    fontSize: Font.title + 4,
    fontWeight: '800',
    color: Colors.success,
    marginTop: Spacing.md,
  },
  sub: { color: Colors.muted, fontSize: Font.body },
  badgeWrap: { marginTop: Spacing.lg },
});
