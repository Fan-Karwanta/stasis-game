import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withSequence,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { useGame } from '../context/GameContext';
import { StarsDisplay, Confetti, AnimatedButton } from '../components';

const ResultsScreen = ({ navigation, route }) => {
  const { levelId, stars, timeBalanced, totalTime, systemName, specialMessage } = route.params;
  const { completeLevel, progress } = useGame();
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [saved, setSaved] = useState(false);

  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Save progress
    if (!saved) {
      completeLevel(levelId, stars, timeBalanced);
      setSaved(true);
    }

    // Show confetti for good performance
    if (stars >= 2) {
      setShowConfetti(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Pulse animation
    pulseScale.value = withDelay(
      500,
      withSequence(
        withSpring(1.05),
        withSpring(1)
      )
    );
    glowOpacity.value = withDelay(300, withSpring(0.3));
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const balancePercentage = Math.round((timeBalanced / totalTime) * 100);

  const getMasteryMessage = () => {
    if (stars === 3) return "Perfect! Your body systems remained in balance!";
    if (stars === 2) return "Good job! You maintained homeostasis well.";
    return "Keep practicing! Homeostasis requires constant attention.";
  };

  const getBalanceMessage = () => {
    if (balancePercentage >= 80) return "Excellent balance maintenance!";
    if (balancePercentage >= 50) return "Good effort at maintaining stability.";
    return "Try to keep systems balanced longer.";
  };

  const handleReplay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.replace(`Level${levelId}`);
  };

  const handleNextLevel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (levelId < 4) {
      navigation.replace(`Level${levelId + 1}`);
    } else {
      navigation.navigate('SystemSelect');
    }
  };

  const handleHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />

      <Animated.View entering={FadeIn.delay(200)} style={styles.header}>
        <Text style={styles.levelComplete}>Level Complete!</Text>
        <Text style={styles.systemName}>{systemName}</Text>
      </Animated.View>

      <Animated.View 
        entering={FadeInUp.delay(400)} 
        style={[styles.resultCard, containerAnimatedStyle]}
      >
        <Animated.View style={[styles.glow, glowAnimatedStyle]} />
        
        <View style={styles.starsContainer}>
          <StarsDisplay stars={stars} size={48} animate />
        </View>

        <Text style={styles.masteryMessage}>{getMasteryMessage()}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{timeBalanced}s</Text>
            <Text style={styles.statLabel}>Time Balanced</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{balancePercentage}%</Text>
            <Text style={styles.statLabel}>Stability</Text>
          </View>
        </View>

        <Text style={styles.balanceMessage}>{getBalanceMessage()}</Text>
      </Animated.View>

      {specialMessage && (
        <Animated.View entering={FadeInUp.delay(600)} style={styles.specialMessageContainer}>
          <Text style={styles.specialMessageIcon}>📚</Text>
          <Text style={styles.specialMessageText}>{specialMessage}</Text>
        </Animated.View>
      )}

      <Animated.View entering={FadeInUp.delay(800)} style={styles.feedbackContainer}>
        <Text style={styles.feedbackTitle}>What You Learned:</Text>
        <Text style={styles.feedbackText}>
          {levelId === 1 && "The hypothalamus detects temperature changes and triggers sweating or shivering to maintain balance. This is negative feedback."}
          {levelId === 2 && "Water balance is maintained through thirst signals and kidney function. Sweating affects hydration levels."}
          {levelId === 3 && "Blood glucose is regulated by insulin and glucagon from the pancreas. This is a classic example of negative feedback."}
          {levelId === 4 && "When one system fails (like insulin production), maintaining overall homeostasis becomes much harder. This shows how diseases affect body balance."}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(1000)} style={styles.buttonContainer}>
        <AnimatedButton
          title="REPLAY"
          icon="🔄"
          onPress={handleReplay}
          variant="outline"
          style={styles.button}
        />
        
        {levelId < 4 && (
          <AnimatedButton
            title="NEXT SYSTEM"
            icon="➡️"
            onPress={handleNextLevel}
            variant="primary"
            style={styles.button}
          />
        )}
        
        <Pressable style={styles.homeButton} onPress={handleHome}>
          <Text style={styles.homeButtonText}>🏠 Back to Home</Text>
        </Pressable>
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
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  levelComplete: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  systemName: {
    fontSize: 18,
    color: COLORS.primary,
    marginTop: 4,
  },
  resultCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    backgroundColor: COLORS.success,
    borderRadius: 100,
  },
  starsContainer: {
    marginBottom: 20,
  },
  masteryMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.textSecondary + '30',
  },
  balanceMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  specialMessageContainer: {
    backgroundColor: COLORS.warning + '20',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  specialMessageIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  specialMessageText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  feedbackContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingVertical: 20,
    gap: 12,
  },
  button: {
    width: '100%',
  },
  homeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  homeButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default ResultsScreen;
