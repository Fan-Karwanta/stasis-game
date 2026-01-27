import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ActionButton = ({
  action,
  onPress,
  disabled = false,
  selected = false,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.92);
    }
  };

  const handlePressOut = () => {
    scale.value = withSequence(
      withSpring(1.05),
      withSpring(1)
    );
  };

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (onPress) onPress(action);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.button,
        selected && styles.selected,
        disabled && styles.disabled,
        animatedStyle,
      ]}
    >
      <Text style={styles.icon}>{action.icon}</Text>
      <Text style={[styles.name, disabled && styles.disabledText]}>{action.name}</Text>
      <Text style={[styles.description, disabled && styles.disabledText]}>
        {action.description}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: COLORS.levelLocked,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
});

export default ActionButton;
