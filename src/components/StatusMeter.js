import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolateColor,
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
  compact = false,
}) => {
  const animatedWidth = useSharedValue(0);
  const indicatorPosition = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const statusColor = getMeterColor(value, normalMin, normalMax);

  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
  const normalMinPercent = ((normalMin - minValue) / (maxValue - minValue)) * 100;
  const normalMaxPercent = ((normalMax - minValue) / (maxValue - minValue)) * 100;

  useEffect(() => {
    // Smoother animation with better timing
    animatedWidth.value = withTiming(Math.min(100, Math.max(0, percentage)), {
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    indicatorPosition.value = withTiming(Math.min(100, Math.max(0, percentage)), {
      duration: 350,
      easing: Easing.out(Easing.cubic),
    });
    
    // Pulse effect when value changes significantly
    pulseScale.value = withSpring(1.15, { damping: 8 });
    setTimeout(() => {
      pulseScale.value = withSpring(1, { damping: 12 });
    }, 150);
  }, [value]);

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    left: `${indicatorPosition.value}%`,
    transform: [{ scale: pulseScale.value }, { translateX: -8 }],
  }));

  const getStatusText = () => {
    if (value < normalMin) return 'LOW';
    if (value > normalMax) return 'HIGH';
    return 'NORMAL';
  };

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
        <View style={styles.valueContainer}>
          <Animated.Text style={[styles.value, compact && styles.valueCompact, { color: statusColor }]}>
            {value.toFixed(1)} {unit}
          </Animated.Text>
          <View style={[styles.statusBadge, compact && styles.statusBadgeCompact, { backgroundColor: statusColor }]}>
            <Text style={[styles.statusText, compact && styles.statusTextCompact]}>{getStatusText()}</Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.meterContainer, compact && styles.meterContainerCompact]}>
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
        {/* Indicator dot */}
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: statusColor },
            indicatorAnimatedStyle,
          ]}
        />
        <View style={styles.meterOverlay} />
      </View>

      {!compact && (
        <View style={styles.rangeLabels}>
          <Text style={styles.rangeLabel}>{minValue}</Text>
          <Text style={[styles.rangeLabel, styles.normalRangeLabel]}>
            Normal: {normalMin}-{normalMax}
          </Text>
          <Text style={styles.rangeLabel}>{maxValue}</Text>
        </View>
      )}
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
    height: 28,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    overflow: 'visible',
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    position: 'relative',
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
    borderRadius: 12,
    opacity: 0.85,
  },
  indicator: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 36,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 2,
    borderColor: COLORS.cardBackground,
  },
  meterOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
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
  // Compact styles for Level 4
  containerCompact: {
    paddingHorizontal: 8,
  },
  labelCompact: {
    fontSize: 13,
  },
  valueCompact: {
    fontSize: 14,
  },
  statusBadgeCompact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusTextCompact: {
    fontSize: 8,
  },
  meterContainerCompact: {
    height: 20,
    borderRadius: 10,
  },
});

export default StatusMeter;
