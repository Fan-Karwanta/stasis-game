import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { useAudio } from '../context/AudioContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Fade-in wrapper that works reliably inside Modal on Android ───
const FadeInView = ({ delay = 0, duration = 400, style, children }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }));
    translateY.value = withDelay(delay, withTiming(0, { duration }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
};

// ─── Mini Meter for tutorial demos ───
const TutorialMeter = ({ value, config, animated = false }) => {
  const animatedWidth = useSharedValue(0);
  const percentage = ((value - config.minValue) / (config.maxValue - config.minValue)) * 100;
  const normalMinPct = ((config.normalMin - config.minValue) / (config.maxValue - config.minValue)) * 100;
  const normalMaxPct = ((config.normalMax - config.minValue) / (config.maxValue - config.minValue)) * 100;
  const statusColor = value < config.normalMin ? COLORS.low : value > config.normalMax ? COLORS.high : COLORS.normal;

  useEffect(() => {
    animatedWidth.value = withTiming(Math.min(100, Math.max(0, percentage)), {
      duration: animated ? 800 : 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [value]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${animatedWidth.value}%`,
    transform: [{ translateX: -7 }],
  }));

  return (
    <View style={tutorialMeterStyles.container}>
      <View style={tutorialMeterStyles.labelRow}>
        <Text style={tutorialMeterStyles.value}>
          {value.toFixed(1)} {config.unit}
        </Text>
        <View style={[tutorialMeterStyles.badge, { backgroundColor: statusColor }]}>
          <Text style={tutorialMeterStyles.badgeText}>
            {value < config.normalMin ? 'LOW' : value > config.normalMax ? 'HIGH' : 'NORMAL'}
          </Text>
        </View>
      </View>
      <View style={tutorialMeterStyles.track}>
        <View
          style={[
            tutorialMeterStyles.normalZone,
            { left: `${normalMinPct}%`, width: `${normalMaxPct - normalMinPct}%` },
          ]}
        />
        <Animated.View style={[tutorialMeterStyles.fill, { backgroundColor: statusColor }, fillStyle]} />
        <Animated.View style={[tutorialMeterStyles.indicator, { backgroundColor: statusColor }, indicatorStyle]} />
      </View>
    </View>
  );
};

const tutorialMeterStyles = StyleSheet.create({
  container: { width: '100%', marginVertical: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  value: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  track: {
    height: 22,
    backgroundColor: COLORS.background,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    overflow: 'visible',
    position: 'relative',
  },
  normalZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.normal,
  },
  fill: { height: '100%', borderRadius: 9, opacity: 0.85 },
  indicator: {
    position: 'absolute',
    top: -3,
    width: 14,
    height: 28,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});

// ─── Action Button Preview ───
const ActionButtonPreview = ({ action, index, levelColor }) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const itemOpacity = useSharedValue(0);
  const itemTranslateY = useSharedValue(16);

  useEffect(() => {
    const d = index * 200;
    itemOpacity.value = withDelay(d, withTiming(1, { duration: 400 }));
    itemTranslateY.value = withDelay(d, withTiming(0, { duration: 400 }));
    setTimeout(() => {
      scale.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withSpring(1, { damping: 8 })
      );
      glowOpacity.value = withSequence(
        withTiming(0.6, { duration: 300 }),
        withTiming(0, { duration: 500 })
      );
    }, d + 500);
  }, []);

  const wrapperStyle = useAnimatedStyle(() => ({
    opacity: itemOpacity.value,
    transform: [{ translateY: itemTranslateY.value }],
  }));

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const getDirectionColor = () => {
    if (action.direction === 'up') return COLORS.high;
    if (action.direction === 'down') return COLORS.low;
    if (action.direction === 'disabled') return COLORS.levelLocked;
    return COLORS.textSecondary;
  };

  const getEffectLabel = () => {
    if (action.direction === 'disabled') return 'DISABLED';
    if (action.effect === 0) return 'No change';
    const sign = action.effect > 0 ? '+' : '';
    return `${sign}${action.effect} ${action.unit}`;
  };

  const isDisabled = action.direction === 'disabled';

  return (
    <Animated.View style={[actionStyles.wrapper, wrapperStyle]}>
      <Animated.View style={[actionStyles.glowRing, { borderColor: levelColor }, glowStyle]} />
      <Animated.View style={[actionStyles.container, isDisabled && actionStyles.disabledContainer, animStyle]}>
        <View style={[actionStyles.iconCircle, { backgroundColor: isDisabled ? COLORS.levelLocked + '30' : levelColor + '20' }]}>
          <Text style={actionStyles.icon}>{action.icon}</Text>
        </View>
        <Text style={[actionStyles.name, isDisabled && actionStyles.disabledText]}>{action.name}</Text>
        <View style={[actionStyles.effectBadge, { backgroundColor: getDirectionColor() + '20' }]}>
          <Text style={[actionStyles.effectText, { color: getDirectionColor() }]}>
            {getEffectLabel()}
          </Text>
        </View>
        {action.direction === 'up' && <Text style={actionStyles.arrow}>↑</Text>}
        {action.direction === 'down' && <Text style={[actionStyles.arrow, { color: COLORS.low }]}>↓</Text>}
        {action.direction === 'disabled' && <Text style={actionStyles.arrow}>❌</Text>}
      </Animated.View>
      <Text style={[actionStyles.explanation, isDisabled && actionStyles.disabledText]}>
        {action.explanation}
      </Text>
    </Animated.View>
  );
};

const actionStyles = StyleSheet.create({
  wrapper: { marginBottom: 12, alignItems: 'center' },
  glowRing: {
    position: 'absolute',
    top: -2,
    left: 8,
    right: 8,
    height: 68,
    borderRadius: 16,
    borderWidth: 2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    padding: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledContainer: { opacity: 0.5 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 24 },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  disabledText: { color: COLORS.levelLocked },
  effectBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
  },
  effectText: { fontSize: 12, fontWeight: '700' },
  arrow: { fontSize: 18, color: COLORS.high, fontWeight: 'bold' },
  explanation: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

// ─── Demo Step Animation ───
const DemoStepView = ({ step, index, isActive, meterConfig }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (isActive) {
      opacity.value = withTiming(1, { duration: 400 });
      translateY.value = withSpring(0, { damping: 12 });
    }
  }, [isActive]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!isActive) return null;

  return (
    <Animated.View style={[demoStyles.stepContainer, animStyle]}>
      <View style={demoStyles.stepHeader}>
        <View style={[demoStyles.stepNumber, { backgroundColor: step.status === 'NORMAL' ? COLORS.success : step.status === 'HIGH' ? COLORS.high : COLORS.low }]}>
          <Text style={demoStyles.stepNumberText}>{index + 1}</Text>
        </View>
        <Text style={demoStyles.stepLabel}>{step.label}</Text>
      </View>
      {step.action && (
        <View style={demoStyles.actionIndicator}>
          <Text style={demoStyles.actionIcon}>{step.actionIcon}</Text>
          <Text style={demoStyles.actionText}>Tap {step.action}</Text>
        </View>
      )}
      <TutorialMeter value={step.value} config={meterConfig} animated />
    </Animated.View>
  );
};

const demoStyles = StyleSheet.create({
  stepContainer: { marginBottom: 16 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumberText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  stepLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, flex: 1 },
  actionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  actionIcon: { fontSize: 20, marginRight: 8 },
  actionText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
});

// ─── Main Tutorial Modal ───
const LevelTutorialModal = ({ visible, onClose, tutorialData }) => {
  const { playSfx } = useAudio();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [activeDemoStep, setActiveDemoStep] = useState(0);
  const [screenKey, setScreenKey] = useState(0);
  const demoTimerRef = useRef(null);
  const slideAnim = useSharedValue(0);

  const screens = tutorialData?.screens || [];
  const totalScreens = screens.length;
  const screen = screens[currentScreen];

  useEffect(() => {
    if (visible) {
      setCurrentScreen(0);
      setActiveDemoStep(0);
      setScreenKey((k) => k + 1);
      playSfx('wobble');
    }
  }, [visible]);

  // Auto-advance demo steps
  useEffect(() => {
    if (screen?.type === 'demo' && screen.demoSteps) {
      setActiveDemoStep(0);
      if (demoTimerRef.current) clearInterval(demoTimerRef.current);

      let step = 0;
      demoTimerRef.current = setInterval(() => {
        step++;
        if (step < screen.demoSteps.length) {
          setActiveDemoStep(step);
        } else {
          clearInterval(demoTimerRef.current);
        }
      }, 1500);

      return () => {
        if (demoTimerRef.current) clearInterval(demoTimerRef.current);
      };
    }
  }, [currentScreen, visible]);

  const goNext = () => {
    if (currentScreen < totalScreens - 1) {
      playSfx('slideSwoosh');
      slideAnim.value = withSequence(
        withTiming(-20, { duration: 100 }),
        withTiming(0, { duration: 200 })
      );
      setCurrentScreen((prev) => prev + 1);
      setActiveDemoStep(0);
      setScreenKey((k) => k + 1);
    } else {
      playSfx('swoosh');
      onClose();
    }
  };

  const goPrev = () => {
    if (currentScreen > 0) {
      playSfx('slideSwoosh');
      slideAnim.value = withSequence(
        withTiming(20, { duration: 100 }),
        withTiming(0, { duration: 200 })
      );
      setCurrentScreen((prev) => prev - 1);
      setActiveDemoStep(0);
      setScreenKey((k) => k + 1);
    }
  };

  const contentSlideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnim.value }],
  }));

  if (!tutorialData || !screen) return null;

  const levelColor = tutorialData.color || COLORS.primary;

  const renderScreenContent = () => {
    switch (screen.type) {
      case 'intro':
        return (
          <View key={screenKey} style={styles.screenContent}>
            <FadeInView delay={0} duration={500}>
              <Text style={styles.bigVisual}>{screen.visual}</Text>
            </FadeInView>
            <FadeInView delay={200} duration={400}>
              <Text style={[styles.screenTitle, { color: levelColor }]}>{screen.title}</Text>
            </FadeInView>
            <FadeInView delay={350} duration={400}>
              <Text style={styles.screenSubtitle}>{screen.subtitle}</Text>
            </FadeInView>
            <FadeInView delay={500} duration={400} style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{screen.description}</Text>
            </FadeInView>
            <FadeInView delay={700} duration={400} style={[styles.goalBox, { borderColor: levelColor }]}>
              <Text style={styles.goalLabel}>YOUR GOAL</Text>
              <Text style={[styles.goalText, { color: levelColor }]}>{tutorialData.goal}</Text>
            </FadeInView>
          </View>
        );

      case 'meter':
        return (
          <View key={screenKey} style={styles.screenContent}>
            <FadeInView delay={0} duration={400}>
              <Text style={[styles.screenTitle, { color: levelColor }]}>{screen.title}</Text>
            </FadeInView>
            <FadeInView delay={150} duration={400}>
              <Text style={styles.descriptionText}>{screen.description}</Text>
            </FadeInView>
            <FadeInView delay={300} duration={500} style={styles.meterDemo}>
              <TutorialMeter value={screen.meterConfig.value} config={screen.meterConfig} />
              <View style={styles.meterAnnotations}>
                <View style={styles.annotationRow}>
                  <View style={[styles.annotationDot, { backgroundColor: COLORS.low }]} />
                  <Text style={styles.annotationText}>Too Low — needs action!</Text>
                </View>
                <View style={styles.annotationRow}>
                  <View style={[styles.annotationDot, { backgroundColor: COLORS.normal }]} />
                  <Text style={styles.annotationText}>Green Zone — safe range</Text>
                </View>
                <View style={styles.annotationRow}>
                  <View style={[styles.annotationDot, { backgroundColor: COLORS.high }]} />
                  <Text style={styles.annotationText}>Too High — needs action!</Text>
                </View>
              </View>
            </FadeInView>
          </View>
        );

      case 'stimulus':
        return (
          <View key={screenKey} style={styles.screenContent}>
            <FadeInView delay={0} duration={400}>
              <Text style={[styles.screenTitle, { color: levelColor }]}>{screen.title}</Text>
            </FadeInView>
            <FadeInView delay={150} duration={400}>
              <Text style={styles.descriptionText}>{screen.description}</Text>
            </FadeInView>
            <View style={styles.examplesContainer}>
              {screen.examples.map((ex, i) => (
                <FadeInView key={i} delay={300 + i * 150} duration={400} style={styles.exampleCard}>
                  <Text style={styles.exampleIcon}>{ex.icon}</Text>
                  <View style={styles.exampleInfo}>
                    <Text style={styles.exampleText}>{ex.text}</Text>
                    <Text style={[styles.exampleEffect, {
                      color: ex.effect.includes('↑') ? COLORS.high : COLORS.low,
                    }]}>
                      {ex.effect}
                    </Text>
                  </View>
                </FadeInView>
              ))}
            </View>
          </View>
        );

      case 'actions':
        return (
          <View key={screenKey} style={styles.screenContent}>
            <FadeInView delay={0} duration={400}>
              <Text style={[styles.screenTitle, { color: levelColor }]}>{screen.title}</Text>
            </FadeInView>
            <FadeInView delay={150} duration={400}>
              <Text style={styles.descriptionText}>{screen.description}</Text>
            </FadeInView>
            <View style={styles.actionsContainer}>
              {screen.actions.map((action, i) => (
                <ActionButtonPreview key={`${screenKey}-${i}`} action={action} index={i} levelColor={levelColor} />
              ))}
            </View>
          </View>
        );

      case 'demo':
        return (
          <View key={screenKey} style={styles.screenContent}>
            <FadeInView delay={0} duration={400}>
              <Text style={[styles.screenTitle, { color: levelColor }]}>{screen.title}</Text>
            </FadeInView>
            <FadeInView delay={150} duration={400}>
              <Text style={styles.descriptionText}>{screen.description}</Text>
            </FadeInView>
            <View style={styles.demoContainer}>
              {screen.demoSteps.map((step, i) => (
                <DemoStepView
                  key={i}
                  step={step}
                  index={i}
                  isActive={i <= activeDemoStep}
                  meterConfig={screen.meterConfig}
                />
              ))}
            </View>
            {/* Progress dots for demo */}
            <View style={styles.demoProgress}>
              {screen.demoSteps.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.demoDot,
                    i <= activeDemoStep && { backgroundColor: levelColor },
                  ]}
                />
              ))}
            </View>
          </View>
        );

      case 'tips':
        return (
          <View key={screenKey} style={styles.screenContent}>
            <FadeInView delay={0} duration={400}>
              <Text style={styles.readyEmoji}>🎯</Text>
            </FadeInView>
            <FadeInView delay={100} duration={400}>
              <Text style={[styles.screenTitle, { color: levelColor }]}>{screen.title}</Text>
            </FadeInView>
            <View style={styles.tipsContainer}>
              {screen.tips.map((tip, i) => (
                <FadeInView key={i} delay={200 + i * 120} duration={400} style={styles.tipCard}>
                  <Text style={styles.tipText}>{tip}</Text>
                </FadeInView>
              ))}
            </View>
            <FadeInView delay={800} duration={400} style={styles.readyBox}>
              <Text style={styles.readyText}>Ready to play?</Text>
            </FadeInView>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Progress bar */}
          <View style={styles.progressBar}>
            {screens.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressSegment,
                  i <= currentScreen && { backgroundColor: levelColor },
                ]}
              />
            ))}
          </View>

          {/* Screen counter */}
          <View style={styles.counterRow}>
            <Text style={styles.counterText}>
              {currentScreen + 1} / {totalScreens}
            </Text>
            {currentScreen < totalScreens - 1 && (
              <Pressable onPress={() => { playSfx('buttonTap'); onClose(); }} style={styles.skipButton}>
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
            )}
          </View>

          {/* Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Animated.View style={contentSlideStyle}>
              {renderScreenContent()}
            </Animated.View>
          </ScrollView>

          {/* Navigation buttons */}
          <View style={styles.navRow}>
            {currentScreen > 0 ? (
              <Pressable style={styles.prevButton} onPress={goPrev}>
                <Text style={styles.prevButtonText}>← Back</Text>
              </Pressable>
            ) : (
              <View style={styles.prevButton} />
            )}

            <Pressable
              style={[styles.nextButton, { backgroundColor: levelColor }]}
              onPress={goNext}
            >
              <Text style={styles.nextButtonText}>
                {currentScreen === totalScreens - 1 ? 'Start Playing!' : 'Next →'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 40,
  },
  modalContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    width: '100%',
    flex: 1,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingTop: 16,
    paddingBottom: 16,
  },
  progressBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 4,
    marginBottom: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.background,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  counterText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexGrow: 1,
  },
  screenContent: {
    alignItems: 'center',
    paddingTop: 8,
  },
  bigVisual: {
    fontSize: 64,
    marginBottom: 12,
    textAlign: 'center',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  descriptionBox: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  goalBox: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
    width: '100%',
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
  meterDemo: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  meterAnnotations: {
    marginTop: 16,
    gap: 8,
  },
  annotationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  annotationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  annotationText: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  examplesContainer: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  exampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
  },
  exampleIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  exampleInfo: {
    flex: 1,
  },
  exampleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  exampleEffect: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionsContainer: {
    width: '100%',
    marginTop: 8,
  },
  demoContainer: {
    width: '100%',
    marginTop: 8,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 14,
  },
  demoProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  demoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  tipsContainer: {
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
  tipCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  readyEmoji: {
    fontSize: 48,
    marginBottom: 8,
    textAlign: 'center',
  },
  readyBox: {
    marginTop: 16,
    backgroundColor: COLORS.success + '15',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  readyText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.success,
    textAlign: 'center',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  prevButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 80,
  },
  prevButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  nextButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LevelTutorialModal;
