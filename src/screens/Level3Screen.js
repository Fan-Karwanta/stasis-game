import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, getMeterColor } from '../constants/colors';
import { STIMULI, ACTIONS, FEEDBACK_MESSAGES } from '../constants/gameData';
import { useGame } from '../context/GameContext';
import { StatusMeter, ActionButton, LivesDisplay, BodySilhouette } from '../components';

const NORMAL_MIN = 70;
const NORMAL_MAX = 100;
const GAME_DURATION = 60;

const Level3Screen = ({ navigation }) => {
  const { lives, loseLife, useHint, hintsUsed, resetLevelState, calculateStars } = useGame();
  
  const [glucose, setGlucose] = useState(85);
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const [timeBalanced, setTimeBalanced] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showInsulinAnimation, setShowInsulinAnimation] = useState(false);

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
      if (glucose >= NORMAL_MIN && glucose <= NORMAL_MAX) {
        setTimeBalanced((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(balanceTimer);
  }, [gameActive, glucose]);

  // Dynamic glucose change
  useEffect(() => {
    if (!gameActive) return;
    
    const driftTimer = setInterval(() => {
      setGlucose((prev) => {
        // Natural glucose consumption by cells
        const drift = -2 + (Math.random() * 1);
        const newGlucose = prev + drift;
        return Math.max(30, Math.min(180, newGlucose));
      });
    }, 2000);

    return () => clearInterval(driftTimer);
  }, [gameActive]);

  // Check for critical states
  useEffect(() => {
    if (!gameActive) return;
    
    if (glucose < 50 || glucose > 140) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      loseLife();
      setFeedbackMessage(glucose > 140 
        ? 'Critical! Hyperglycemia - blood sugar is dangerously high!' 
        : 'Critical! Hypoglycemia - blood sugar is dangerously low!');
      setShowFeedback(true);
      
      setGlucose(glucose > 140 ? 120 : 65);
    }
  }, [glucose, gameActive]);

  // Check for game over
  useEffect(() => {
    if (lives <= 0) {
      setGameActive(false);
      handleGameEnd();
    }
  }, [lives]);

  const generateStimulus = () => {
    const stimuli = STIMULI.glucose;
    const randomStimulus = stimuli[Math.floor(Math.random() * stimuli.length)];
    setCurrentStimulus(randomStimulus);
    
    setGlucose((prev) => {
      const newGlucose = prev + randomStimulus.effect;
      return Math.max(30, Math.min(180, newGlucose));
    });
  };

  const handleAction = (action) => {
    if (!gameActive) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Show insulin animation for insulin action
    if (action.id === 'insulin') {
      setShowInsulinAnimation(true);
      setTimeout(() => setShowInsulinAnimation(false), 1500);
    }
    
    setGlucose((prev) => {
      const newGlucose = prev + action.effect;
      return Math.max(30, Math.min(180, newGlucose));
    });

    const newGlucose = glucose + action.effect;
    if (newGlucose >= NORMAL_MIN && newGlucose <= NORMAL_MAX) {
      setFeedbackMessage(FEEDBACK_MESSAGES.glucose.corrected);
    } else if (newGlucose > NORMAL_MAX) {
      setFeedbackMessage(FEEDBACK_MESSAGES.glucose.high);
    } else {
      setFeedbackMessage(FEEDBACK_MESSAGES.glucose.low);
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
      levelId: 3,
      stars,
      timeBalanced,
      totalTime: GAME_DURATION,
      systemName: 'Blood Sugar Regulation',
    });
  };

  const getHintText = () => {
    if (glucose > NORMAL_MAX) {
      return 'Blood glucose is HIGH. The pancreas releases insulin to help cells absorb glucose, lowering blood sugar levels.';
    } else if (glucose < NORMAL_MIN) {
      return 'Blood glucose is LOW. Eating provides glucose. The pancreas releases glucagon to release stored glucose.';
    }
    return 'Blood glucose is normal. This is negative feedback in action - the body maintains balance automatically.';
  };

  const statusColor = getMeterColor(glucose, NORMAL_MIN, NORMAL_MAX);

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
          <Text style={styles.levelTitle}>🍬 Blood Sugar</Text>
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
          value={glucose}
          normalMin={NORMAL_MIN}
          normalMax={NORMAL_MAX}
          systemType="glucose"
        />
        {showInsulinAnimation && (
          <View style={styles.insulinAnimation}>
            <Text style={styles.insulinIcon}>💉</Text>
            <Text style={styles.insulinText}>Insulin Released!</Text>
          </View>
        )}
      </View>

      {/* Glucose Meter */}
      <View style={styles.meterSection}>
        <StatusMeter
          value={glucose}
          minValue={30}
          maxValue={180}
          normalMin={NORMAL_MIN}
          normalMax={NORMAL_MAX}
          label="Blood Glucose"
          unit="mg/dL"
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
          {ACTIONS.glucose.map((action) => (
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
    position: 'relative',
  },
  insulinAnimation: {
    position: 'absolute',
    top: 20,
    right: 60,
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  insulinIcon: {
    fontSize: 32,
  },
  insulinText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
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

export default Level3Screen;
