import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ActionButton } from '@/components/ActionButton';
import { ScoreStrip } from '@/components/ScoreStrip';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';

export default function CodeHandoff() {
  const { state, dispatch } = useGame();
  const handoff = state.codeHandoff;

  const enter = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state.phase === 'setup') router.replace('/');
    else if (state.phase === 'starter-selection') router.replace('/starter-select');
    else if (state.phase === 'ready' || state.phase === 'question' || state.phase === 'final-question') router.replace('/question');
    else if (state.phase === 'digit-reveal') router.replace('/reveal');
    else if (state.phase === 'code-entry') router.replace('/code-entry');
    else if (state.phase === 'result') router.replace('/result');
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== 'code-handoff') return;
    enter.setValue(0);
    Animated.spring(enter, {
      toValue: 1,
      tension: 130,
      friction: 9,
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [enter, arrowAnim, state.phase]);

  if (state.phase !== 'code-handoff' || !handoff) {
    return (
      <ScreenContainer>
        <View style={styles.loading}>
          <Text style={{ color: Colors.muted }}>Yönlendiriliyor…</Text>
        </View>
      </ScreenContainer>
    );
  }

  const fromName =
    handoff.fromGroup === 1 ? state.config.group1 : state.config.group2;
  const toName = handoff.toGroup === 1 ? state.config.group1 : state.config.group2;
  const fromAccent = handoff.fromGroup === 1 ? Colors.teal : Colors.coral;
  const toAccent = handoff.toGroup === 1 ? Colors.teal : Colors.coral;
  const nextGroupHasFullCode = state.revealedDigits[handoff.toGroup].length >= 4;

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    dispatch({ type: 'CONFIRM_CODE_HANDOFF' });
  };

  const enterY = enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const arrowY = arrowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const arrowOpacity = arrowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 1, 0.4],
  });

  return (
    <ScreenContainer>
      <ScoreStrip
        group1={state.config.group1}
        group2={state.config.group2}
        digitsG1={state.revealedDigits[1]}
        digitsG2={state.revealedDigits[2]}
        activeGroup={handoff.fromGroup}
        centerLabel="Geçiş"
      />

      <Animated.View
        style={[
          styles.wrap,
          { opacity: enter, transform: [{ translateY: enterY }] },
        ]}
      >
        <View style={styles.alertBox}>
          <Ionicons name="alert-circle" size={18} color={Colors.danger} />
          <Text style={styles.alertText}>{handoff.message}</Text>
        </View>

        <View style={styles.handoffCard}>
          <Text style={styles.kicker}>SIRA DEĞİŞİYOR</Text>
          <Text style={styles.title}>Telefonu diğer gruba uzatın</Text>

          <View style={styles.flowGroups}>
            <View style={[styles.groupTile, styles.groupTileFrom]}>
              <View style={[styles.groupAvatar, { backgroundColor: fromAccent }]}>
                <Ionicons name="people" size={20} color="#fff" />
              </View>
              <Text style={styles.groupTileLabel}>BİTEN GRUP</Text>
              <Text style={styles.groupTileName} numberOfLines={2}>
                {fromName || `Grup ${handoff.fromGroup}`}
              </Text>
            </View>

            <Animated.View
              style={[
                styles.arrowCol,
                {
                  opacity: arrowOpacity,
                  transform: [{ translateY: arrowY }],
                },
              ]}
            >
              <Ionicons name="arrow-down" size={26} color={Colors.muted} />
              <Ionicons name="arrow-down" size={20} color={Colors.mutedSoft} />
            </Animated.View>

            <View style={[styles.groupTile, styles.groupTileTo, { borderColor: toAccent }]}>
              <View style={[styles.groupAvatar, styles.groupAvatarLg, { backgroundColor: toAccent }]}>
                <Ionicons name="people" size={24} color="#fff" />
              </View>
              <Text style={[styles.groupTileLabel, { color: toAccent }]}>SIRADAKİ GRUP</Text>
              <Text style={[styles.groupTileName, styles.groupTileNameLg]} numberOfLines={2}>
                {toName || `Grup ${handoff.toGroup}`}
              </Text>
              <View style={[styles.activePill, { backgroundColor: toAccent }]}>
                <Ionicons name="hand-left" size={11} color="#fff" />
                <Text style={styles.activePillText}>SİZE GELİYOR</Text>
              </View>
            </View>
          </View>

          <View style={styles.noteBox}>
            <Ionicons
              name={nextGroupHasFullCode ? 'lock-open-outline' : 'help-circle-outline'}
              size={16}
              color={Colors.primaryDark}
            />
            <Text style={styles.noteText}>
              {nextGroupHasFullCode
                ? `Onaydan sonra ${state.config.codeTimeLimit} saniyelik kilit denemesi başlar.`
                : 'Onaydan sonra diğer grubun sorusu başlayacak.'}
            </Text>
          </View>
        </View>
      </Animated.View>

      <ActionButton
        label={nextGroupHasFullCode ? 'Kilide Geç' : 'Soruya Geç'}
        variant="primary"
        size="lg"
        fullWidth
        icon="checkmark-circle"
        onPress={handleConfirm}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  wrap: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.dangerSoft,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  alertText: {
    flex: 1,
    color: Colors.danger,
    fontSize: Font.small + 1,
    fontWeight: '800',
    lineHeight: (Font.small + 1) * 1.4,
  },
  handoffCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    alignItems: 'center',
    ...Shadow.md,
  },
  kicker: {
    color: Colors.primary,
    fontSize: Font.small - 1,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  title: {
    color: Colors.ink,
    fontSize: Font.heading - 2,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  flowGroups: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  groupTile: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceMuted,
  },
  groupTileFrom: {
    opacity: 0.7,
  },
  groupTileTo: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    ...Shadow.sm,
  },
  groupAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupAvatarLg: {
    width: 48,
    height: 48,
    borderRadius: 16,
  },
  groupTileLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.muted,
    letterSpacing: 0.8,
    marginTop: 4,
  },
  groupTileName: {
    fontSize: Font.body,
    fontWeight: '900',
    color: Colors.ink,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  groupTileNameLg: { fontSize: Font.body + 2 },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    marginTop: 4,
  },
  activePillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  arrowCol: {
    alignItems: 'center',
    gap: -10,
    paddingVertical: 2,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.softBlue,
    width: '100%',
  },
  noteText: {
    flex: 1,
    color: Colors.primaryDark,
    fontSize: Font.small,
    fontWeight: '700',
    lineHeight: Font.small * 1.4,
  },
});
