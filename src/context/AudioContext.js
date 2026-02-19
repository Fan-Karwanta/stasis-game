import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AudioContext = createContext();

const STORAGE_KEY = '@stasis_audio_settings';

const DEFAULT_SETTINGS = {
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  selectedMusicTrack: 'track1',
};

// Sound asset map
const SFX_ASSETS = {
  buttonTap: require('../../assets/sounds/button-tap.wav'),
  actionPress: require('../../assets/sounds/action-press.wav'),
  correctAction: require('../../assets/sounds/correct-action.wav'),
  wrongAction: require('../../assets/sounds/wrong-action.wav'),
  heartLoss: require('../../assets/sounds/heart-loss.wav'),
  criticalAlert: require('../../assets/sounds/critical-alert.wav'),
  levelComplete: require('../../assets/sounds/level-complete.wav'),
  levelFail: require('../../assets/sounds/level-fail.wav'),
  hintReveal: require('../../assets/sounds/hint-reveal.wav'),
  timerTick: require('../../assets/sounds/timer-tick.wav'),
  timerWarning: require('../../assets/sounds/timer-warning.wav'),
  starEarned: require('../../assets/sounds/star-earned.wav'),
  modalOpen: require('../../assets/sounds/modal-open.wav'),
  navigate: require('../../assets/sounds/navigate.wav'),
  swoosh: require('../../assets/sounds/swoosh.wav'),
  wobble: require('../../assets/sounds/wobble.wav'),
  clockTick: require('../../assets/sounds/clock-tick.wav'),
  slideSwoosh: require('../../assets/sounds/slide-swoosh.wav'),
  pop: require('../../assets/sounds/pop.wav'),
};

// Music tracks available for selection
const MUSIC_TRACKS = {
  track1: { label: '🎵 Ambient Calm', asset: require('../../assets/sounds/bg_music1.mp3') },
  track2: { label: '🎶 Menu Theme', asset: require('../../assets/sounds/menu-music.wav') },
  track3: { label: '🎸 Gameplay Beat', asset: require('../../assets/sounds/gameplay-music.wav') },
};

