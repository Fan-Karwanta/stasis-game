import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Alert } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, getMeterColor } from '../constants/colors';
import { STIMULI, FEEDBACK_MESSAGES, LEVEL_TUTORIALS } from '../constants/gameData';
import { useGame } from '../context/GameContext';
import { useAudio } from '../context/AudioContext';
import { StatusMeter, BodySilhouette, SituationVisual, LevelTutorialModal } from '../components';

const NORMAL_MIN = 40;
const NORMAL_MAX = 60;
const GAME_DURATION = 30;

const Level2Screen = ({ navigation }) => {
  const { heartsCount, deductHeart, useHint, hintsUsed, resetLevelState, calculateStars, canPlay, getNextReplenishTime } = useGame();
  const { playSfx, startClockTick, stopClockTick } = useAudio();
  
  const [hydration, setHydration] = useState(50);
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const [timeBalanced, setTimeBalanced] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [shouldEndGame, setShouldEndGame] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialSeen, setTutorialSeen] = useState(false);
  
  const timeBalancedRef = useRef(0);
  const gameActiveRef = useRef(true);
  const hydrationRef = useRef(hydration);

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
    hydrationRef.current = hydration;
  }, [hydration]);

  // Handle game end navigation separately to avoid setState during render
  useEffect(() => {
    if (shouldEndGame && !gameActiveRef.current) {
      const stars = calculateStars();
      navigation.replace('Results', {
        levelId: 2,
        stars,
        timeBalanced: timeBalancedRef.current,
        totalTime: GAME_DURATION,
        systemName: 'Water Balance',
        livesRemaining: heartsCount,
      });
    }
  }, [shouldEndGame, navigation, calculateStars]);

  // Game timer
  useEffect(() => {
    if (!gameActive || showTutorial) return;
    
    startClockTick();
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setGameActive(false);
          setShouldEndGame(true);
          stopClockTick();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      stopClockTick();
    };
  }, [gameActive, showTutorial]);

  // Track time balanced - use ref to avoid restarting interval on every hydration change
  useEffect(() => {
    if (!gameActive || showTutorial) return;
    
    const balanceTimer = setInterval(() => {
      if (hydrationRef.current >= NORMAL_MIN && hydrationRef.current <= NORMAL_MAX) {
        setTimeBalanced((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(balanceTimer);
  }, [gameActive, showTutorial]);

  // Dynamic hydration change
  // DIFFICULTY CONFIG: Change interval (ms) to adjust instability speed
  // Lower = faster/harder, Higher = slower/easier (default was 2000)
  const DRIFT_INTERVAL = 667; // 3x faster than original 2000ms
  
  useEffect(() => {
    if (!gameActive || showTutorial) return;
    
    const driftTimer = setInterval(() => {
      setHydration((prev) => {
        // Natural water loss through breathing, etc.
        const drift = -1 + (Math.random() * 0.5);
        const newHydration = prev + drift;
        return Math.max(0, Math.min(100, newHydration));
      });
    }, DRIFT_INTERVAL);

    return () => clearInterval(driftTimer);
  }, [gameActive, showTutorial]);

  // Check for critical states
  useEffect(() => {
    if (!gameActive) return;
    
    if (hydration < 20 || hydration > 85) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      playSfx('criticalAlert');
      playSfx('heartLoss');
      deductHeart();
      setFeedbackMessage(hydration > 85 
        ? 'Critical! Overhydration can dilute electrolytes!' 
        : 'Critical! Severe dehydration detected!');
      setShowFeedback(true);
      
      setHydration(hydration > 85 ? 70 : 35);
    }
  }, [hydration, gameActive]);

  // Check for game over
  useEffect(() => {
    if (heartsCount <= 0) {
      setGameActive(false);
      setShouldEndGame(true);
    }
  }, [heartsCount]);

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
    playSfx('hintReveal');
    useHint();
    setShowHint(true);
  };

  const handleGameEnd = useCallback(() => {
    setGameActive(false);
    setShouldEndGame(true);
  }, []);

  const getHintText = () => {
    if (hydration < NORMAL_MIN) {
      return 'Hydration is LOW. Drinking water will restore fluid levels. The kidneys help regulate water balance.';
    } else if (hydration > NORMAL_MAX) {
      return 'Hydration is HIGH. Reducing activity conserves water. Excess water is removed through urine.';
    }
    return 'Hydration is normal. Maintain current balance through moderate activity.';
  };

  const statusColor = getMeterColor(hydration, NORMAL_MIN, NORMAL_MAX);

  // Inline actions like Level4
  const actions = [
    { id: 'drink', name: 'Drink', icon: '🥤', effect: 15, description: 'Hydrate' },
    { id: 'conserve', name: 'Conserve', icon: '🧘', effect: 3, description: 'Save water' },
    { id: 'sweat', name: 'Sweat', icon: '💦', effect: -8, description: 'Lose water' },
  ];

  const handleMiniAction = (action) => {
    if (!gameActive) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playSfx('actionPress');
    
    setHydration((prev) => {
      const newHydration = prev + action.effect;
      return Math.max(0, Math.min(100, newHydration));
    });

    const newHydration = hydration + action.effect;
    if (newHydration >= NORMAL_MIN && newHydration <= NORMAL_MAX) {
      setFeedbackMessage('Good! Hydration balanced.');
    } else if (newHydration > NORMAL_MAX) {
      setFeedbackMessage('Too much water! Try sweating.');
    } else {
      setFeedbackMessage('Need more water! Drink up.');
    }
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1500);
  };

  const handleBackPress = () => {
    setGameActive(false);
    gameActiveRef.current = false;
    Alert.alert(
      '⚠️ Leave Level?',
      'Your progress will be lost if you go back. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            setGameActive(true);
            gameActiveRef.current = true;
          },
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Pressable onPress={handleBackPress} style={styles.backButton}>
              <Text style={styles.backText}>✕</Text>
            </Pressable>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.levelTitle}>💧 Water Balance</Text>
          </View>
          <View style={styles.headerLeft} />
        </View>
      </Animated.View>

      {/* Timer and Balance Time */}
      <View style={styles.timerContainer}>
        <Pressable onPress={() => { playSfx('buttonTap'); setShowTutorial(true); }} style={styles.tutorialButton}>
          <Text style={styles.tutorialButtonText}>?</Text>
        </Pressable>
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
        <SituationVisual stimulus={currentStimulus} systemType="hydration" />

        {/* Hydration Section - Like Level4 */}
        <View style={styles.systemSection}>
          <StatusMeter
            value={hydration}
            minValue={0}
            maxValue={100}
            normalMin={NORMAL_MIN}
            normalMax={NORMAL_MAX}
            label="💧 Hydration Level"
            unit="%"
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
            value={hydration}
            normalMin={NORMAL_MIN}
            normalMax={NORMAL_MAX}
            systemType="hydration"
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

      {/* Tutorial Modal */}
      <LevelTutorialModal
        visible={showTutorial}
        onClose={() => {
          setShowTutorial(false);
          setTutorialSeen(true);
        }}
        tutorialData={LEVEL_TUTORIALS[2]}
      />

      {/* Hint Modal */}
      <Modal visible={showHint} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => { playSfx('buttonTap'); setShowHint(false); }}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>💡 Hint</Text>
            <Text style={styles.modalText}>{getHintText()}</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => { playSfx('buttonTap'); setShowHint(false); }}
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
  tutorialButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default Level2Screen;
