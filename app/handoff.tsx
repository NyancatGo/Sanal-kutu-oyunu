import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ActionButton } from '@/components/ActionButton';
import { PlayerBadge } from '@/components/PlayerBadge';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';

export default function Handoff() {
  const { state, dispatch } = useGame();
  const nextPlayer = state.activePlayer === 1 ? 2 : 1;
  const nextName = nextPlayer === 1 ? state.config.player1 : state.config.player2;

  useEffect(() => {
    if (state.phase === 'setup') router.replace('/');
    else if (state.phase === 'code') router.replace('/code-entry');
    else if (state.phase === 'reveal') router.replace('/reveal');
    else if (state.phase === 'question') router.replace('/question');
    else if (state.phase === 'result') router.replace('/result');
  }, [state.phase]);

  const onContinue = () => {
    dispatch({ type: 'CONTINUE_HANDOFF' });
  };

  return (
    <ScreenContainer>
      <View style={styles.center}>
        <View style={styles.swapBadge}>
          <Ionicons name="swap-horizontal" size={54} color={Colors.primaryDark} />
        </View>
        <Text style={styles.title}>Sıra değişti</Text>
        <Text style={styles.sub}>Aynı final sorusu, yeni süre.</Text>

        <View style={styles.playerPanel}>
          <Text style={styles.panelLabel}>Şimdi sıra</Text>
          <PlayerBadge name={nextName} playerNumber={nextPlayer} active />
          <Text style={styles.infoText}>İlk oyuncu doğru cevap veremedi.</Text>
        </View>
      </View>

      <ActionButton label="Devam Et" variant="accent" fullWidth onPress={onContinue} icon="arrow-forward" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  swapBadge: {
    width: 132,
    height: 132,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.lg,
  },
  title: {
    fontSize: Font.title + 2,
    fontWeight: '900',
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  sub: { color: Colors.muted, fontSize: Font.body, fontWeight: '700', marginBottom: Spacing.lg },
  playerPanel: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    alignItems: 'center',
    width: '100%',
    ...Shadow.md,
  },
  panelLabel: {
    fontSize: Font.small,
    color: Colors.muted,
    textTransform: 'uppercase',
    fontWeight: '900',
  },
  infoText: {
    fontSize: Font.small,
    color: Colors.muted,
    fontWeight: '700',
    textAlign: 'center',
  },
});
