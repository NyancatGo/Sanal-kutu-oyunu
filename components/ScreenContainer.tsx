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
      <Body
        style={!scroll ? styles.body : undefined}
        contentContainerStyle={
          scroll ? [styles.scrollContent, contentStyle] : undefined
        }
      >
        {scroll ? children : <View style={[styles.inner, contentStyle]}>{children}</View>}
      </Body>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { flex: 1 },
  inner: { flex: 1, padding: Spacing.lg },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xl },
});
