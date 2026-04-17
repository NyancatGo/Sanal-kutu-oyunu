import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { PlayerBadge } from '@/components/PlayerBadge';
import { ActionButton } from '@/components/ActionButton';
import { Colors, Font, Radius, Spacing } from '@/constants/theme';
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
        <Text style={styles.emoji}>🔄</Text>
        <Text style={styles.title}>Sıra diğer oyuncuda</Text>
        <Text style={styles.sub}>Aynı soru, yeni süre.</Text>

        <View style={styles.badgeWrap}>
          <PlayerBadge name={nextName} playerNumber={nextPlayer} active />
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            {`İlk oyuncu bilemedi. Şimdi sıra ${nextName}'da.`}
          </Text>
          <Text style={styles.infoTextSmall}>
            {'Telefonu ona uzat. Hazır olunca “Devam Et”e bas.'}
          </Text>
        </View>
      </View>

      <ActionButton label="Devam Et" variant="accent" fullWidth onPress={onContinue} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emoji: { fontSize: 72 },
  title: {
    fontSize: Font.title,
    fontWeight: '800',
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  sub: { color: Colors.muted, fontSize: Font.body, marginBottom: Spacing.lg },
  badgeWrap: { marginBottom: Spacing.lg },
  info: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
    alignItems: 'center',
  },
  infoText: {
    fontSize: Font.body + 1,
    color: Colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  infoTextSmall: {
    fontSize: Font.small,
    color: Colors.muted,
    textAlign: 'center',
  },
});
