import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  decor?: boolean;
};

export function ScreenContainer({
  children,
  scroll,
  style,
  contentStyle,
  decor = true,
}: Props) {
  const Body = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.safe, style]} edges={['top', 'bottom']}>
      {decor && (
        <>
          <View pointerEvents="none" style={styles.glowTop} />
          <View pointerEvents="none" style={styles.glowBottom} />
          <View pointerEvents="none" style={styles.gridDot} />
        </>
      )}
      <Body
        style={!scroll ? styles.body : undefined}
        contentContainerStyle={
          scroll ? [styles.scrollContent, contentStyle] : undefined
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.inner, !scroll && contentStyle]}>{children}</View>
      </Body>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg, overflow: 'hidden' },
  body: { flex: 1 },
  inner: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    flex: 1,
  },
  scrollContent: { flexGrow: 1, paddingBottom: Spacing.xl },
  glowTop: {
    position: 'absolute',
    top: -160,
    right: -120,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: Colors.softBlue,
    opacity: 0.6,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -200,
    left: -140,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: Colors.cream,
    opacity: 0.55,
  },
  gridDot: {
    position: 'absolute',
    top: 96,
    left: 30,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    opacity: 0.5,
  },
});
