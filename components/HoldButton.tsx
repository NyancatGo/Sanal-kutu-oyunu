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
};

export function HoldButton({
  label,
  holdLabel = 'Basılı Tut…',
  durationMs = 1200,
  onComplete,
  style,
  icon = 'lock-closed-outline',
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

  return (
    <Pressable
      onPressIn={start}
      onPressOut={cancel}
      style={[styles.wrap, style]}
    >
      <Animated.View style={[styles.fill, { width: widthInterp }]} />
      <View style={styles.content}>
        <Ionicons
          name={holding ? 'timer-outline' : icon}
          size={19}
          color={holding ? Colors.primaryDark : Colors.primary}
        />
        <Text style={styles.label}>{holding ? holdLabel : label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 52,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.teal,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    ...Shadow.sm,
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: Colors.accent,
    opacity: 0.38,
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
    color: Colors.primary,
    letterSpacing: 0,
    textAlign: 'center',
  },
});
