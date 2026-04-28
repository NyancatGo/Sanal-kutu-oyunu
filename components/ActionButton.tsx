import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';

type Variant = 'primary' | 'accent' | 'success' | 'danger' | 'ghost' | 'outline';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  haptic?: boolean;
  icon?: IconName;
  size?: 'md' | 'lg';
};

type VariantStyle = {
  bg: string;
  text: string;
  border?: string;
  shadow?: keyof typeof Shadow | false;
  highlight?: string;
};

const VARIANT_STYLES: Record<Variant, VariantStyle> = {
  primary: { bg: Colors.primary, text: '#FFFFFF', shadow: 'md', highlight: 'rgba(255,255,255,0.16)' },
  accent: { bg: Colors.accent, text: Colors.ink, shadow: 'md', highlight: 'rgba(255,255,255,0.35)' },
  success: { bg: Colors.success, text: '#FFFFFF', shadow: 'md', highlight: 'rgba(255,255,255,0.18)' },
  danger: { bg: Colors.danger, text: '#FFFFFF', shadow: 'md', highlight: 'rgba(255,255,255,0.18)' },
  ghost: { bg: 'transparent', text: Colors.primary, shadow: false },
  outline: {
    bg: Colors.surface,
    text: Colors.primaryDark,
    border: Colors.borderStrong,
    shadow: 'xs',
  },
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
  icon,
  size = 'md',
}: Props) {
  const vs = VARIANT_STYLES[variant];
  const isLg = size === 'lg';
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
        isLg && styles.baseLg,
        {
          backgroundColor: vs.bg,
          borderColor: vs.border ?? 'transparent',
          borderWidth: vs.border ? 1.5 : 0,
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        vs.shadow && !disabled && Shadow[vs.shadow],
        style,
      ]}
    >
      {vs.highlight && !disabled && <View style={[styles.highlight, { backgroundColor: vs.highlight }]} />}
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator color={vs.text} />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={isLg ? 22 : 20} color={vs.text} />}
            <Text style={[styles.label, isLg && styles.labelLg, { color: vs.text }]} numberOfLines={1}>
              {label}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    minHeight: 54,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  baseLg: {
    minHeight: 62,
    paddingVertical: 18,
    borderRadius: Radius.lg,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    opacity: 0.45,
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  label: { fontSize: Font.body + 1, fontWeight: '800', letterSpacing: 0.2 },
  labelLg: { fontSize: Font.bodyLg, fontWeight: '900' },
});
