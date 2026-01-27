import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';

const SituationVisual = ({ stimulus, systemType }) => {
  const bounceY = useSharedValue(0);
  const shake = useSharedValue(0);
  const pulse = useSharedValue(1);
  const sweat = useSharedValue(0);

  useEffect(() => {
    if (!stimulus) return;

    // Reset animations
    bounceY.value = 0;
    shake.value = 0;
    pulse.value = 1;
    sweat.value = 0;

    // Determine animation based on stimulus effect
    const effect = stimulus.effect || 0;

    if (systemType === 'temperature') {
      if (effect > 0) {
        // Hot situation - show sweating/heat animation
        sweat.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 500 }),
            withTiming(0, { duration: 500 })
          ),
          -1,
          true
        );
        pulse.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 800 }),
            withTiming(1, { duration: 800 })
          ),
          -1,
          true
        );
      } else if (effect < 0) {
        // Cold situation - show shivering animation
        shake.value = withRepeat(
          withSequence(
            withTiming(-3, { duration: 50 }),
            withTiming(3, { duration: 50 }),
            withTiming(-3, { duration: 50 }),
            withTiming(0, { duration: 50 })
          ),
          -1,
          false
        );
      }
    } else if (systemType === 'hydration') {
      if (effect < 0) {
        // Dehydrating - show drooping/tired animation
        bounceY.value = withRepeat(
          withSequence(
            withTiming(5, { duration: 1000 }),
            withTiming(0, { duration: 1000 })
          ),
          -1,
          true
        );
      } else if (effect > 0) {
        // Hydrating - show bouncy/energetic animation
        bounceY.value = withRepeat(
          withSequence(
            withSpring(-8),
            withSpring(0)
          ),
          -1,
          true
        );
      }
    } else if (systemType === 'glucose') {
      if (effect > 0) {
        // Sugar spike - show energetic/hyper animation
        pulse.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 300 }),
            withTiming(1, { duration: 300 })
          ),
          -1,
          true
        );
        bounceY.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: 200 }),
            withTiming(0, { duration: 200 })
          ),
          -1,
          true
        );
      } else if (effect < 0) {
        // Low sugar - show sluggish animation
        bounceY.value = withRepeat(
          withSequence(
            withTiming(3, { duration: 1500 }),
            withTiming(0, { duration: 1500 })
          ),
          -1,
          true
        );
      }
    }
  }, [stimulus]);

  const characterStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bounceY.value },
      { translateX: shake.value },
      { scale: pulse.value },
    ],
  }));

  const sweatStyle = useAnimatedStyle(() => ({
    opacity: sweat.value,
  }));

  if (!stimulus) return null;

  const getActivityIcon = () => {
    if (!stimulus.text) return '🧍';
    const text = stimulus.text.toLowerCase();
    
    // Temperature activities
    if (text.includes('exercise') || text.includes('running') || text.includes('workout')) return '🏃';
    if (text.includes('hot') || text.includes('sun') || text.includes('sauna')) return '☀️';
    if (text.includes('cold') || text.includes('snow') || text.includes('ice')) return '❄️';
    if (text.includes('fever') || text.includes('sick')) return '🤒';
    if (text.includes('swim')) return '🏊';
    
    // Hydration activities
    if (text.includes('sweat') || text.includes('exercise')) return '💦';
    if (text.includes('drink') || text.includes('water')) return '🥤';
    if (text.includes('coffee') || text.includes('caffeine')) return '☕';
    if (text.includes('salt') || text.includes('salty')) return '🧂';
    
    // Glucose activities
    if (text.includes('eat') || text.includes('meal') || text.includes('food')) return '🍽️';
    if (text.includes('candy') || text.includes('sugar') || text.includes('sweet')) return '🍬';
    if (text.includes('fast') || text.includes('skip')) return '⏰';
    if (text.includes('exercise') || text.includes('run')) return '🏃';
    
    return '🧍';
  };

  const getEffectIndicator = () => {
    const effect = stimulus.effect || 0;
    if (effect > 0) {
      return { icon: '📈', color: COLORS.error, text: 'Rising' };
    } else if (effect < 0) {
      return { icon: '📉', color: COLORS.hydration, text: 'Dropping' };
    }
    return { icon: '➡️', color: COLORS.textSecondary, text: 'Stable' };
  };

  const effectInfo = getEffectIndicator();

  return (
    <View style={styles.container}>
      <View style={styles.visualContainer}>
        <Animated.View style={[styles.characterContainer, characterStyle]}>
          <Text style={styles.activityIcon}>{getActivityIcon()}</Text>
          
          {/* Sweat drops for hot situations */}
          <Animated.View style={[styles.sweatContainer, sweatStyle]}>
            <Text style={styles.sweatDrop}>💧</Text>
            <Text style={[styles.sweatDrop, styles.sweatDrop2]}>💧</Text>
          </Animated.View>
        </Animated.View>
        
        <View style={styles.effectBadge}>
          <Text style={styles.effectIcon}>{effectInfo.icon}</Text>
          <Text style={[styles.effectText, { color: effectInfo.color }]}>{effectInfo.text}</Text>
        </View>
      </View>
      
      <View style={styles.situationInfo}>
        <Text style={styles.situationLabel}>Current Situation:</Text>
        <Text style={styles.situationText}>{stimulus.text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  visualContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 20,
  },
  characterContainer: {
    width: 70,
    height: 70,
    backgroundColor: COLORS.background,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activityIcon: {
    fontSize: 36,
  },
  sweatContainer: {
    position: 'absolute',
    top: 5,
    right: -5,
    flexDirection: 'row',
  },
  sweatDrop: {
    fontSize: 12,
  },
  sweatDrop2: {
    marginLeft: -4,
    marginTop: 8,
  },
  effectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  effectIcon: {
    fontSize: 16,
  },
  effectText: {
    fontSize: 12,
    fontWeight: '600',
  },
  situationInfo: {
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    paddingTop: 12,
  },
  situationLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  situationText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default SituationVisual;
