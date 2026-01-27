import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { COLORS, getMeterColor } from '../constants/colors';

const StatusMeter = ({
  value,
  minValue = 0,
  maxValue = 100,
  normalMin,
  normalMax,
  label,
  unit = '',
  showNormalRange = true,
}) => {
  const animatedWidth = useSharedValue(0);
  const statusColor = getMeterColor(value, normalMin, normalMax);

  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
  const normalMinPercent = ((normalMin - minValue) / (maxValue - minValue)) * 100;
  const normalMaxPercent = ((normalMax - minValue) / (maxValue - minValue)) * 100;

  useEffect(() => {
    animatedWidth.value = withSpring(Math.min(100, Math.max(0, percentage)), {
      damping: 15,
      stiffness: 100,
    });
  }, [value]);

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  const getStatusText = () => {
    if (value < normalMin) return 'LOW';
    if (value > normalMax) return 'HIGH';
    return 'NORMAL';
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: statusColor }]}>
            {value.toFixed(1)} {unit}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.meterContainer}>
        {showNormalRange && (
          <View
            style={[
              styles.normalRange,
              {
                left: `${normalMinPercent}%`,
                width: `${normalMaxPercent - normalMinPercent}%`,
              },
            ]}
          />
        )}
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: statusColor },
            fillAnimatedStyle,
          ]}
        />
        <View style={styles.meterOverlay} />
      </View>

      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{minValue}</Text>
        <Text style={[styles.rangeLabel, styles.normalRangeLabel]}>
          Normal: {normalMin}-{normalMax}
        </Text>
        <Text style={styles.rangeLabel}>{maxValue}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: COLORS.textLight,
    fontSize: 10,
    fontWeight: 'bold',
  },
  meterContainer: {
    height: 24,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
  },
  normalRange: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.normal,
  },
  fill: {
    height: '100%',
    borderRadius: 10,
  },
  meterOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rangeLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  normalRangeLabel: {
    color: COLORS.normal,
    fontWeight: '600',
  },
});

export default StatusMeter;
