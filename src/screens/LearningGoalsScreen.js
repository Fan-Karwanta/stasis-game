import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { LEARNING_GOALS } from '../constants/gameData';
import { useAudio } from '../context/AudioContext';

const LearningGoalsScreen = ({ navigation }) => {
  const { playSfx } = useAudio();
  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
        <Text style={styles.title}>🎯 Learning Goals</Text>
        <Text style={styles.subtitle}>
          What you'll learn about homeostasis
        </Text>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {LEARNING_GOALS.map((goal, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(200 + index * 100)}
            style={styles.goalCard}
          >
            <View style={styles.goalNumber}>
              <Text style={styles.goalNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.goalText}>{goal}</Text>
          </Animated.View>
        ))}

        <Animated.View 
          entering={FadeInDown.delay(800)}
          style={styles.diagramContainer}
        >
          <Text style={styles.diagramTitle}>Feedback Mechanism</Text>
          <View style={styles.diagram}>
            <View style={styles.diagramRow}>
              <View style={[styles.diagramBox, { backgroundColor: COLORS.high }]}>
                <Text style={styles.diagramBoxText}>Imbalance</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
              <View style={[styles.diagramBox, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.diagramBoxText}>Detection</Text>
              </View>
            </View>
            <Text style={styles.arrowDown}>↓</Text>
            <View style={styles.diagramRow}>
              <View style={[styles.diagramBox, { backgroundColor: COLORS.normal }]}>
                <Text style={styles.diagramBoxText}>Balance</Text>
              </View>
              <Text style={styles.arrow}>←</Text>
              <View style={[styles.diagramBox, { backgroundColor: COLORS.secondary }]}>
                <Text style={styles.diagramBoxText}>Response</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeIn.delay(1000)} style={styles.footer}>
        <Pressable
          style={styles.backButton}
          onPress={() => { playSfx('buttonTap'); navigation.goBack(); }}
        >
          <Text style={styles.backButtonText}>Got it!</Text>
        </Pressable>
      </Animated.View>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalNumberText: {
    color: COLORS.textLight,
    fontWeight: 'bold',
    fontSize: 16,
  },
  goalText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  diagramContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  diagramTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  diagram: {
    alignItems: 'center',
  },
  diagramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagramBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  diagramBoxText: {
    color: COLORS.textLight,
    fontWeight: 'bold',
    fontSize: 12,
  },
  arrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
    marginHorizontal: 8,
  },
  arrowDown: {
    fontSize: 24,
    color: COLORS.textSecondary,
    marginVertical: 8,
    alignSelf: 'flex-end',
    marginRight: 45,
  },
  footer: {
    padding: 20,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LearningGoalsScreen;
