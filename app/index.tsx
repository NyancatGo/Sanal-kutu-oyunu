import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { HoldButton } from '@/components/HoldButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';
import { useGame } from '@/context/GameContext';

const FLOW = [
  { icon: 'help-circle', label: 'Soru', tone: Colors.primary },
  { icon: 'key', label: 'Hane', tone: Colors.accent },
  { icon: 'lock-open', label: 'Kilit', tone: Colors.teal },
  { icon: 'trophy', label: 'Final', tone: Colors.coral },
] as const;

export default function Home() {
  const { dispatch } = useGame();
  const enter = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [enter, float]);

  const enterY = enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <ScreenContainer>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <Ionicons name="lock-closed" size={18} color={Colors.accent} />
        </View>
        <Text style={styles.brandText}>Şifre Kutusu</Text>
        <View style={styles.versionPill}>
          <Text style={styles.versionText}>v1.0</Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.heroCard,
          { opacity: enter, transform: [{ translateY: enterY }] },
        ]}
      >
        <Animated.View style={[styles.heroLockWrap, { transform: [{ translateY: floatY }] }]}>
          <View style={styles.heroLockGlow} />
          <View style={styles.heroLock}>
            <Ionicons name="lock-closed" size={42} color={Colors.ink} />
          </View>
        </Animated.View>

        <Text style={styles.title}>Sınıf İçi Şifre Yarışı</Text>
        <Text style={styles.subtitle}>
          İki grup, dört hane, bir kilit ve final sorusu. Doğru cevap kazandırır,
          kilidi açan finale kalır.
        </Text>

        <View style={styles.flowRow}>
          {FLOW.map((step, idx) => (
            <React.Fragment key={step.label}>
              <View style={styles.flowItem}>
                <View style={[styles.flowIcon, { backgroundColor: step.tone }]}>
                  <Ionicons name={step.icon} size={16} color="#fff" />
                </View>
                <Text style={styles.flowLabel}>{step.label}</Text>
              </View>
              {idx < FLOW.length - 1 && (
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={Colors.mutedSoft}
                />
              )}
            </React.Fragment>
          ))}
        </View>
      </Animated.View>

      <View style={{ flex: 1 }} />

      <View style={styles.footer}>
        <View style={styles.teacherRow}>
          <View style={styles.teacherIcon}>
            <Ionicons name="school" size={16} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.teacherTitle}>Öğretmen Paneli</Text>
            <Text style={styles.teacherHint}>
              Yanlışlıkla açılmaması için basılı tutun.
            </Text>
          </View>
        </View>
        <HoldButton
          label="Oyunu Kur"
          holdLabel="Açılıyor…"
          icon="settings-outline"
          onComplete={() => {
            dispatch({ type: 'UNLOCK_TEACHER' });
            router.push('/setup');
          }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    flex: 1,
    fontSize: Font.bodyLg,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  versionPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  versionText: {
    fontSize: 10,
    color: Colors.muted,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.md,
  },
  heroLockWrap: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLockGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.accent,
    opacity: 0.15,
  },
  heroLock: {
    width: 86,
    height: 86,
    borderRadius: 26,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  title: {
    fontSize: Font.title,
    fontWeight: '900',
    color: Colors.ink,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: Font.body - 1,
    color: Colors.muted,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: (Font.body - 1) * 1.5,
    paddingHorizontal: Spacing.sm,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  flowItem: { alignItems: 'center', gap: 6 },
  flowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  footer: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  teacherIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherTitle: {
    color: Colors.ink,
    fontSize: Font.body,
    fontWeight: '900',
  },
  teacherHint: {
    color: Colors.muted,
    fontSize: Font.small,
    fontWeight: '600',
    marginTop: 1,
  },
});
