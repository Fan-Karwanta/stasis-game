import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';

const InstructionsScreen = ({ navigation }) => {
  const [animationStep, setAnimationStep] = useState(0);
  const temperatureValue = useSharedValue(37);
  const sweatOpacity = useSharedValue(0);
  const meterWidth = useSharedValue(50);

  useEffect(() => {
    // Animation sequence: temperature rises -> sweat appears -> temperature drops
    const runAnimation = () => {
      // Step 1: Temperature rises
      temperatureValue.value = withTiming(39, { duration: 1500 });
      meterWidth.value = withTiming(80, { duration: 1500 });
      
      setTimeout(() => setAnimationStep(1), 1500);
      
      // Step 2: Sweat appears
      setTimeout(() => {
        sweatOpacity.value = withTiming(1, { duration: 500 });
        setAnimationStep(2);
      }, 2000);
      
      // Step 3: Temperature drops
      setTimeout(() => {
        temperatureValue.value = withTiming(37, { duration: 1500 });
        meterWidth.value = withTiming(50, { duration: 1500 });
        setAnimationStep(3);
      }, 3000);
      
      // Reset and repeat
      setTimeout(() => {
        sweatOpacity.value = withTiming(0, { duration: 500 });
        setAnimationStep(0);
      }, 5000);
    };

    runAnimation();
    const interval = setInterval(runAnimation, 6000);
    return () => clearInterval(interval);
  }, []);

  const meterAnimatedStyle = useAnimatedStyle(() => ({
    width: `${meterWidth.value}%`,
    backgroundColor: meterWidth.value > 60 ? COLORS.high : COLORS.normal,
  }));

  const sweatAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sweatOpacity.value,
  }));

  const instructions = [
    { icon: '👀', text: 'Watch the system change.' },
    { icon: '🎯', text: 'Choose the correct response.' },
    { icon: '⚖️', text: 'Maintain balance over time.' },
  ];

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
        <Text style={styles.title}>📖 How to Play</Text>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {instructions.map((instruction, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(200 + index * 150)}
            style={styles.instructionCard}
          >
            <Text style={styles.instructionIcon}>{instruction.icon}</Text>
            <Text style={styles.instructionText}>{instruction.text}</Text>
          </Animated.View>
        ))}

        <Animated.View 
          entering={FadeInDown.delay(700)}
          style={styles.demoContainer}
        >
          <Text style={styles.demoTitle}>Example: Temperature Regulation</Text>
          
          <View style={styles.demoBody}>
            <View style={styles.bodyIcon}>
              <Text style={styles.bodyEmoji}>🧍</Text>
              <Animated.Text style={[styles.sweatEmoji, sweatAnimatedStyle]}>
                💦
              </Animated.Text>
            </View>
            
            <View style={styles.meterContainer}>
              <Text style={styles.meterLabel}>Body Temperature</Text>
              <View style={styles.meter}>
                <Animated.View style={[styles.meterFill, meterAnimatedStyle]} />
              </View>
              <View style={styles.meterLabels}>
                <Text style={styles.meterValue}>36°C</Text>
                <Text style={styles.meterValue}>40°C</Text>
              </View>
            </View>
          </View>

          <View style={styles.stepIndicator}>
            <View style={[styles.step, animationStep >= 1 && styles.stepActive]}>
              <Text style={styles.stepText}>🌡️ Temp rises</Text>
            </View>
            <Text style={styles.stepArrow}>→</Text>
            <View style={[styles.step, animationStep >= 2 && styles.stepActive]}>
              <Text style={styles.stepText}>💦 Sweat</Text>
            </View>
            <Text style={styles.stepArrow}>→</Text>
            <View style={[styles.step, animationStep >= 3 && styles.stepActive]}>
              <Text style={styles.stepText}>✓ Balance</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(900)}
          style={styles.colorGuide}
        >
          <Text style={styles.colorGuideTitle}>Color Guide</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: COLORS.normal }]} />
            <Text style={styles.colorText}>Green = Normal / Balanced</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: COLORS.high }]} />
            <Text style={styles.colorText}>Red = High / Excess</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: COLORS.low }]} />
            <Text style={styles.colorText}>Blue = Low / Deficiency</Text>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeIn.delay(1100)} style={styles.footer}>
        <Pressable
          style={styles.startButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.startButtonText}>Got it!</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  instructionText: {
    flex: 1,
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  demoContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  demoBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  bodyIcon: {
    alignItems: 'center',
    position: 'relative',
  },
  bodyEmoji: {
    fontSize: 60,
  },
  sweatEmoji: {
    fontSize: 24,
    position: 'absolute',
    top: 10,
    right: -15,
  },
  meterContainer: {
    flex: 1,
    marginLeft: 20,
  },
  meterLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  meter: {
    height: 20,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
  },
  meterFill: {
    height: '100%',
    borderRadius: 8,
  },
  meterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  meterValue: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  step: {
    backgroundColor: COLORS.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
  },
  stepActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  stepText: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  stepArrow: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginHorizontal: 4,
  },
  colorGuide: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorGuideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginRight: 12,
  },
  colorText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  footer: {
    padding: 20,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: COLORS.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default InstructionsScreen;
