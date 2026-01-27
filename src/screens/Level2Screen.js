import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, getMeterColor } from '../constants/colors';
import { STIMULI, ACTIONS, FEEDBACK_MESSAGES } from '../constants/gameData';
import { useGame } from '../context/GameContext';
import { StatusMeter, ActionButton, LivesDisplay, BodySilhouette } from '../components';

const NORMAL_MIN = 40;
const NORMAL_MAX = 60;
const GAME_DURATION = 60;

const Level2Screen = ({ navigation }) => {
  const { lives, loseLife, useHint, hintsUsed, resetLevelState, calculateStars } = useGame();
  
  const [hydration, setHydration] = useState(50);
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const [timeBalanced, setTimeBalanced] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    resetLevelState();
    generateStimulus();
  }, []);

  // Game timer
  useEffect(() => {
    if (!gameActive) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setGameActive(false);
          handleGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive]);

  // Track time balanced
  useEffect(() => {
    if (!gameActive) return;
    
    const balanceTimer = setInterval(() => {
      if (hydration >= NORMAL_MIN && hydration <= NORMAL_MAX) {
        setTimeBalanced((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(balanceTimer);
  }, [gameActive, hydration]);

  // Dynamic hydration change
  useEffect(() => {
    if (!gameActive) return;
    
    const driftTimer = setInterval(() => {
      setHydration((prev) => {
        // Natural water loss through breathing, etc.
        const drift = -1 + (Math.random() * 0.5);
        const newHydration = prev + drift;
        return Math.max(0, Math.min(100, newHydration));
      });
    }, 2000);

    return () => clearInterval(driftTimer);
  }, [gameActive]);

  // Check for critical states
  useEffect(() => {
    if (!gameActive) return;
    
    if (hydration < 20 || hydration > 85) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      loseLife();
      setFeedbackMessage(hydration > 85 
        ? 'Critical! Overhydration can dilute electrolytes!' 
        : 'Critical! Severe dehydration detected!');
      setShowFeedback(true);
      
      setHydration(hydration > 85 ? 70 : 35);
    }
  }, [hydration, gameActive]);

  // Check for game over
  useEffect(() => {
    if (lives <= 0) {
      setGameActive(false);
      handleGameEnd();
    }
  }, [lives]);

  const generateStimulus = () => {
    const stimuli = STIMULI.hydration;
    const randomStimulus = stimuli[Math.floor(Math.random() * stimuli.length)];
    setCurrentStimulus(randomStimulus);
    
    setHydration((prev) => {
      const newHydration = prev + randomStimulus.effect;
      return Math.max(0, Math.min(100, newHydration));
    });
  };

  const handleAction = (action) => {
    if (!gameActive) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setHydration((prev) => {
      const newHydration = prev + action.effect;
      return Math.max(0, Math.min(100, newHydration));
    });

    const newHydration = hydration + action.effect;
    if (newHydration >= NORMAL_MIN && newHydration <= NORMAL_MAX) {
      setFeedbackMessage(FEEDBACK_MESSAGES.hydration.corrected);
    } else if (newHydration > NORMAL_MAX) {
      setFeedbackMessage(FEEDBACK_MESSAGES.hydration.high);
    } else {
      setFeedbackMessage(FEEDBACK_MESSAGES.hydration.low);
    }
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      generateStimulus();
    }, 2000);
  };

  const handleHint = () => {
    useHint();
    setShowHint(true);
  };

  const handleGameEnd = () => {
    const stars = calculateStars();
    navigation.replace('Results', {
      levelId: 2,
      stars,
      timeBalanced,
      totalTime: GAME_DURATION,
      systemName: 'Water Balance',
    });
  };

  const getHintText = () => {
    if (hydration < NORMAL_MIN) {
      return 'Hydration is LOW. Drinking water will restore fluid levels. The kidneys help regulate water balance.';
    } else if (hydration > NORMAL_MAX) {
      return 'Hydration is HIGH. Reducing activity conserves water. Excess water is removed through urine.';
    }
    return 'Hydration is normal. Maintain current balance through moderate activity.';
  };

  const statusColor = getMeterColor(hydration, NORMAL_MIN, NORMAL_MAX);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn} style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>✕</Text>
          </Pressable>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.levelTitle}>💧 Water Balance</Text>
        </View>
        <View style={styles.headerRight}>
          <LivesDisplay lives={lives} />
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

      {/* Body Visualization */}
      <View style={styles.bodyContainer}>
        <BodySilhouette
          value={hydration}
          normalMin={NORMAL_MIN}
          normalMax={NORMAL_MAX}
          systemType="hydration"
        />
      </View>

      {/* Hydration Meter */}
      <View style={styles.meterSection}>
        <StatusMeter
          value={hydration}
          minValue={0}
          maxValue={100}
          normalMin={NORMAL_MIN}
          normalMax={NORMAL_MAX}
          label="Hydration Level"
          unit="%"
        />
      </View>

      {/* Stimulus Display */}
      {currentStimulus && (
        <View style={styles.stimulusContainer}>
          <Text style={styles.stimulusLabel}>Current Situation:</Text>
          <Text style={styles.stimulusText}>{currentStimulus.text}</Text>
        </View>
      )}

      {/* Feedback Message */}
      {showFeedback && (
        <View style={[styles.feedbackContainer, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.feedbackText, { color: statusColor }]}>{feedbackMessage}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Text style={styles.actionsLabel}>Choose Response:</Text>
        <View style={styles.actionsRow}>
          {ACTIONS.hydration.map((action) => (
            <ActionButton
              key={action.id}
              action={action}
              onPress={handleAction}
              disabled={!gameActive}
            />
          ))}
        </View>
      </View>

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

      {/* Hint Modal */}
      <Modal visible={showHint} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💡 Hint</Text>
            <Text style={styles.modalText}>{getHintText()}</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setShowHint(false)}
            >
              <Text style={styles.modalButtonText}>Got it!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    width: 50,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
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
  bodyContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  meterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stimulusContainer: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  stimulusLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  stimulusText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  feedbackContainer: {
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionsLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
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

export default Level2Screen;
