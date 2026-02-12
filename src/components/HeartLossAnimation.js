import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useGame } from '../context/GameContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HeartLossAnimation = () => {
  const { heartLostTrigger } = useGame();
  const [visible, setVisible] = useState(false);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const crackOpacity = useSharedValue(0);

  useEffect(() => {
    if (heartLostTrigger === 0) return;

    setVisible(true);

    // Reset values
    opacity.value = 0;
    scale.value = 0.5;
    translateY.value = 0;
    rotation.value = 0;
    crackOpacity.value = 0;

    // Animate: pop in, crack, then fall down and fade
    opacity.value = withSequence(
      withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
      withDelay(600, withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) }))
    );

    scale.value = withSequence(
      withTiming(1.3, { duration: 200, easing: Easing.out(Easing.back) }),
      withTiming(1, { duration: 150 }),
      withDelay(200, withTiming(0.6, { duration: 400 }))
    );

    crackOpacity.value = withDelay(
      250,
      withTiming(1, { duration: 200 })
    );

    translateY.value = withDelay(
      500,
      withTiming(SCREEN_HEIGHT * 0.3, { duration: 500, easing: Easing.in(Easing.quad) })
    );

    rotation.value = withDelay(
      500,
      withTiming(25, { duration: 500, easing: Easing.in(Easing.quad) })
    );

    // Hide after animation completes
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [heartLostTrigger]);

  const heartStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const crackStyle = useAnimatedStyle(() => ({
    opacity: crackOpacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.heartContainer, heartStyle]}>
        <Text style={styles.heartEmoji}>💔</Text>
        <Animated.View style={[styles.crackOverlay, crackStyle]}>
          <Text style={styles.minusText}>-1</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  heartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -SCREEN_HEIGHT * 0.1,
  },
  heartEmoji: {
    fontSize: 72,
  },
  crackOverlay: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  minusText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default HeartLossAnimation;