const MUSIC_TRACK_KEYS = Object.keys(MUSIC_TRACKS);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isReady, setIsReady] = useState(false);
  const [currentMusicTrack, setCurrentMusicTrack] = useState(null);

  const sfxCache = useRef({});
  const musicRef = useRef(null);
  const settingsRef = useRef(settings);
  const currentTrackRef = useRef(null);
  const clockTickRef = useRef(null);
  const clockTickIntervalRef = useRef(null);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Initialize audio mode and load settings
  useEffect(() => {
    const init = async () => {
      try {
        // Load saved settings regardless of audio availability
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
        });

        setIsReady(true);
      } catch (e) {
        console.warn('Audio init error:', e);
        setIsReady(true);
      }
    };
    init();

    return () => {
      // Cleanup on unmount
      Object.values(sfxCache.current).forEach(async (sound) => {
        try { await sound.unloadAsync(); } catch (e) {}
      });
      if (musicRef.current) {
        try { musicRef.current.unloadAsync(); } catch (e) {}
      }
    };
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    if (isReady) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
    }
  }, [settings, isReady]);

  // Update music volume when settings change
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.setVolumeAsync(
        settings.musicEnabled ? settings.musicVolume : 0
      ).catch(() => {});
    }
  }, [settings.musicVolume, settings.musicEnabled]);

  const saveSettings = useCallback(async (newSettings) => {
    setSettings(newSettings);
  }, []);

  // ============ SFX ============

  const playSfx = useCallback(async (sfxName) => {
    try {
      const s = settingsRef.current;
      if (!s.sfxEnabled || s.sfxVolume <= 0) return;

      const asset = SFX_ASSETS[sfxName];
      if (!asset) return;

      // Create a new sound instance each time for overlapping sounds
      const { sound } = await Audio.Sound.createAsync(asset, {
        volume: s.sfxVolume,
        shouldPlay: true,
      });

      // Auto-cleanup when done
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch (e) {
      // Silently fail - don't crash the game for audio issues
    }
  }, []);

  // ============ CLOCK TICK (continuous during gameplay) ============

  const startClockTick = useCallback(async () => {
    try {
      // Stop any existing tick
      if (clockTickIntervalRef.current) {
        clearInterval(clockTickIntervalRef.current);
        clockTickIntervalRef.current = null;
      }
      if (clockTickRef.current) {
        try { await clockTickRef.current.unloadAsync(); } catch (e) {}
        clockTickRef.current = null;
      }

      const s = settingsRef.current;
      if (!s.sfxEnabled || s.sfxVolume <= 0) return;

      // Play tick every second
      const playTick = async () => {
        try {
          const cs = settingsRef.current;
          if (!cs.sfxEnabled || cs.sfxVolume <= 0) return;
          const { sound } = await Audio.Sound.createAsync(SFX_ASSETS.clockTick, {
            volume: cs.sfxVolume * 0.6,
            shouldPlay: true,
          });
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) sound.unloadAsync().catch(() => {});
          });
        } catch (e) {}
      };

      playTick();
      clockTickIntervalRef.current = setInterval(playTick, 1000);
    } catch (e) {}
  }, []);

  const stopClockTick = useCallback(() => {
    if (clockTickIntervalRef.current) {
      clearInterval(clockTickIntervalRef.current);
      clockTickIntervalRef.current = null;
    }
    if (clockTickRef.current) {
      try { clockTickRef.current.unloadAsync(); } catch (e) {}
      clockTickRef.current = null;
    }
  }, []);

  // ============ MUSIC ============

  const playMusic = useCallback(async () => {
    try {
      const s = settingsRef.current;
      const trackKey = s.selectedMusicTrack || 'track1';

      // Don't restart same track
      if (currentTrackRef.current === trackKey && musicRef.current) {
        const status = await musicRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) return;
      }

      // Stop current music
      if (musicRef.current) {
        try {
          await musicRef.current.stopAsync();
          await musicRef.current.unloadAsync();
        } catch (e) {}
        musicRef.current = null;
      }

      const track = MUSIC_TRACKS[trackKey];
      if (!track) return;

      const { sound } = await Audio.Sound.createAsync(track.asset, {
        volume: s.musicEnabled ? s.musicVolume : 0,
        isLooping: true,
        shouldPlay: true,
      });

      musicRef.current = sound;
      currentTrackRef.current = trackKey;
      setCurrentMusicTrack(trackKey);
    } catch (e) {
      console.warn('Music play error:', e);
    }
  }, []);

  const stopMusic = useCallback(async () => {
    try {
      if (musicRef.current) {
        await musicRef.current.stopAsync();
        await musicRef.current.unloadAsync();
        musicRef.current = null;
        currentTrackRef.current = null;
        setCurrentMusicTrack(null);
      }
    } catch (e) {}
  }, []);

  const pauseMusic = useCallback(async () => {
    try {
      if (musicRef.current) {
        await musicRef.current.pauseAsync();
      }
    } catch (e) {}
  }, []);

  const resumeMusic = useCallback(async () => {
    try {
      if (musicRef.current) {
        const s = settingsRef.current;
        if (s.musicEnabled) {
          await musicRef.current.playAsync();
        }
      }
    } catch (e) {}
  }, []);

  // ============ SETTINGS HELPERS ============

  const setMusicEnabled = useCallback((enabled) => {
    setSettings((prev) => ({ ...prev, musicEnabled: enabled }));
    if (musicRef.current) {
      if (!enabled) {
        musicRef.current.setVolumeAsync(0).catch(() => {});
      } else {
        musicRef.current.setVolumeAsync(settingsRef.current.musicVolume).catch(() => {});
      }
    }
  }, []);

  const setSfxEnabled = useCallback((enabled) => {
    setSettings((prev) => ({ ...prev, sfxEnabled: enabled }));
  }, []);

  const setMusicVolume = useCallback((volume) => {
    setSettings((prev) => ({ ...prev, musicVolume: volume }));
  }, []);

  const setSfxVolume = useCallback((volume) => {
    setSettings((prev) => ({ ...prev, sfxVolume: volume }));
  }, []);

  const setSelectedMusicTrack = useCallback((trackKey) => {
    setSettings((prev) => ({ ...prev, selectedMusicTrack: trackKey }));
    // Restart music with new track
    if (musicRef.current) {
      (async () => {
        try {
          await musicRef.current.stopAsync();
          await musicRef.current.unloadAsync();
        } catch (e) {}
        musicRef.current = null;
        currentTrackRef.current = null;
        // Small delay then play new track
        setTimeout(() => playMusic(), 100);
      })();
    }
  }, [playMusic]);

  const value = {
    settings,
    isReady,
    currentMusicTrack,
    playSfx,
    playMusic,
    stopMusic,
    pauseMusic,
    resumeMusic,
    startClockTick,
    stopClockTick,
    setMusicEnabled,
    setSfxEnabled,
    setMusicVolume,
    setSfxVolume,
    setSelectedMusicTrack,
    MUSIC_TRACKS,
    MUSIC_TRACK_KEYS,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};
