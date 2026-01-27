import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { COLORS } from '../constants/colors';

const LivesDisplay = ({ lives, maxLives = 3 }) => {
  return (
    <View style={styles.container}>
      {[...Array(maxLives)].map((_, index) => (
        <Animated.Text
          key={index}
          style={[
            styles.heart,
            index < lives ? styles.heartFull : styles.heartEmpty,
          ]}
        >
          ❤️
        </Animated.Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heart: {
    fontSize: 24,
  },
  heartFull: {
    opacity: 1,
  },
  heartEmpty: {
    opacity: 0.3,
  },
});

export default LivesDisplay;
