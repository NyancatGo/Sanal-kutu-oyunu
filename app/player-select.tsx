import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors } from '@/constants/theme';
import { useGame } from '@/context/GameContext';

export default function PlayerSelectRedirect() {
  const { state } = useGame();

  useEffect(() => {
    if (state.phase === 'setup') router.replace('/');
    else if (state.phase === 'starter-selection') router.replace('/starter-select');
    else if (state.phase === 'ready' || state.phase === 'question' || state.phase === 'final-question') router.replace('/question');
    else if (state.phase === 'digit-reveal') router.replace('/reveal');
    else if (state.phase === 'code-entry') router.replace('/code-entry');
    else if (state.phase === 'code-handoff') router.replace('/code-handoff');
    else if (state.phase === 'result') router.replace('/result');
  }, [state.phase]);

  return (
    <ScreenContainer>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: Colors.muted }}>Yönlendiriliyor...</Text>
      </View>
    </ScreenContainer>
  );
}
