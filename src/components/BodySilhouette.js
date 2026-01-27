import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { COLORS, getMeterColor } from '../constants/colors';

const BodySilhouette = ({ 
  value, 
  normalMin, 
  normalMax, 
  showIndicators = true,
  systemType = 'temperature' 
}) => {
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  const statusColor = getMeterColor(value, normalMin, normalMax);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const bodyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const getSystemIcon = () => {
    switch (systemType) {
      case 'temperature':
        return '🌡️';
      case 'hydration':
        return '💧';
      case 'glucose':
        return '🍬';
      default:
        return '⚡';
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glowEffect, { backgroundColor: statusColor }, glowAnimatedStyle]} />
      <Animated.View style={[styles.body, bodyAnimatedStyle]}>
        <View style={styles.head} />
        <View style={styles.torso}>
          {showIndicators && (
            <View style={[styles.indicator, { backgroundColor: statusColor }]}>
              <Animated.Text style={styles.indicatorIcon}>{getSystemIcon()}</Animated.Text>
            </View>
          )}
        </View>
        <View style={styles.legsContainer}>
          <View style={styles.leg} />
          <View style={styles.leg} />
        </View>
        <View style={styles.armsContainer}>
          <View style={styles.arm} />
          <View style={styles.arm} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 180,
  },
  glowEffect: {
    position: 'absolute',
    width: 140,
    height: 200,
    borderRadius: 70,
  },
  body: {
    alignItems: 'center',
  },
  head: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.textSecondary,
  },
  torso: {
    width: 50,
    height: 70,
    backgroundColor: COLORS.textSecondary,
    borderRadius: 10,
    marginTop: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorIcon: {
    fontSize: 20,
  },
  legsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 5,
  },
  leg: {
    width: 18,
    height: 50,
    backgroundColor: COLORS.textSecondary,
    borderRadius: 8,
  },
  armsContainer: {
    position: 'absolute',
    top: 50,
    flexDirection: 'row',
    width: 100,
    justifyContent: 'space-between',
  },
  arm: {
    width: 16,
    height: 45,
    backgroundColor: COLORS.textSecondary,
    borderRadius: 8,
  },
});

export default BodySilhouette;
