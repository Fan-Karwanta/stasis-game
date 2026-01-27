import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadGameProgress, saveGameProgress, getDefaultProgress, clearAllData } from '../utils/storage';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [progress, setProgress] = useState(getDefaultProgress());
  const [lives, setLives] = useState(3);
  const [currentLevelStars, setCurrentLevelStars] = useState(3);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timeBalanced, setTimeBalanced] = useState(0);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const savedProgress = await loadGameProgress();
    setProgress(savedProgress);
    setIsLoading(false);
  };

  const completeLevel = async (levelId, stars, balancedTime = 0) => {
    const newProgress = { ...progress };
    
    if (!newProgress.completedLevels.includes(levelId)) {
      newProgress.completedLevels.push(levelId);
    }
    
    if (stars > (newProgress.stars[levelId] || 0)) {
      newProgress.stars[levelId] = stars;
    }
    
    if (balancedTime > (newProgress.timeBalanced[levelId] || 0)) {
      newProgress.timeBalanced[levelId] = balancedTime;
    }
    
    const nextLevel = levelId + 1;
    if (nextLevel <= 4 && !newProgress.unlockedLevels.includes(nextLevel)) {
      newProgress.unlockedLevels.push(nextLevel);
    }
    
    newProgress.totalStars = Object.values(newProgress.stars).reduce((a, b) => a + b, 0);
    
    setProgress(newProgress);
    await saveGameProgress(newProgress);
  };

  const resetLevelState = () => {
    setLives(3);
    setCurrentLevelStars(3);
    setHintsUsed(0);
    setTimeBalanced(0);
  };

  const loseLife = () => {
    setLives((prev) => Math.max(0, prev - 1));
  };

  const useHint = () => {
    setHintsUsed((prev) => prev + 1);
    setCurrentLevelStars((prev) => Math.max(1, prev - 1));
  };

  const calculateStars = () => {
    let stars = 3;
    stars -= hintsUsed;
    if (lives < 3) stars -= (3 - lives) * 0.5;
    return Math.max(1, Math.round(stars));
  };

  const isLevelUnlocked = (levelId) => {
    return progress.unlockedLevels.includes(levelId);
  };

  const isLevelCompleted = (levelId) => {
    return progress.completedLevels.includes(levelId);
  };

  const resetAllProgress = async () => {
    await clearAllData();
    const defaultProgress = getDefaultProgress();
    setProgress(defaultProgress);
    setLives(3);
    setCurrentLevelStars(3);
    setHintsUsed(0);
    setTimeBalanced(0);
  };

  const value = {
    progress,
    lives,
    currentLevelStars,
    hintsUsed,
    isLoading,
    timeBalanced,
    setTimeBalanced,
    completeLevel,
    resetLevelState,
    loseLife,
    useHint,
    calculateStars,
    isLevelUnlocked,
    isLevelCompleted,
    resetAllProgress,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
