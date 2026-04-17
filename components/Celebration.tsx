import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const EMOJIS = ['🎉', '⭐', '✨', '🎊', '🏆', '🥳'];
const { width: W, height: H } = Dimensions.get('window');

type Piece = {
  anim: Animated.Value;
  x: number;
  delay: number;
  emoji: string;
  rotate: Animated.Value;
  size: number;
};

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }).map(() => ({
    anim: new Animated.Value(0),
    rotate: new Animated.Value(0),
    x: Math.random() * W,
    delay: Math.random() * 400,
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    size: 22 + Math.floor(Math.random() * 22),
  }));
}

export function Celebration({ active }: { active: boolean }) {
  const piecesRef = useRef<Piece[]>(makePieces(18));

  useEffect(() => {
    if (!active) return;
    const pieces = piecesRef.current;
    pieces.forEach((p) => {
      p.anim.setValue(0);
      p.rotate.setValue(0);
      Animated.parallel([
        Animated.timing(p.anim, {
          toValue: 1,
          duration: 1800 + Math.random() * 800,
          delay: p.delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.rotate, {
          toValue: 1,
          duration: 1800 + Math.random() * 800,
          delay: p.delay,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [active]);

  if (!active) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {piecesRef.current.map((p, i) => {
        const translateY = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-40, H + 40],
        });
        const rotate = p.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '540deg'],
        });
        const opacity = p.anim.interpolate({
          inputRange: [0, 0.1, 0.9, 1],
          outputRange: [0, 1, 1, 0],
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              transform: [{ translateY }, { rotate }],
              opacity,
            }}
          >
            <Text style={{ fontSize: p.size }}>{p.emoji}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}
