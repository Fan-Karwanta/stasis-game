import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, getMeterColor } from '../constants/colors';
import { useGame } from '../context/GameContext';
import { StatusMeter, ActionButton, LivesDisplay } from '../components';

const GAME_DURATION = 90;

const Level4Screen = ({ navigation }) => {
  const { lives, loseLife, useHint, hintsUsed, resetLevelState, calculateStars } = useGame();
  
  // Multiple systems
  const [temperature, setTemperature] = useState(37.0);
  const [hydration, setHydration] = useState(50);
  const [glucose, setGlucose] = useState(85);
  
  // System failure state
  const [insulinDisabled, setInsulinDisabled] = useState(true);
  const [currentScenario, setCurrentScenario] = useState(null);
  
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const [timeBalanced, setTimeBalanced] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(true);

  const scenarios = [
    {
      title: 'Insulin Response Disabled',
      description: 'The pancreas cannot produce insulin. You must manage blood sugar through diet and activity only.',
      disabledSystem: 'insulin',
    },
  ];

  useEffect(() => {
    resetLevelState();
    setCurrentScenario(scenarios[0]);
  }, []);

  // Game timer
  useEffect(() => {
    if (!gameActive || showScenarioModal) return;
    
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
  }, [gameActive, showScenarioModal]);

  // Track time balanced (all systems must be balanced)
  useEffect(() => {
    if (!gameActive || showScenarioModal) return;
    
    const balanceTimer = setInterval(() => {
      const tempBalanced = temperature >= 36.5 && temperature <= 37.5;
      const hydrationBalanced = hydration >= 40 && hydration <= 60;
      const glucoseBalanced = glucose >= 70 && glucose <= 100;
      
      if (tempBalanced && hydrationBalanced && glucoseBalanced) {
        setTimeBalanced((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(balanceTimer);
  }, [gameActive, showScenarioModal, temperature, hydration, glucose]);

  // Dynamic changes for all systems
  useEffect(() => {
    if (!gameActive || showScenarioModal) return;
    
    const driftTimer = setInterval(() => {
      // Temperature drift
      setTemperature((prev) => {
        const drift = (Math.random() - 0.5) * 0.3;
        return Math.max(34, Math.min(42, prev + drift));
      });
      
      // Hydration drift (natural loss)
      setHydration((prev) => {
        const drift = -1.5 + (Math.random() * 0.5);
        return Math.max(0, Math.min(100, prev + drift));
      });
      
      // Glucose drift (with disabled insulin, tends to rise)
      setGlucose((prev) => {
        const drift = insulinDisabled ? 2 + (Math.random() * 2) : -2 + (Math.random() * 1);
        return Math.max(30, Math.min(180, prev + drift));
      });
    }, 2500);

    return () => clearInterval(driftTimer);
  }, [gameActive, showScenarioModal, insulinDisabled]);

  // Check for critical states
  useEffect(() => {
    if (!gameActive || showScenarioModal) return;
    
    let critical = false;
    let message = '';
    
    if (temperature < 35 || temperature > 40) {
      critical = true;
      message = temperature > 40 ? 'Critical temperature!' : 'Hypothermia risk!';
      setTemperature(temperature > 40 ? 39 : 36);
    }
    
    if (hydration < 20 || hydration > 85) {
      critical = true;
      message = hydration > 85 ? 'Overhydration!' : 'Severe dehydration!';
      setHydration(hydration > 85 ? 70 : 35);
    }
    
    if (glucose < 50 || glucose > 150) {
      critical = true;
      message = glucose > 150 
        ? 'Hyperglycemia! Without insulin, glucose cannot enter cells.' 
        : 'Hypoglycemia!';
      setGlucose(glucose > 150 ? 130 : 65);
    }
    
    if (critical) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      loseLife();
      setFeedbackMessage(message);
      setShowFeedback(true);
    }
  }, [temperature, hydration, glucose, gameActive, showScenarioModal]);

  // Check for game over
  useEffect(() => {
    if (lives <= 0) {
      setGameActive(false);
      handleGameEnd();
    }
  }, [lives]);

  const handleAction = (systemType, action) => {
    if (!gameActive) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    switch (systemType) {
      case 'temperature':
        setTemperature((prev) => Math.max(34, Math.min(42, prev + action.effect)));
        break;
      case 'hydration':
        setHydration((prev) => Math.max(0, Math.min(100, prev + action.effect)));
        break;
      case 'glucose':
        if (action.id === 'insulin' && insulinDisabled) {
          setFeedbackMessage('Insulin response is disabled! You must use other methods.');
          setShowFeedback(true);
          return;
        }
        setGlucose((prev) => Math.max(30, Math.min(180, prev + action.effect)));
        break;
    }
    
    setFeedbackMessage('Action applied. Monitor all systems!');
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1500);
  };

  const handleHint = () => {
    useHint();
    setShowHint(true);
  };

  const handleGameEnd = () => {
    const stars = calculateStars();
    navigation.replace('Results', {
      levelId: 4,
      stars,
      timeBalanced,
      totalTime: GAME_DURATION,
      systemName: 'System Interaction',
      specialMessage: insulinDisabled 
        ? 'This scenario simulates diabetes - when insulin response fails, maintaining glucose balance becomes very difficult.'
        : null,
    });
  };

  const getHintText = () => {
    const issues = [];
    if (glucose > 100) issues.push('Glucose is high. Without insulin, try eating less and resting to slow glucose rise.');
    if (glucose < 70) issues.push('Glucose is low. Eat to raise blood sugar.');
    if (temperature > 37.5) issues.push('Temperature is high. Sweating helps cool down.');
    if (temperature < 36.5) issues.push('Temperature is low. Shivering generates heat.');
    if (hydration < 40) issues.push('Dehydration detected. Drink water.');
    if (hydration > 60) issues.push('Overhydrated. Reduce water intake.');
    
    if (issues.length === 0) return 'All systems are balanced! Keep monitoring.';
    return issues.join('\n\n');
  };

  const actions = {
    temperature: [
      { id: 'sweat', name: 'Sweat', icon: '💦', effect: -0.8, description: 'Cool down' },
      { id: 'shiver', name: 'Shiver', icon: '🥶', effect: 0.8, description: 'Warm up' },
    ],
    hydration: [
      { id: 'drink', name: 'Drink', icon: '🥤', effect: 15, description: 'Hydrate' },
      { id: 'reduce', name: 'Conserve', icon: '🧘', effect: 3, description: 'Save water' },
    ],
    glucose: [
      { id: 'eat', name: 'Eat', icon: '🍎', effect: 20, description: 'Raise sugar' },
      { id: 'insulin', name: 'Insulin', icon: '💉', effect: -25, description: 'Lower sugar' },
      { id: 'rest', name: 'Rest', icon: '😌', effect: -5, description: 'Use less' },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Scenario Modal */}
      <Modal visible={showScenarioModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.scenarioModal}>
            <Text style={styles.scenarioIcon}>⚠️</Text>
            <Text style={styles.scenarioTitle}>{currentScenario?.title}</Text>
            <Text style={styles.scenarioDescription}>{currentScenario?.description}</Text>
            <Text style={styles.scenarioChallenge}>
              Challenge: Manage ALL body systems while dealing with this malfunction.
            </Text>
            <Pressable
              style={styles.startButton}
              onPress={() => setShowScenarioModal(false)}
            >
              <Text style={styles.startButtonText}>Begin Challenge</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <Animated.View entering={FadeIn} style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>✕</Text>
          </Pressable>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.levelTitle}>⚡ System Interaction</Text>
        </View>
        <View style={styles.headerRight}>
          <LivesDisplay lives={lives} />
        </View>
      </Animated.View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>Time</Text>
          <Text style={styles.timerValue}>{timeRemaining}s</Text>
        </View>
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>All Balanced</Text>
          <Text style={[styles.timerValue, { color: COLORS.success }]}>{timeBalanced}s</Text>
        </View>
      </View>

      {/* Warning Banner */}
      {insulinDisabled && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>⚠️ Insulin Response Disabled</Text>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Temperature Section */}
        <View style={styles.systemSection}>
          <StatusMeter
            value={temperature}
            minValue={34}
            maxValue={42}
            normalMin={36.5}
            normalMax={37.5}
            label="🌡️ Temperature"
            unit="°C"
          />
          <View style={styles.miniActionsRow}>
            {actions.temperature.map((action) => (
              <Pressable
                key={action.id}
                style={styles.miniAction}
                onPress={() => handleAction('temperature', action)}
                disabled={!gameActive}
              >
                <Text style={styles.miniActionIcon}>{action.icon}</Text>
                <Text style={styles.miniActionName}>{action.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Hydration Section */}
        <View style={styles.systemSection}>
          <StatusMeter
            value={hydration}
            minValue={0}
            maxValue={100}
            normalMin={40}
            normalMax={60}
            label="💧 Hydration"
            unit="%"
          />
          <View style={styles.miniActionsRow}>
            {actions.hydration.map((action) => (
              <Pressable
                key={action.id}
                style={styles.miniAction}
                onPress={() => handleAction('hydration', action)}
                disabled={!gameActive}
              >
                <Text style={styles.miniActionIcon}>{action.icon}</Text>
                <Text style={styles.miniActionName}>{action.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Glucose Section */}
        <View style={styles.systemSection}>
          <StatusMeter
            value={glucose}
            minValue={30}
            maxValue={180}
            normalMin={70}
            normalMax={100}
            label="🍬 Blood Glucose"
            unit="mg/dL"
          />
          <View style={styles.miniActionsRow}>
            {actions.glucose.map((action) => (
              <Pressable
                key={action.id}
                style={[
                  styles.miniAction,
                  action.id === 'insulin' && insulinDisabled && styles.disabledAction,
                ]}
                onPress={() => handleAction('glucose', action)}
                disabled={!gameActive || (action.id === 'insulin' && insulinDisabled)}
              >
                <Text style={styles.miniActionIcon}>{action.icon}</Text>
                <Text style={[
                  styles.miniActionName,
                  action.id === 'insulin' && insulinDisabled && styles.disabledText,
                ]}>
                  {action.name}
                </Text>
                {action.id === 'insulin' && insulinDisabled && (
                  <Text style={styles.disabledLabel}>❌</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Feedback Message */}
        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}
      </ScrollView>

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
            <Text style={styles.modalTitle}>💡 System Status</Text>
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
    paddingBottom: 8,
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
    paddingVertical: 8,
  },
  timerBox: {
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  timerValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  warningBanner: {
    backgroundColor: COLORS.error + '20',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  warningText: {
    color: COLORS.error,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
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
    gap: 12,
    marginTop: 12,
  },
  miniAction: {
    backgroundColor: COLORS.background,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 70,
  },
  disabledAction: {
    opacity: 0.4,
    backgroundColor: COLORS.levelLocked,
  },
  miniActionIcon: {
    fontSize: 20,
  },
  miniActionName: {
    fontSize: 11,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  disabledLabel: {
    fontSize: 10,
    position: 'absolute',
    top: 2,
    right: 2,
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
    paddingVertical: 12,
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
  scenarioModal: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  scenarioIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  scenarioTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  scenarioDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  scenarioChallenge: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
  },
  startButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
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
    fontSize: 15,
    color: COLORS.textPrimary,
    textAlign: 'left',
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

export default Level4Screen;
