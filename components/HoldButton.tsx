import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Colors, Font, Radius, Shadow, Spacing } from '@/constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  label: string;
  holdLabel?: string;
  durationMs?: number;
  onComplete: () => void;
  style?: ViewStyle;
  icon?: IconName;
  variant?: 'teacher' | 'subtle';
};

export function HoldButton({
  label,
  holdLabel = 'Basılı tut…',
  durationMs = 1100,
  onComplete,
  style,
  icon = 'lock-closed-outline',
  variant = 'teacher',
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const [holding, setHolding] = useState(false);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => () => animRef.current?.stop(), []);

  const start = () => {
    setHolding(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: durationMs,
      useNativeDriver: false,
    });
    animRef.current.start(({ finished }) => {
      if (finished) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        onComplete();
      }
      setHolding(false);
    });
  };

  const cancel = () => {
    animRef.current?.stop();
    Animated.timing(progress, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
    setHolding(false);
  };

  const widthInterp = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const isSubtle = variant === 'subtle';
  const accentText = isSubtle ? Colors.muted : Colors.primaryDark;
  const borderColor = isSubtle ? Colors.border : Colors.primary;

  return (
    <Pressable
      onPressIn={start}
      onPressOut={cancel}
      style={[
        styles.wrap,
        {
          borderColor,
          backgroundColor: isSubtle ? Colors.surfaceMuted : Colors.surface,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            width: widthInterp,
            backgroundColor: isSubtle ? Colors.softBlue : Colors.accentSoft,
          },
        ]}
      />
      <View style={styles.content}>
        <Ionicons
          name={holding ? 'timer-outline' : icon}
          size={18}
          color={accentText}
        />
        <Text style={[styles.label, { color: accentText }]} numberOfLines={1}>
          {holding ? holdLabel : label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 50,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    ...Shadow.xs,
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    opacity: 0.6,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  label: {
    fontSize: Font.body,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
