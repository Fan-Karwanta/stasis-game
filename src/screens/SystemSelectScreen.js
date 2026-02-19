import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { LEVELS } from '../constants/gameData';
import { useGame } from '../context/GameContext';
import { useAudio } from '../context/AudioContext';
import { StarsDisplay } from '../components';

const SystemSelectScreen = ({ navigation }) => {
  const { isLevelUnlocked, isLevelCompleted, progress, heartsCount, getNextReplenishTime, canPlay, MAX_HEARTS } = useGame();
  const { playSfx } = useAudio();

  const formatTime = (ms) => {
    if (!ms || ms <= 0) return '';
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleLevelPress = (level) => {
    if (!isLevelUnlocked(level.id)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      playSfx('wrongAction');
      return;
    }
    if (!canPlay()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      playSfx('wrongAction');
      const nextTime = getNextReplenishTime();
      Alert.alert(
        '\u{1F494} No Hearts',
        `You have no hearts left.\n\nNext heart replenishes in ${formatTime(nextTime)}.\n\nHearts regenerate every 5 minutes.`,
        [{ text: 'OK' }]
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playSfx('navigate');
    navigation.navigate(`Level${level.id}`);
  };

  const getLevelColor = (levelId) => {
    switch (levelId) {
      case 1: return COLORS.temperature;
      case 2: return COLORS.hydration;
      case 3: return COLORS.glucose;
      case 4: return COLORS.system;
      default: return COLORS.primary;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
        <Text style={styles.title}>Select System</Text>
        <Text style={styles.subtitle}>Choose a body system to manage</Text>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {LEVELS.map((level, index) => {
          const unlocked = isLevelUnlocked(level.id);
          const completed = isLevelCompleted(level.id);
          const stars = progress.stars[level.id] || 0;
          const levelColor = getLevelColor(level.id);

          return (
            <Animated.View
              key={level.id}
              entering={FadeInDown.delay(200 + index * 100)}
            >
              <Pressable
                style={[
                  styles.levelCard,
                  !unlocked && styles.levelLocked,
                  completed && styles.levelCompleted,
                ]}
                onPress={() => handleLevelPress(level)}
              >
                <View style={[styles.levelIconContainer, { backgroundColor: unlocked ? levelColor : COLORS.levelLocked }]}>
                  <Text style={styles.levelIcon}>{unlocked ? level.icon : '\u{1F512}'}</Text>
                </View>
                
                <View style={styles.levelInfo}>
                  <Text style={[styles.levelName, !unlocked && styles.textLocked]}>
                    Level {level.id}: {level.name}
                  </Text>
                  <Text style={[styles.levelDescription, !unlocked && styles.textLocked]}>
                    {unlocked ? level.description : 'Complete previous level to unlock'}
                  </Text>
                  
                  {unlocked && (
                    <View style={styles.levelStats}>
                      <StarsDisplay stars={stars} size={18} />
                      {completed && (
                        <View style={styles.completedBadge}>
                          <Text style={styles.completedText}>{'✓'} Completed</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                <View style={styles.arrowContainer}>
                  <Text style={[styles.arrow, !unlocked && styles.textLocked]}>
                    {unlocked ? '→' : ''}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 12,
    textAlign: 'center',
    
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelLocked: {
    opacity: 0.6,
  },
  levelCompleted: {
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  levelIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelIcon: {
    fontSize: 28,
  },
  levelInfo: {
    flex: 1,
    marginLeft: 16,
  },
  levelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  levelDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  textLocked: {
    color: COLORS.levelLocked,
  },
  levelStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  completedBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '600',
  },
  arrowContainer: {
    width: 30,
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
});

export default SystemSelectScreen;
