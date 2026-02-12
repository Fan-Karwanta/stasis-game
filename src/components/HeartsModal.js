import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import Animated, { ZoomIn, ZoomOut, FadeIn, FadeOut } from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { useGame } from '../context/GameContext';

const HeartsModal = ({ visible = true }) => {
  const { heartsCount, getNextReplenishTime, MAX_HEARTS } = useGame();
  const [modalVisible, setModalVisible] = useState(false);

  if (!visible) return null;

  const nextReplenish = getNextReplenishTime();

  const formatTime = (ms) => {
    if (!ms || ms <= 0) return '0:00';
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Floating Heart Button */}
      <Pressable
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.floatingHeartIcon}>❤️</Text>
        <View style={[
          styles.floatingBadge,
          heartsCount === 0 && styles.floatingBadgeEmpty,
        ]}>
          <Text style={styles.floatingBadgeText}>{heartsCount}</Text>
        </View>
        {heartsCount === 0 && nextReplenish && (
          <View style={styles.floatingTimerBadge}>
            <Text style={styles.floatingTimerText}>{formatTime(nextReplenish)}</Text>
          </View>
        )}
      </Pressable>

      {/* Hearts Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setModalVisible(false)}
        >
          <Animated.View
            entering={ZoomIn.duration(250)}
            exiting={ZoomOut.duration(200)}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>❤️ Hearts</Text>
                <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeText}>✕</Text>
                </Pressable>
              </View>

              {/* Hearts Display */}
              <View style={styles.heartsRow}>
                {[...Array(MAX_HEARTS)].map((_, i) => (
                  <View key={i} style={styles.heartSlot}>
                    <Text style={[styles.heartBig, i >= heartsCount && styles.heartDim]}>
                      ❤️
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={styles.heartsLabel}>
                {heartsCount} / {MAX_HEARTS} Hearts
              </Text>

              {/* Status Message */}
              {heartsCount === MAX_HEARTS && (
                <View style={styles.statusContainer}>
                  <Text style={styles.statusIcon}>✅</Text>
                  <Text style={styles.statusText}>All hearts full! You're ready to play.</Text>
                </View>
              )}

              {heartsCount > 0 && heartsCount < MAX_HEARTS && nextReplenish && (
                <View style={styles.statusContainer}>
                  <Text style={styles.statusIcon}>⏱</Text>
                  <Text style={styles.statusText}>
                    Next heart in{' '}
                    <Text style={styles.timerHighlight}>{formatTime(nextReplenish)}</Text>
                  </Text>
                </View>
              )}

              {heartsCount === 0 && (
                <View style={[styles.statusContainer, styles.statusEmpty]}>
                  <Text style={styles.statusIcon}>⏳</Text>
                  <Text style={styles.statusTextEmpty}>
                    No hearts remaining!{'\n'}
                    {nextReplenish ? (
                      <>
                        Next heart in{' '}
                        <Text style={styles.timerHighlight}>{formatTime(nextReplenish)}</Text>
                      </>
                    ) : (
                      'Hearts will regenerate soon.'
                    )}
                  </Text>
                </View>
              )}

              {/* Info */}
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>How Hearts Work</Text>
                <Text style={styles.infoText}>
                  • You have {MAX_HEARTS} hearts total{'\n'}
                  • Getting a wrong answer costs 1 heart{'\n'}
                  • Failing a level (below 75% stability) costs 1 heart{'\n'}
                  • Each lost heart regenerates after 5 minutes{'\n'}
                  • You need at least 1 heart to play any level
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 58,
    right: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  floatingHeartIcon: {
    fontSize: 22,
  },
  floatingBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  floatingBadgeEmpty: {
    backgroundColor: COLORS.error,
  },
  floatingBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  floatingTimerBadge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  floatingTimerText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 28,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  heartsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  heartSlot: {
    alignItems: 'center',
  },
  heartBig: {
    fontSize: 44,
  },
  heartDim: {
    opacity: 0.2,
  },
  heartsLabel: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statusEmpty: {
    backgroundColor: COLORS.error + '10',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  statusIcon: {
    fontSize: 24,
  },
  statusText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  statusTextEmpty: {
    flex: 1,
    fontSize: 15,
    color: COLORS.error,
    fontWeight: '500',
  },
  timerHighlight: {
    fontWeight: 'bold',
    color: COLORS.primary,
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: COLORS.primary + '08',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '15',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default HeartsModal;
