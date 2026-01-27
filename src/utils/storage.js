import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  GAME_PROGRESS: '@balance_within_progress',
  HIGH_SCORES: '@balance_within_scores',
  SETTINGS: '@balance_within_settings',
};

export const saveGameProgress = async (progress) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_PROGRESS, JSON.stringify(progress));
    return true;
  } catch (error) {
    console.error('Error saving game progress:', error);
    return false;
  }
};

export const loadGameProgress = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GAME_PROGRESS);
    if (data) {
      return JSON.parse(data);
    }
    return getDefaultProgress();
  } catch (error) {
    console.error('Error loading game progress:', error);
    return getDefaultProgress();
  }
};

export const getDefaultProgress = () => ({
  currentLevel: 1,
  unlockedLevels: [1],
  completedLevels: [],
  stars: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  },
  totalStars: 0,
  timeBalanced: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  },
});

export const saveHighScore = async (level, score) => {
  try {
    const scores = await loadHighScores();
    if (!scores[level] || score > scores[level]) {
      scores[level] = score;
      await AsyncStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(scores));
    }
    return true;
  } catch (error) {
    console.error('Error saving high score:', error);
    return false;
  }
};

export const loadHighScores = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
    if (data) {
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error('Error loading high scores:', error);
    return {};
  }
};

export const resetProgress = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.GAME_PROGRESS,
      STORAGE_KEYS.HIGH_SCORES,
    ]);
    return true;
  } catch (error) {
    console.error('Error resetting progress:', error);
    return false;
  }
};
