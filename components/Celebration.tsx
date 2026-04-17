import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';

const SYMBOLS = ['★', '✦', '◆', '●'];
const PALETTE = [Colors.accent, Colors.teal, Colors.coral, Colors.success];
const { width: W, height: H } = Dimensions.get('window');

type Piece = {
  anim: Animated.Value;
  x: number;
  delay: number;
  symbol: string;
  rotate: Animated.Value;
  size: number;
  color: string;
};

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }).map(() => ({
    anim: new Animated.Value(0),
    rotate: new Animated.Value(0),
    x: Math.random() * W,
    delay: Math.random() * 420,
    symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    size: 18 + Math.floor(Math.random() * 18),
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
  }));
}

export function Celebration({ active }: { active: boolean }) {
  const piecesRef = useRef<Piece[]>(makePieces(16));

  useEffect(() => {
    if (!active) return;
    const pieces = piecesRef.current;
    pieces.forEach((p) => {
      p.anim.setValue(0);
      p.rotate.setValue(0);
      Animated.parallel([
        Animated.timing(p.anim, {
          toValue: 1,
          duration: 1800 + Math.random() * 700,
          delay: p.delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.rotate, {
          toValue: 1,
          duration: 1800 + Math.random() * 700,
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
            <Text style={{ fontSize: p.size, color: p.color, fontWeight: '900' }}>{p.symbol}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}
