import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Alert } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, getMeterColor } from '../constants/colors';
import { STIMULI, FEEDBACK_MESSAGES } from '../constants/gameData';
import { useGame } from '../context/GameContext';
import { StatusMeter, BodySilhouette, SituationVisual } from '../components';

const NORMAL_MIN = 36.5;
const NORMAL_MAX = 37.5;
const GAME_DURATION = 60; // seconds

const Level1Screen = ({ navigation }) => {
  const { heartsCount, deductHeart, useHint, hintsUsed, resetLevelState, calculateStars, completeLevel, canPlay, getNextReplenishTime } = useGame();
  
  const [temperature, setTemperature] = useState(37.0);
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const [timeBalanced, setTimeBalanced] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [shouldEndGame, setShouldEndGame] = useState(false);
  
  const timeBalancedRef = useRef(0);
  const gameActiveRef = useRef(true);
  const temperatureRef = useRef(temperature);

  useEffect(() => {
    if (!canPlay()) {
      const nextTime = getNextReplenishTime();
      const formatMs = (ms) => {
        if (!ms || ms <= 0) return 'soon';
        const s = Math.ceil(ms / 1000);
        return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
      };
      Alert.alert(
        '💔 No Hearts',
        `You have no hearts for this level.\nNext heart in ${formatMs(nextTime)}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }
    resetLevelState();
    generateStimulus();
    return () => {
      gameActiveRef.current = false;
    };
  }, []);

  // Update refs when state changes
  useEffect(() => {
    timeBalancedRef.current = timeBalanced;
  }, [timeBalanced]);

  useEffect(() => {
    gameActiveRef.current = gameActive;
  }, [gameActive]);

  useEffect(() => {
    temperatureRef.current = temperature;
  }, [temperature]);

  // Handle game end navigation separately to avoid setState during render
  useEffect(() => {
    if (shouldEndGame && !gameActiveRef.current) {
      const stars = calculateStars();
      navigation.replace('Results', {
        levelId: 1,
        stars,
        timeBalanced: timeBalancedRef.current,
        totalTime: GAME_DURATION,
        systemName: 'Thermoregulation',
        livesRemaining: heartsCount,
      });
    }
  }, [shouldEndGame, navigation, calculateStars]);

  // Game timer
  useEffect(() => {
    if (!gameActive) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setGameActive(false);
          setShouldEndGame(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive]);

  // Track time balanced - use ref to avoid restarting interval on every temperature change
  useEffect(() => {
    if (!gameActive) return;
    
    const balanceTimer = setInterval(() => {
      if (temperatureRef.current >= NORMAL_MIN && temperatureRef.current <= NORMAL_MAX) {
        setTimeBalanced((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(balanceTimer);
  }, [gameActive]);

  // Dynamic temperature change (homeostasis is continuous)
  // DIFFICULTY CONFIG: Change interval (ms) to adjust instability speed
  // Lower = faster/harder, Higher = slower/easier (default was 2000)
  const DRIFT_INTERVAL = 667; // 3x faster than original 2000ms
  
  useEffect(() => {
    if (!gameActive) return;
    
    const driftTimer = setInterval(() => {
      setTemperature((prev) => {
        // Small random drift
        const drift = (Math.random() - 0.5) * 0.2;
        const newTemp = prev + drift;
        return Math.max(34, Math.min(42, newTemp));
      });
    }, DRIFT_INTERVAL);

    return () => clearInterval(driftTimer);
  }, [gameActive]);

  // Check for critical states
  useEffect(() => {
    if (!gameActive) return;
    
    if (temperature < 35 || temperature > 40) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      deductHeart();
      setFeedbackMessage(temperature > 40 
        ? 'Critical! Body temperature is dangerously high!' 
        : 'Critical! Body temperature is dangerously low!');
      setShowFeedback(true);
      
      // Reset to safer value
      setTemperature(temperature > 40 ? 39 : 36);
    }
  }, [temperature, gameActive]);

  // Check for game over
  useEffect(() => {
    if (heartsCount <= 0) {
      setGameActive(false);
      setShouldEndGame(true);
    }
  }, [heartsCount]);

  const generateStimulus = () => {
    const stimuli = STIMULI.temperature;
    const randomStimulus = stimuli[Math.floor(Math.random() * stimuli.length)];
    setCurrentStimulus(randomStimulus);
    
    // Apply stimulus effect
    setTemperature((prev) => {
      const newTemp = prev + randomStimulus.effect;
      return Math.max(34, Math.min(42, newTemp));
    });
  };

  const handleAction = (action) => {
    if (!gameActive) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Apply action effect
    setTemperature((prev) => {
      const newTemp = prev + action.effect;
      return Math.max(34, Math.min(42, newTemp));
    });

    // Show feedback
    const newTemp = temperature + action.effect;
    if (newTemp >= NORMAL_MIN && newTemp <= NORMAL_MAX) {
      setFeedbackMessage(FEEDBACK_MESSAGES.temperature.corrected);
    } else if (newTemp > NORMAL_MAX) {
      setFeedbackMessage(FEEDBACK_MESSAGES.temperature.high);
    } else {
      setFeedbackMessage(FEEDBACK_MESSAGES.temperature.low);
    }
    setShowFeedback(true);

    // Generate new stimulus after delay
    setTimeout(() => {
      setShowFeedback(false);
      generateStimulus();
    }, 2000);
  };

  const handleHint = () => {
    useHint();
    setShowHint(true);
  };

  const handleGameEnd = useCallback(() => {
    setGameActive(false);
    setShouldEndGame(true);
  }, []);

  const getHintText = () => {
    if (temperature > NORMAL_MAX) {
      return 'Temperature is HIGH. Sweating helps release heat and cool the body down.';
    } else if (temperature < NORMAL_MIN) {
      return 'Temperature is LOW. Shivering generates heat through muscle activity.';
    }
    return 'Temperature is normal. Rest to maintain current balance.';
  };

  const statusColor = getMeterColor(temperature, NORMAL_MIN, NORMAL_MAX);

  // Inline actions like Level4
  const actions = [
    { id: 'sweat', name: 'Sweat', icon: '💦', effect: -0.8, description: 'Cool down' },
    { id: 'shiver', name: 'Shiver', icon: '🥶', effect: 0.8, description: 'Warm up' },
    { id: 'rest', name: 'Rest', icon: '😌', effect: 0, description: 'Maintain' },
  ];

  const handleMiniAction = (action) => {
    if (!gameActive) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setTemperature((prev) => {
      const newTemp = prev + action.effect;
      return Math.max(34, Math.min(42, newTemp));
    });

    const newTemp = temperature + action.effect;
    if (newTemp >= NORMAL_MIN && newTemp <= NORMAL_MAX) {
      setFeedbackMessage('Good! Temperature stabilizing.');
    } else if (newTemp > NORMAL_MAX) {
      setFeedbackMessage('Still too hot! Keep cooling down.');
    } else {
      setFeedbackMessage('Still too cold! Keep warming up.');
    }
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1500);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>✕</Text>
            </Pressable>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.levelTitle}>🌡️ Thermoregulation</Text>
          </View>
          <View style={styles.headerLeft} />
        </View>
      </Animated.View>

      {/* Timer and Balance Time */}
      <View style={styles.timerContainer}>
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>Time</Text>
          <Text style={styles.timerValue}>{timeRemaining}s</Text>
        </View>
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>Balanced</Text>
          <Text style={[styles.timerValue, { color: COLORS.success }]}>{timeBalanced}s</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Situation Visualization */}
        <SituationVisual stimulus={currentStimulus} systemType="temperature" />

        {/* Temperature Section - Like Level4 */}
        <View style={styles.systemSection}>
          <StatusMeter
            value={temperature}
            minValue={34}
            maxValue={42}
            normalMin={NORMAL_MIN}
            normalMax={NORMAL_MAX}
            label="🌡️ Body Temperature"
            unit="°C"
          />
          <View style={styles.miniActionsRow}>
            {actions.map((action) => (
              <Pressable
                key={action.id}
                style={styles.miniAction}
                onPress={() => handleMiniAction(action)}
                disabled={!gameActive}
              >
                <Text style={styles.miniActionIcon}>{action.icon}</Text>
                <Text style={styles.miniActionName}>{action.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Body Visualization */}
        <View style={styles.bodyContainer}>
          <BodySilhouette
            value={temperature}
            normalMin={NORMAL_MIN}
            normalMax={NORMAL_MAX}
            systemType="temperature"
          />
        </View>

        {/* Feedback Message */}
        {showFeedback && (
          <Animated.View 
            entering={FadeIn.duration(200)} 
            style={styles.feedbackContainer}
          >
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </Animated.View>
        )}

        {/* Hint Button */}
        <View style={styles.hintContainer}>
          <Pressable
            style={[styles.hintButton, hintsUsed >= 2 && styles.hintDisabled]}
            onPress={handleHint}
            disabled={hintsUsed >= 2}
          >
            <Text style={styles.hintButtonText}>💡 Hint ({2 - hintsUsed} left)</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Hint Modal */}
      <Modal visible={showHint} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowHint(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>💡 Hint</Text>
            <Text style={styles.modalText}>{getHintText()}</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setShowHint(false)}
            >
              <Text style={styles.modalButtonText}>Got it!</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
    paddingBottom: 20,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    width: 50,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 12,
  },
  timerBox: {
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  timerValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  stimulusContainer: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  stimulusLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  stimulusText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  systemSection: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  miniActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  miniAction: {
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  miniActionIcon: {
    fontSize: 28,
  },
  miniActionName: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginTop: 4,
    fontWeight: '500',
  },
  bodyContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  feedbackContainer: {
    backgroundColor: COLORS.primary + '20',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 14,
    textAlign: 'center',
    color: COLORS.primary,
    fontWeight: '500',
  },
  hintContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  hintButton: {
    backgroundColor: COLORS.warning + '30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  hintDisabled: {
    opacity: 0.5,
  },
  hintButtonText: {
    color: COLORS.warning,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Level1Screen;
