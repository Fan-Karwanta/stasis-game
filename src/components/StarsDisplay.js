import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';

const StarsDisplay = ({ stars, maxStars = 3, size = 32, animate = false }) => {
  return (
    <View style={styles.container}>
      {[...Array(maxStars)].map((_, index) => (
        <Star
          key={index}
          filled={index < stars}
          size={size}
          animate={animate}
          delay={index * 200}
        />
      ))}
    </View>
  );
};

const Star = ({ filled, size, animate, delay }) => {
  const scale = useSharedValue(animate ? 0 : 1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (animate && filled) {
      scale.value = withDelay(
        delay,
        withSequence(
          withSpring(1.3),
          withSpring(1)
        )
      );
      rotation.value = withDelay(
        delay,
        withSequence(
          withSpring(15),
          withSpring(-15),
          withSpring(0)
        )
      );
    }
  }, [animate, filled]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.Text
      style={[
        styles.star,
        { fontSize: size },
        filled ? styles.starFilled : styles.starEmpty,
        animatedStyle,
      ]}
    >
      ⭐
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  star: {
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  starFilled: {
    opacity: 1,
  },
  starEmpty: {
    opacity: 0.3,
  },
});

export default StarsDisplay;
