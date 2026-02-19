import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Image, Switch, ScrollView, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import Slider from '../components/VolumeSlider';
import AnimatedButton from '../components/AnimatedButton';
import { COLORS } from '../constants/colors';
import { LEVELS } from '../constants/gameData';
import { useGame } from '../context/GameContext';
import { useAudio } from '../context/AudioContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const LEVEL_NAMES = {
  1: { name: 'Thermoregulation', icon: '🌡️', color: '#F97316' },
  2: { name: 'Water Balance', icon: '💧', color: '#0EA5E9' },
  3: { name: 'Blood Sugar', icon: '🍬', color: '#A855F7' },
  4: { name: 'System Interaction', icon: '⚡', color: '#EC4899' },
};

const HomeScreen = ({ navigation }) => {
  const { progress, resetAllProgress } = useGame();
  const { playSfx, settings: audioSettings, setMusicEnabled, setSfxEnabled, setMusicVolume, setSfxVolume, setSelectedMusicTrack, MUSIC_TRACKS, MUSIC_TRACK_KEYS } = useAudio();
  const [showSettings, setShowSettings] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showAudioExpanded, setShowAudioExpanded] = useState(false);
  const [showStarsModal, setShowStarsModal] = useState(false);
  const [showTrophyModal, setShowTrophyModal] = useState(false);
  const [showCongratsAllLevels, setShowCongratsAllLevels] = useState(false);
  const [showCongratsAllStars, setShowCongratsAllStars] = useState(false);

  const allLevelsCompleted = progress.completedLevels.length === 4;
  const allStarsCollected = progress.totalStars === 12;

  const handleClearData = async () => {
    playSfx('wrongAction');
    await resetAllProgress();
    setShowConfirmClear(false);
    setShowSettings(false);
  };

  const handleStarsPress = () => {
    playSfx('modalOpen');
    if (allStarsCollected) {
      setShowCongratsAllStars(true);
    } else {
      setShowStarsModal(true);
    }
  };

  const handleTrophyPress = () => {
    playSfx('modalOpen');
    if (allLevelsCompleted) {
      setShowCongratsAllLevels(true);
    } else {
      setShowTrophyModal(true);
    }
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
        onPress={() => { playSfx('modalOpen'); setShowAudioExpanded(false); setShowSettings(true); }}
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
          source={require('../../assets/logo-stasis-2.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>STASIS</Text>
        <Text style={styles.subtitle}>Homeostasis Manager</Text>
        
        <View style={styles.statsContainer}>
          <Pressable style={styles.statBox} onPress={handleStarsPress}>
            <Text style={styles.statValue}>⭐ {progress.totalStars}</Text>
            <Text style={styles.statLabel}>Total Stars</Text>
          </Pressable>
          <Pressable style={styles.statBox} onPress={handleTrophyPress}>
            <Text style={styles.statValue}>🏆 {progress.completedLevels.length}/4</Text>
            <Text style={styles.statLabel}>Systems</Text>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(400)} style={styles.buttonContainer}>
        <AnimatedButton
          title="PLAY"
          icon="▶️"
          onPress={() => { playSfx('navigate'); navigation.navigate('SystemSelect'); }}
          variant="primary"
        />

        <AnimatedButton
          title="HOW TO PLAY"
          icon="📖"
          onPress={() => { playSfx('buttonTap'); navigation.navigate('Instructions'); }}
          variant="secondary"
          style={styles.buttonSpacing}
        />

        <AnimatedButton
          title="LEARNING GOALS"
          icon="🎯"
          onPress={() => { playSfx('buttonTap'); navigation.navigate('LearningGoals'); }}
          variant="outline"
          style={styles.buttonSpacing}
        />
      </Animated.View>

      {/* ==================== SETTINGS MODAL ==================== */}
      <Modal visible={showSettings} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => { playSfx('buttonTap'); setShowSettings(false); }}>
          <Pressable style={styles.settingsModalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsModalTitle}>⚙️ Settings</Text>
              <Pressable onPress={() => { playSfx('buttonTap'); setShowSettings(false); }} style={styles.settingsCloseX}>
                <Text style={styles.settingsCloseXText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {/* Audio Section - Collapsible */}
              <Pressable
                style={styles.settingsOptionRow}
                onPress={() => { playSfx('buttonTap'); setShowAudioExpanded(!showAudioExpanded); }}
              >
                <Text style={styles.settingsOptionRowIcon}>🔊</Text>
                <View style={styles.settingsOptionRowText}>
                  <Text style={styles.settingsOptionRowTitle}>Audio</Text>
                  <Text style={styles.settingsOptionRowDesc}>
                    {audioSettings.musicEnabled ? 'Music ON' : 'Music OFF'} · {audioSettings.sfxEnabled ? 'SFX ON' : 'SFX OFF'}
                  </Text>
                </View>
                <Text style={styles.chevron}>{showAudioExpanded ? '▲' : '▼'}</Text>
              </Pressable>

              {showAudioExpanded && (
                <View style={styles.audioExpandedSection}>
                  <View style={styles.audioCompactRow}>
                    <Text style={styles.audioCompactLabel}>🎵 Music</Text>
                    <Switch
                      value={audioSettings.musicEnabled}
                      onValueChange={setMusicEnabled}
                      trackColor={{ false: COLORS.textSecondary + '40', true: COLORS.primary + '60' }}
                      thumbColor={audioSettings.musicEnabled ? COLORS.primary : '#ccc'}
                    />
                  </View>
                  {audioSettings.musicEnabled && (
                    <>
                      <View style={styles.sliderRow}>
                        <Text style={styles.sliderIcon}>🔈</Text>
                        <Slider
                          value={audioSettings.musicVolume}
                          onValueChange={setMusicVolume}
                        />
                        <Text style={styles.sliderIcon}>🔊</Text>
                      </View>
                      <Text style={styles.trackPickerLabel}>Background Track</Text>
                      <View style={styles.trackPicker}>
                        {MUSIC_TRACK_KEYS.map((key) => (
                          <Pressable
                            key={key}
                            style={[
                              styles.trackOption,
                              audioSettings.selectedMusicTrack === key && styles.trackOptionActive,
                            ]}
                            onPress={() => {
                              playSfx('buttonTap');
                              setSelectedMusicTrack(key);
                            }}
                          >
                            <Text style={[
                              styles.trackOptionText,
                              audioSettings.selectedMusicTrack === key && styles.trackOptionTextActive,
                            ]}>
                              {MUSIC_TRACKS[key].label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </>
                  )}

                  <View style={[styles.audioCompactRow, { marginTop: 4 }]}>
                    <Text style={styles.audioCompactLabel}>🔔 Sound Effects</Text>
                    <Switch
                      value={audioSettings.sfxEnabled}
                      onValueChange={setSfxEnabled}
                      trackColor={{ false: COLORS.textSecondary + '40', true: COLORS.primary + '60' }}
                      thumbColor={audioSettings.sfxEnabled ? COLORS.primary : '#ccc'}
                    />
                  </View>
                  {audioSettings.sfxEnabled && (
                    <View style={styles.sliderRow}>
                      <Text style={styles.sliderIcon}>🔈</Text>
                      <Slider
                        value={audioSettings.sfxVolume}
                        onValueChange={setSfxVolume}
                      />
                      <Text style={styles.sliderIcon}>🔊</Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.settingsDivider} />

              {/* About */}
              <Pressable 
                style={styles.settingsOptionRow}
                onPress={() => { playSfx('buttonTap'); setShowAbout(true); }}
              >
                <Text style={styles.settingsOptionRowIcon}>ℹ️</Text>
                <View style={styles.settingsOptionRowText}>
                  <Text style={styles.settingsOptionRowTitle}>About</Text>
                  <Text style={styles.settingsOptionRowDesc}>App information and credits</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>

              <View style={styles.settingsDivider} />

              {/* Clear Data */}
              <Pressable 
                style={styles.settingsOptionRow}
                onPress={() => { playSfx('buttonTap'); setShowConfirmClear(true); }}
              >
                <Text style={styles.settingsOptionRowIcon}>🗑️</Text>
                <View style={styles.settingsOptionRowText}>
                  <Text style={[styles.settingsOptionRowTitle, { color: COLORS.error }]}>Clear All Data</Text>
                  <Text style={styles.settingsOptionRowDesc}>Reset all progress and saved data</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </ScrollView>

            <Pressable
              style={styles.settingsCloseBtn}
              onPress={() => { playSfx('buttonTap'); setShowSettings(false); }}
            >
              <Text style={styles.settingsCloseBtnText}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ==================== CONFIRM CLEAR MODAL ==================== */}
      <Modal visible={showConfirmClear} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => { playSfx('buttonTap'); setShowConfirmClear(false); }}>
          <Pressable style={styles.confirmModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.confirmIcon}>⚠️</Text>
            <Text style={styles.confirmTitle}>Clear All Data?</Text>
            <Text style={styles.confirmText}>
              This will permanently delete all your progress, stars, and saved data. This action cannot be undone.
            </Text>
            
            <View style={styles.confirmButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => { playSfx('buttonTap'); setShowConfirmClear(false); }}
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

      {/* ==================== ABOUT MODAL ==================== */}
      <Modal visible={showAbout} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => { playSfx('buttonTap'); setShowAbout(false); }}>
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
              onPress={() => { playSfx('buttonTap'); setShowAbout(false); }}
            >
              <Text style={styles.aboutCloseButtonText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ==================== STARS BREAKDOWN MODAL ==================== */}
      <Modal visible={showStarsModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => { playSfx('buttonTap'); setShowStarsModal(false); }}>
          <Pressable style={styles.achievementModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.achievementModalIcon}>⭐</Text>
            <Text style={styles.achievementModalTitle}>Star Collection</Text>
            <Text style={styles.achievementModalSubtitle}>{progress.totalStars} / 12 Stars Earned</Text>

            <View style={styles.achievementProgressBarBg}>
              <View style={[styles.achievementProgressBarFill, { width: `${(progress.totalStars / 12) * 100}%` }]} />
            </View>

            <View style={styles.achievementLevelList}>
              {[1, 2, 3, 4].map((levelId) => {
                const levelStars = progress.stars[levelId] || 0;
                const info = LEVEL_NAMES[levelId];
                return (
                  <View key={levelId} style={styles.achievementLevelRow}>
                    <View style={[styles.achievementLevelIcon, { backgroundColor: info.color + '20' }]}>
                      <Text style={styles.achievementLevelIconText}>{info.icon}</Text>
                    </View>
                    <View style={styles.achievementLevelInfo}>
                      <Text style={styles.achievementLevelName}>{info.name}</Text>
                      <View style={styles.achievementStarsRow}>
                        {[1, 2, 3].map((s) => (
                          <Text key={s} style={[styles.achievementStar, s <= levelStars && styles.achievementStarFilled]}>
                            ⭐
                          </Text>
                        ))}
                      </View>
                    </View>
                    <Text style={styles.achievementLevelStarCount}>{levelStars}/3</Text>
                  </View>
                );
              })}
            </View>

            {progress.totalStars < 12 && (
              <View style={styles.achievementHintBox}>
                <Text style={styles.achievementHintText}>
                  💡 Collect all 12 stars to unlock a special achievement!
                </Text>
              </View>
            )}

            <Pressable
              style={styles.achievementCloseBtn}
              onPress={() => { playSfx('buttonTap'); setShowStarsModal(false); }}
            >
              <Text style={styles.achievementCloseBtnText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ==================== TROPHY / SYSTEMS MODAL ==================== */}
      <Modal visible={showTrophyModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => { playSfx('buttonTap'); setShowTrophyModal(false); }}>
          <Pressable style={styles.achievementModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.achievementModalIcon}>🏆</Text>
            <Text style={styles.achievementModalTitle}>Level Completion</Text>
            <Text style={styles.achievementModalSubtitle}>{progress.completedLevels.length} / 4 Systems Completed</Text>

            <View style={styles.achievementProgressBarBg}>
              <View style={[styles.achievementProgressBarFill, { width: `${(progress.completedLevels.length / 4) * 100}%`, backgroundColor: COLORS.success }]} />
            </View>

            <View style={styles.achievementLevelList}>
              {[1, 2, 3, 4].map((levelId) => {
                const completed = progress.completedLevels.includes(levelId);
                const info = LEVEL_NAMES[levelId];
                return (
                  <View key={levelId} style={[styles.achievementLevelRow, !completed && { opacity: 0.5 }]}>
                    <View style={[styles.achievementLevelIcon, { backgroundColor: completed ? info.color + '20' : COLORS.textSecondary + '15' }]}>
                      <Text style={styles.achievementLevelIconText}>{completed ? info.icon : '🔒'}</Text>
                    </View>
                    <View style={styles.achievementLevelInfo}>
                      <Text style={styles.achievementLevelName}>{info.name}</Text>
                      <Text style={[styles.achievementLevelStatus, completed && { color: COLORS.success }]}>
                        {completed ? '✅ Completed' : '⏳ Not yet completed'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {progress.completedLevels.length < 4 && (
              <View style={styles.achievementHintBox}>
                <Text style={styles.achievementHintText}>
                  💡 Complete all 4 levels to unlock a special achievement!
                </Text>
              </View>
            )}

            <Pressable
              style={styles.achievementCloseBtn}
              onPress={() => { playSfx('buttonTap'); setShowTrophyModal(false); }}
            >
              <Text style={styles.achievementCloseBtnText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ==================== CONGRATS: ALL LEVELS COMPLETED ==================== */}
      <Modal visible={showCongratsAllLevels} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => { playSfx('buttonTap'); setShowCongratsAllLevels(false); }}>
          <Pressable style={styles.congratsModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.congratsEmoji}>🎉</Text>
            <Text style={styles.congratsTitle}>Congratulations!</Text>
            <Text style={styles.congratsSubtitle}>All Systems Mastered!</Text>

            <View style={styles.congratsBadge}>
              <Text style={styles.congratsBadgeIcon}>🏆</Text>
              <Text style={styles.congratsBadgeText}>Homeostasis Expert</Text>
            </View>

            <Text style={styles.congratsMessage}>
              You have successfully completed all 4 body system levels! You've demonstrated a strong understanding of how the body maintains balance.
            </Text>

            <View style={styles.congratsLevelIcons}>
              {[1, 2, 3, 4].map((id) => (
                <View key={id} style={[styles.congratsLevelDot, { backgroundColor: LEVEL_NAMES[id].color + '20' }]}>
                  <Text style={styles.congratsLevelDotText}>{LEVEL_NAMES[id].icon}</Text>
                </View>
              ))}
            </View>

            {allStarsCollected ? (
              <Pressable
                style={styles.congratsCloseBtn}
                onPress={() => { playSfx('starEarned'); setShowCongratsAllLevels(false); setShowCongratsAllStars(true); }}
              >
                <Text style={styles.congratsCloseBtnText}>🌟 View Star Achievement</Text>
              </Pressable>
            ) : (
              <>
                <View style={styles.congratsHintBox}>
                  <Text style={styles.congratsHintText}>
                    ⭐ You have {progress.totalStars}/12 stars. Collect all 12 for the ultimate achievement!
                  </Text>
                </View>
                <Pressable
                  style={styles.congratsCloseBtn}
                  onPress={() => { playSfx('buttonTap'); setShowCongratsAllLevels(false); }}
                >
                  <Text style={styles.congratsCloseBtnText}>Amazing!</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ==================== CONGRATS: ALL 12 STARS ==================== */}
      <Modal visible={showCongratsAllStars} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => { playSfx('buttonTap'); setShowCongratsAllStars(false); }}>
          <Pressable style={styles.congratsModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.congratsEmoji}>🌟</Text>
            <Text style={styles.congratsTitle}>PERFECT SCORE!</Text>
            <Text style={styles.congratsSubtitle}>All 12 Stars Collected!</Text>

            <View style={[styles.congratsBadge, { backgroundColor: COLORS.starFilled + '20', borderColor: COLORS.starFilled }]}>
              <Text style={styles.congratsBadgeIcon}>👑</Text>
              <Text style={[styles.congratsBadgeText, { color: COLORS.starFilled }]}>Homeostasis Master</Text>
            </View>

            <Text style={styles.congratsMessage}>
              Incredible! You've earned every star across all levels. You are a true master of homeostasis — your body's balance is in perfect harmony!
            </Text>

            <View style={styles.congratsStarGrid}>
              {[1, 2, 3, 4].map((levelId) => (
                <View key={levelId} style={styles.congratsStarGridRow}>
                  <Text style={styles.congratsStarGridIcon}>{LEVEL_NAMES[levelId].icon}</Text>
                  <Text style={styles.congratsStarGridStars}>⭐⭐⭐</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={[styles.congratsCloseBtn, { backgroundColor: COLORS.starFilled }]}
              onPress={() => { playSfx('buttonTap'); setShowCongratsAllStars(false); }}
            >
              <Text style={styles.congratsCloseBtnText}>Incredible!</Text>
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

  // ============ SETTINGS MODAL (Improved) ============
  settingsModalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    width: '100%',
    maxWidth: 340,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textSecondary + '15',
  },
  settingsModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  settingsCloseX: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsCloseXText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  settingsOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  settingsOptionRowIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  settingsOptionRowText: {
    flex: 1,
  },
  settingsOptionRowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  settingsOptionRowDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  chevron: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: COLORS.textSecondary + '15',
    marginHorizontal: 20,
  },
  audioExpandedSection: {
    backgroundColor: COLORS.background,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  audioCompactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  audioCompactLabel: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sliderIcon: {
    fontSize: 14,
    marginHorizontal: 4,
  },
  trackPickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 2,
  },
  trackPicker: {
    gap: 4,
    marginBottom: 8,
  },
  trackOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1.5,
    borderColor: COLORS.textSecondary + '30',
  },
  trackOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  trackOptionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  trackOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  settingsCloseBtn: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  settingsCloseBtnText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ============ CONFIRM CLEAR MODAL ============
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

  // ============ ABOUT MODAL ============
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

  // ============ ACHIEVEMENT MODALS ============
  achievementModal: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  achievementModalIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  achievementModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  achievementModalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  achievementProgressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.textSecondary + '20',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  achievementProgressBarFill: {
    height: '100%',
    backgroundColor: COLORS.starFilled,
    borderRadius: 4,
  },
  achievementLevelList: {
    width: '100%',
    gap: 10,
    marginBottom: 16,
  },
  achievementLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
  },
  achievementLevelIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementLevelIconText: {
    fontSize: 20,
  },
  achievementLevelInfo: {
    flex: 1,
    marginLeft: 12,
  },
  achievementLevelName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  achievementStarsRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  achievementStar: {
    fontSize: 16,
    opacity: 0.25,
  },
  achievementStarFilled: {
    opacity: 1,
  },
  achievementLevelStarCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  achievementLevelStatus: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  achievementHintBox: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 16,
  },
  achievementHintText: {
    fontSize: 13,
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 18,
  },
  achievementCloseBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  achievementCloseBtnText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ============ CONGRATULATIONS MODALS ============
  congratsModal: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  congratsEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  congratsTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  congratsSubtitle: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 16,
  },
  congratsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  congratsBadgeIcon: {
    fontSize: 20,
  },
  congratsBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  congratsMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  congratsLevelIcons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  congratsLevelDot: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  congratsLevelDotText: {
    fontSize: 24,
  },
  congratsHintBox: {
    backgroundColor: COLORS.starFilled + '15',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 16,
  },
  congratsHintText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
  },
  congratsCloseBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
  },
  congratsCloseBtnText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  congratsStarGrid: {
    width: '100%',
    gap: 8,
    marginBottom: 20,
  },
  congratsStarGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  congratsStarGridIcon: {
    fontSize: 20,
  },
  congratsStarGridStars: {
    fontSize: 18,
  },
});

export default HomeScreen;
