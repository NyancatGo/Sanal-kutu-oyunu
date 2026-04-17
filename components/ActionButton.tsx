import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Font, Radius, Spacing } from '@/constants/theme';

type Variant = 'primary' | 'accent' | 'success' | 'danger' | 'ghost' | 'outline';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  haptic?: boolean;
};

const VARIANT_STYLES: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary: { bg: Colors.primary, text: '#FFFFFF' },
  accent: { bg: Colors.accent, text: Colors.primaryDark },
  success: { bg: Colors.success, text: '#FFFFFF' },
  danger: { bg: Colors.danger, text: '#FFFFFF' },
  ghost: { bg: 'transparent', text: Colors.primary },
  outline: { bg: 'transparent', text: Colors.primary, border: Colors.primary },
};

export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  fullWidth,
  style,
  haptic = true,
}: Props) {
  const vs = VARIANT_STYLES[variant];
  return (
    <Pressable
      onPress={() => {
        if (disabled || loading) return;
        if (haptic) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        onPress();
      }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: vs.bg,
          borderColor: vs.border ?? 'transparent',
          borderWidth: vs.border ? 2 : 0,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
          width: fullWidth ? '100%' : undefined,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator color={vs.text} />
        ) : (
          <Text style={[styles.label, { color: vs.text }]}>{label}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 56,
    justifyContent: 'center',
  },
  inner: { alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: Font.body + 2, fontWeight: '700', letterSpacing: 0.3 },
});
