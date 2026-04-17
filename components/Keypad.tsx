import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Font, Radius, Spacing } from '@/constants/theme';

type Props = {
  onDigit: (digit: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled?: boolean;
};

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function Keypad({ onDigit, onClear, onSubmit, disabled }: Props) {
  const press = (fn: () => void, style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (disabled) return;
    Haptics.impactAsync(style).catch(() => {});
    fn();
  };

  return (
    <View style={styles.grid}>
      {DIGITS.map((d) => (
        <KeyButton key={d} label={d} onPress={() => press(() => onDigit(d))} disabled={disabled} />
      ))}
      <KeyButton
        label="Temizle"
        variant="muted"
        onPress={() => press(onClear, Haptics.ImpactFeedbackStyle.Medium)}
        disabled={disabled}
      />
      <KeyButton label="0" onPress={() => press(() => onDigit('0'))} disabled={disabled} />
      <KeyButton
        label="Onayla"
        variant="primary"
        onPress={() => press(onSubmit, Haptics.ImpactFeedbackStyle.Medium)}
        disabled={disabled}
      />
    </View>
  );
}

function KeyButton({
  label,
  onPress,
  variant = 'default',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'primary' | 'muted';
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.key,
        variant === 'primary' && { backgroundColor: Colors.primary },
        variant === 'muted' && { backgroundColor: Colors.border },
        { opacity: disabled ? 0.4 : pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
      ]}
    >
      <Text
        style={[
          styles.keyLabel,
          variant === 'primary' && { color: '#fff', fontSize: Font.body + 2 },
          variant === 'muted' && { color: Colors.text, fontSize: Font.body + 2 },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  key: {
    width: '31.5%',
    aspectRatio: 1.4,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  keyLabel: {
    fontSize: Font.heading + 4,
    fontWeight: '700',
    color: Colors.text,
  },
});
