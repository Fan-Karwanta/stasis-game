import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
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

  const getLearningContent = () => {
    switch (levelId) {
      case 1:
        return {
          title: '🌡️ Thermoregulation',
          concept: 'Negative Feedback Loop',
          explanation: 'Your body maintains a core temperature of around 37°C (98.6°F). The hypothalamus acts as your body\'s thermostat.',
          keyPoints: [
            '🧠 The hypothalamus detects temperature changes via thermoreceptors',
            '💦 When too hot: blood vessels dilate and sweat glands activate to release heat',
            '🥶 When too cold: muscles shiver to generate heat and blood vessels constrict',
            '🔄 This is NEGATIVE FEEDBACK - the response opposes the change'
          ],
          realWorld: 'Fever occurs when the hypothalamus raises the set point to fight infection. Heatstroke happens when this system fails.'
        };
      case 2:
        return {
          title: '💧 Water Balance (Osmoregulation)',
          concept: 'Hormonal Regulation',
          explanation: 'Your body is about 60% water. The kidneys and hormones work together to maintain proper hydration.',
          keyPoints: [
            '🧠 The hypothalamus detects blood concentration changes',
            '💧 ADH (antidiuretic hormone) tells kidneys to retain water when dehydrated',
            '🚽 When overhydrated, less ADH is released and more urine is produced',
            '❤️ Thirst signals prompt you to drink when water levels drop'
          ],
          realWorld: 'Diabetes insipidus occurs when ADH production fails, causing excessive urination and thirst.'
        };
      case 3:
        return {
          title: '🍬 Blood Sugar Regulation',
          concept: 'Insulin & Glucagon Balance',
          explanation: 'Blood glucose must stay between 70-100 mg/dL. The pancreas produces hormones to regulate this.',
          keyPoints: [
            '🍎 After eating: blood sugar rises, pancreas releases INSULIN',
            '💉 Insulin helps cells absorb glucose, lowering blood sugar',
            '🏋️ During fasting/exercise: blood sugar drops, pancreas releases GLUCAGON',
            '📊 Glucagon triggers liver to release stored glucose'
          ],
          realWorld: 'Type 1 Diabetes: immune system destroys insulin-producing cells. Type 2 Diabetes: cells become resistant to insulin.'
        };
      case 4:
        return {
          title: '🧬 System Integration',
          concept: 'Interconnected Body Systems',
          explanation: 'All body systems work together. When one fails, others must compensate, making balance harder.',
          keyPoints: [
            '🔗 Body systems are interconnected - one affects others',
            '⚠️ Disease in one system stresses the entire body',
            '🎯 Homeostasis requires constant monitoring and adjustment',
            '💪 Understanding these connections helps us stay healthy'
          ],
          realWorld: 'Chronic diseases often affect multiple systems. For example, diabetes can impact kidneys, eyes, nerves, and heart.'
        };
      default:
        return null;
    }
  };

  const learningContent = getLearningContent();

  return (
    <View style={styles.container}>
      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Educational Learning Section */}
        {learningContent && (
          <Animated.View entering={FadeInUp.delay(600)} style={styles.learningSection}>
            <View style={styles.learningHeader}>
              <Text style={styles.learningIcon}>📚</Text>
              <View>
                <Text style={styles.learningTitle}>What You Learned</Text>
                <Text style={styles.learningConcept}>{learningContent.concept}</Text>
              </View>
            </View>
            
            <Text style={styles.learningExplanation}>{learningContent.explanation}</Text>
            
            <View style={styles.keyPointsContainer}>
              <Text style={styles.keyPointsTitle}>Key Points:</Text>
              {learningContent.keyPoints.map((point, index) => (
                <Text key={index} style={styles.keyPoint}>{point}</Text>
              ))}
            </View>
            
            <View style={styles.realWorldContainer}>
              <Text style={styles.realWorldTitle}>🌍 Real-World Connection:</Text>
              <Text style={styles.realWorldText}>{learningContent.realWorld}</Text>
            </View>
          </Animated.View>
        )}

        {specialMessage && (
          <Animated.View entering={FadeInUp.delay(800)} style={styles.specialMessageContainer}>
            <Text style={styles.specialMessageIcon}>✨</Text>
            <Text style={styles.specialMessageText}>{specialMessage}</Text>
          </Animated.View>
        )}

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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
  learningSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
  },
  learningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  learningIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  learningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  learningConcept: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  learningExplanation: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 16,
  },
  keyPointsContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  keyPointsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  keyPoint: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 6,
  },
  realWorldContainer: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  realWorldTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
  },
  realWorldText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  specialMessageContainer: {
    backgroundColor: COLORS.success + '20',
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
