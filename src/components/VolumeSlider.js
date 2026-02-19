import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder, Dimensions } from 'react-native';
import { COLORS } from '../constants/colors';

const VolumeSlider = ({ value = 0.5, onValueChange }) => {
  const sliderRef = useRef(null);
  const sliderWidth = useRef(0);

  const handleTouch = (evt) => {
    if (sliderWidth.current <= 0) return;
    const x = evt.nativeEvent.locationX;
    const newVal = Math.max(0, Math.min(1, x / sliderWidth.current));
    if (onValueChange) onValueChange(newVal);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => handleTouch(evt),
      onPanResponderMove: (evt) => handleTouch(evt),
    })
  ).current;

  return (
    <View
      ref={sliderRef}
      style={styles.container}
      onLayout={(e) => {
        sliderWidth.current = e.nativeEvent.layout.width;
      }}
      {...panResponder.panHandlers}
    >
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${value * 100}%` }]} />
        <View
          style={[
            styles.thumb,
            { left: `${value * 100}%` },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  track: {
    height: 6,
    backgroundColor: COLORS.textSecondary + '30',
    borderRadius: 3,
    position: 'relative',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    top: -7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default VolumeSlider;
