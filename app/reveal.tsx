import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { PlayerBadge } from '@/components/PlayerBadge';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
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
        <View style={styles.successBadge}>
          <Ionicons name="lock-open" size={64} color={Colors.surface} />
        </View>
        <Text style={styles.title}>Şifre Doğru!</Text>
        <Text style={styles.sub}>Final sorusu hazırlanıyor.</Text>

        <View style={styles.playerPanel}>
          <Text style={styles.panelLabel}>Sıradaki oyuncu</Text>
          <PlayerBadge name={activeName} playerNumber={state.activePlayer} active />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  successBadge: {
    width: 148,
    height: 148,
    borderRadius: 44,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: Colors.successSoft,
    ...Shadow.lg,
  },
  title: {
    fontSize: Font.title + 4,
    fontWeight: '900',
    color: Colors.success,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  sub: { color: Colors.muted, fontSize: Font.body, fontWeight: '700', textAlign: 'center' },
  playerPanel: {
    marginTop: Spacing.lg,
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
  },
});
