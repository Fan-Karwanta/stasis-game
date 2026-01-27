import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';

const SplashScreen = ({ navigation }) => {
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.5);
  const subtitleOpacity = useSharedValue(0);
  const bodyPulse = useSharedValue(1);
  const indicatorOpacity = useSharedValue(0);

  useEffect(() => {
    // Fade in title
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    titleScale.value = withDelay(
      300,
      withSequence(
        withTiming(1.1, { duration: 400, easing: Easing.out(Easing.back) }),
        withTiming(1, { duration: 200 })
      )
    );
    
    // Fade in subtitle
    subtitleOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    
    // Pulse body outline
    bodyPulse.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    
    // Show indicators
    indicatorOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }));

    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const bodyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bodyPulse.value }],
  }));

  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
        <Text style={styles.title}>STASIS</Text>
      </Animated.View>

      <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
        Managing the Body's Balance
      </Animated.Text>

      <Animated.View style={[styles.bodyContainer, bodyAnimatedStyle]}>
        <View style={styles.bodySilhouette}>
          <View style={styles.head} />
          <View style={styles.torso}>
            <Animated.View style={[styles.indicatorsContainer, indicatorAnimatedStyle]}>
              <Text style={styles.indicator}>🌡️</Text>
              <Text style={styles.indicator}>💧</Text>
              <Text style={styles.indicator}>🍬</Text>
            </Animated.View>
          </View>
          <View style={styles.legsContainer}>
            <View style={styles.leg} />
            <View style={styles.leg} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  bodyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  bodySilhouette: {
    alignItems: 'center',
  },
  head: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  torso: {
    width: 60,
    height: 80,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  indicatorsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    fontSize: 18,
  },
  legsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  leg: {
    width: 20,
    height: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
});

export default SplashScreen;
