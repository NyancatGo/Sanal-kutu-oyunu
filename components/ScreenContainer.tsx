import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
};

export function ScreenContainer({ children, scroll, style, contentStyle }: Props) {
  const Body = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.safe, style]} edges={['top', 'bottom']}>
      <View pointerEvents="none" style={styles.bandOne} />
      <View pointerEvents="none" style={styles.bandTwo} />
      <View pointerEvents="none" style={styles.lineOne} />
      <Body
        style={!scroll ? styles.body : undefined}
        contentContainerStyle={
          scroll ? [styles.scrollContent, contentStyle] : undefined
        }
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
    padding: Spacing.lg,
    flex: 1,
  },
  scrollContent: { flexGrow: 1, paddingBottom: Spacing.xl },
  bandOne: {
    position: 'absolute',
    top: -80,
    right: -120,
    width: 260,
    height: 180,
    borderRadius: 70,
    backgroundColor: Colors.softBlue,
    transform: [{ rotate: '-18deg' }],
    opacity: 0.75,
  },
  bandTwo: {
    position: 'absolute',
    bottom: -90,
    left: -110,
    width: 260,
    height: 180,
    borderRadius: 70,
    backgroundColor: Colors.cream,
    transform: [{ rotate: '16deg' }],
    opacity: 0.8,
  },
  lineOne: {
    position: 'absolute',
    top: 92,
    left: -40,
    width: 170,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    opacity: 0.28,
    transform: [{ rotate: '-12deg' }],
  },
});
