import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import AnimatedButton from '../components/AnimatedButton';
import { COLORS } from '../constants/colors';
import { useGame } from '../context/GameContext';

const FloatingIcon = ({ icon, delay, startX, startY }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.4, { duration: 500 }));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-20, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.floatingIcon,
        { left: startX, top: startY },
        animatedStyle,
      ]}
    >
      <Text style={styles.floatingIconText}>{icon}</Text>
    </Animated.View>
  );
};

const HomeScreen = ({ navigation }) => {
  const { progress } = useGame();

  const floatingIcons = [
    { icon: '🌡️', x: '10%', y: '15%', delay: 0 },
    { icon: '💧', x: '80%', y: '20%', delay: 300 },
    { icon: '🍬', x: '15%', y: '70%', delay: 600 },
    { icon: '❤️', x: '75%', y: '65%', delay: 900 },
    { icon: '⚡', x: '50%', y: '10%', delay: 1200 },
    { icon: '🧬', x: '85%', y: '45%', delay: 1500 },
  ];

  return (
    <View style={styles.container}>
      {floatingIcons.map((item, index) => (
        <FloatingIcon
          key={index}
          icon={item.icon}
          startX={item.x}
          startY={item.y}
          delay={item.delay}
        />
      ))}

      <Animated.View entering={FadeIn.delay(200)} style={styles.header}>
        <Text style={styles.title}>STASIS</Text>
        <Text style={styles.subtitle}>Homeostasis Manager</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>⭐ {progress.totalStars}</Text>
            <Text style={styles.statLabel}>Total Stars</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>🏆 {progress.completedLevels.length}/4</Text>
            <Text style={styles.statLabel}>Systems</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(400)} style={styles.buttonContainer}>
        <AnimatedButton
          title="PLAY"
          icon="▶️"
          onPress={() => navigation.navigate('SystemSelect')}
          variant="primary"
        />

        <AnimatedButton
          title="HOW TO PLAY"
          icon="📖"
          onPress={() => navigation.navigate('Instructions')}
          variant="secondary"
          style={styles.buttonSpacing}
        />

        <AnimatedButton
          title="LEARNING GOALS"
          icon="🎯"
          onPress={() => navigation.navigate('LearningGoals')}
          variant="outline"
          style={styles.buttonSpacing}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },
  floatingIcon: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingIconText: {
    fontSize: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 20,
  },
  statBox: {
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSpacing: {
    marginTop: 16,
  },
});

export default HomeScreen;
