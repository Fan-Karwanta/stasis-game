import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Image } from 'react-native';
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
  const { progress, resetAllProgress } = useGame();
  const [showSettings, setShowSettings] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleClearData = async () => {
    await resetAllProgress();
    setShowConfirmClear(false);
    setShowSettings(false);
  };

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
      {/* Settings Button */}
      <Pressable 
        style={styles.settingsButton} 
        onPress={() => setShowSettings(true)}
      >
        <Text style={styles.settingsIcon}>⚙️</Text>
      </Pressable>

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
        <Image 
          source={require('../../assets/logo-stasis.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
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

      {/* Settings Modal */}
      <Modal visible={showSettings} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowSettings(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>⚙️ Settings</Text>
            
            <Pressable 
              style={styles.settingsOption}
              onPress={() => setShowAbout(true)}
            >
              <Text style={styles.settingsOptionIcon}>ℹ️</Text>
              <View style={styles.settingsOptionText}>
                <Text style={styles.settingsOptionTitle}>About</Text>
                <Text style={styles.settingsOptionDesc}>App information and credits</Text>
              </View>
            </Pressable>

            <Pressable 
              style={styles.settingsOption}
              onPress={() => setShowConfirmClear(true)}
            >
              <Text style={styles.settingsOptionIcon}>🗑️</Text>
              <View style={styles.settingsOptionText}>
                <Text style={styles.settingsOptionTitle}>Clear All Data</Text>
                <Text style={styles.settingsOptionDesc}>Reset all progress and saved data</Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.closeButton}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Confirm Clear Modal */}
      <Modal visible={showConfirmClear} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowConfirmClear(false)}>
          <Pressable style={styles.confirmModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.confirmIcon}>⚠️</Text>
            <Text style={styles.confirmTitle}>Clear All Data?</Text>
            <Text style={styles.confirmText}>
              This will permanently delete all your progress, stars, and saved data. This action cannot be undone.
            </Text>
            
            <View style={styles.confirmButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowConfirmClear(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.deleteButton}
                onPress={handleClearData}
              >
                <Text style={styles.deleteButtonText}>Yes, Clear</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* About Modal */}
      <Modal visible={showAbout} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowAbout(false)}>
          <Pressable style={styles.aboutModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.aboutIcon}>ℹ️</Text>
            <Text style={styles.aboutTitle}>STASIS</Text>
            <Text style={styles.aboutSubtitle}>Homeostasis Manager</Text>
            
            <View style={styles.aboutDivider} />
            
            <Text style={styles.aboutRequirement}>
              Requirement for Masters of Arts in Education, Major in Science Teaching
            </Text>
            
            <View style={styles.aboutDivider} />
            
            <Text style={styles.aboutAuthorLabel}>Developed by:</Text>
            <Text style={styles.aboutAuthor}>Aaron Joseph A. Paña</Text>
            
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            
            <Pressable
              style={styles.aboutCloseButton}
              onPress={() => setShowAbout(false)}
            >
              <Text style={styles.aboutCloseButtonText}>Close</Text>
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
    paddingHorizontal: 20,
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  settingsIcon: {
    fontSize: 22,
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
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 12,
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
    marginBottom: 24,
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  settingsOptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingsOptionText: {
    flex: 1,
  },
  settingsOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  settingsOptionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  closeButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmModal: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  confirmIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  confirmText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  cancelButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: COLORS.error,
    paddingVertical: 14,
    borderRadius: 12,
  },
  deleteButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  aboutModal: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  aboutIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 4,
  },
  aboutSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  aboutDivider: {
    width: '80%',
    height: 1,
    backgroundColor: COLORS.textSecondary + '30',
    marginVertical: 16,
  },
  aboutRequirement: {
    fontSize: 14,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  aboutAuthorLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  aboutAuthor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  aboutVersion: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  aboutCloseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  aboutCloseButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
