import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { loadGameProgress, saveGameProgress, getDefaultProgress, clearAllData, loadHeartsData, saveHeartsData, getDefaultHearts } from '../utils/storage';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

const MAX_HEARTS = 3;
const HEART_REPLENISH_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

export const GameProvider = ({ children }) => {
  const [progress, setProgress] = useState(getDefaultProgress());
  const [lives, setLives] = useState(3);
  const [currentLevelStars, setCurrentLevelStars] = useState(3);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timeBalanced, setTimeBalanced] = useState(0);
  const [heartsData, setHeartsData] = useState(getDefaultHearts());
  const [heartTimerTick, setHeartTimerTick] = useState(0);
  const [heartLostTrigger, setHeartLostTrigger] = useState(0);
  const heartsDataRef = useRef(heartsData);

  useEffect(() => {
    heartsDataRef.current = heartsData;
  }, [heartsData]);

  useEffect(() => {
    loadProgress();
  }, []);

  // Replenish hearts timer - runs every second to check timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const current = heartsDataRef.current;
      if (!current.replenishTimestamps || current.replenishTimestamps.length === 0) {
        setHeartTimerTick((prev) => prev + 1);
        return;
      }

      let updated = false;
      const remaining = [];
      let newCount = current.count;
      for (const ts of current.replenishTimestamps) {
        if (now >= ts) {
          newCount = Math.min(MAX_HEARTS, newCount + 1);
          updated = true;
        } else {
          remaining.push(ts);
        }
      }

      if (updated) {
        const newData = { count: newCount, replenishTimestamps: remaining };
        setHeartsData(newData);
        saveHeartsData(newData);
      }
      setHeartTimerTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadProgress = async () => {
    const savedProgress = await loadGameProgress();
    const savedHearts = await loadHeartsData();
    // Process any hearts that should have replenished while app was closed
    const now = Date.now();
    const remaining = [];
    let newCount = savedHearts.count || 0;
    if (savedHearts.replenishTimestamps) {
      for (const ts of savedHearts.replenishTimestamps) {
        if (now >= ts) {
          newCount = Math.min(MAX_HEARTS, newCount + 1);
        } else {
          remaining.push(ts);
        }
      }
    }
    const processedHearts = { count: newCount, replenishTimestamps: remaining };
    setHeartsData(processedHearts);
    await saveHeartsData(processedHearts);
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

  const heartsCount = heartsData.count;

  const getNextReplenishTime = useCallback(() => {
    if (!heartsData.replenishTimestamps || heartsData.replenishTimestamps.length === 0) {
      return null;
    }
    const earliest = Math.min(...heartsData.replenishTimestamps);
    const remaining = earliest - Date.now();
    return remaining > 0 ? remaining : null;
  }, [heartsData, heartTimerTick]);

  const deductHeart = useCallback(async () => {
    const current = heartsDataRef.current;
    if (current.count <= 0) return false;
    
    const newCount = current.count - 1;
    const newTimestamps = [...(current.replenishTimestamps || [])];
    newTimestamps.push(Date.now() + HEART_REPLENISH_MS);
    
    const newData = { count: newCount, replenishTimestamps: newTimestamps };
    setHeartsData(newData);
    setHeartLostTrigger((prev) => prev + 1);
    await saveHeartsData(newData);
    return true;
  }, []);

  const canPlay = useCallback(() => {
    return heartsData.count > 0;
  }, [heartsData]);

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
    if (heartsData.count < MAX_HEARTS) stars -= (MAX_HEARTS - heartsData.count) * 0.5;
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
    const defaultHearts = getDefaultHearts();
    setProgress(defaultProgress);
    setHeartsData(defaultHearts);
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
    heartsCount,
    getNextReplenishTime,
    deductHeart,
    canPlay,
    MAX_HEARTS,
    HEART_REPLENISH_MS,
    heartLostTrigger,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
