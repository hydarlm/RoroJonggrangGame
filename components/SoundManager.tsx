// SoundProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SoundContextType {
  playSound: (type: 'click' | 'success' | 'error' | 'transition') => void;
  playMusic: (type: 'menu' | 'story' | 'battle' | 'peaceful') => void;
  stopMusic: () => void;
  setMusicVolume: (volume: number) => void;
  setSoundVolume: (volume: number) => void;
  isMusicEnabled: boolean;
  isSoundEnabled: boolean;
  toggleMusic: () => void;
  toggleSound: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const useSoundManager = () => {
  const context = useContext(SoundContext);
  if (!context)
    throw new Error('useSoundManager must be used within SoundProvider');
  return context;
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentMusic, setCurrentMusic] = useState<Audio.Sound | null>(null);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [musicVolume, setMusicVolumeState] = useState(0.7);
  const [soundVolume, setSoundVolumeState] = useState(0.8);

  const soundEffects = {
    click: require('@/assets/sounds/click.mp3'),
    success: require('@/assets/sounds/success.mp3'),
    error: require('@/assets/sounds/error.mp3'),
    transition: require('@/assets/sounds/transition.mp3'),
  };

  const backgroundMusic = {
    menu: require('@/assets/sounds/menu.mp3'),
    story: require('@/assets/sounds/story.mp3'),
    battle: require('@/assets/sounds/battle.mp3'),
    peaceful: require('@/assets/sounds/peaceful.mp3'),
  };

  useEffect(() => {
    loadSettings();
    setupAudio();
    return () => {
      if (currentMusic) currentMusic.unloadAsync();
    };
  }, []);

  const setupAudio = async () => {
    if (Platform.OS !== 'web') {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('gameSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setIsMusicEnabled(parsed.musicEnabled ?? true);
        setIsSoundEnabled(parsed.soundEnabled ?? true);
        setMusicVolumeState(parsed.musicVolume ?? 0.7);
        setSoundVolumeState(parsed.soundVolume ?? 0.8);
      }
    } catch (e) {
      console.log('Load settings error:', e);
    }
  };

  const saveSettings = async () => {
    const settings = {
      musicEnabled: isMusicEnabled,
      soundEnabled: isSoundEnabled,
      musicVolume,
      soundVolume,
    };
    await AsyncStorage.setItem('gameSettings', JSON.stringify(settings));
  };

  const playSound = async (type: keyof typeof soundEffects) => {
    if (!isSoundEnabled) return;
    try {
      const { sound } = await Audio.Sound.createAsync(soundEffects[type], {
        shouldPlay: true,
        volume: soundVolume,
      });
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
      });
    } catch (err) {
      console.log(`Error playing sound ${type}:`, err);
    }
  };

  const playMusic = async (type: keyof typeof backgroundMusic) => {
    if (!isMusicEnabled) return;
    try {
      if (currentMusic) {
        await currentMusic.stopAsync();
        await currentMusic.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(backgroundMusic[type], {
        shouldPlay: true,
        volume: musicVolume,
        isLooping: true,
      });
      setCurrentMusic(sound);
    } catch (err) {
      console.log(`Error playing music ${type}:`, err);
    }
  };

  const stopMusic = async () => {
    if (currentMusic) {
      await currentMusic.stopAsync();
      await currentMusic.unloadAsync();
      setCurrentMusic(null);
    }
  };

  const setMusicVolume = async (volume: number) => {
    setMusicVolumeState(volume);
    if (currentMusic) await currentMusic.setVolumeAsync(volume);
    saveSettings();
  };

  const setSoundVolume = (volume: number) => {
    setSoundVolumeState(volume);
    saveSettings();
  };

  const toggleMusic = () => {
    const newState = !isMusicEnabled;
    setIsMusicEnabled(newState);
    if (!newState) stopMusic();
    saveSettings();
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    saveSettings();
  };

  return (
    <SoundContext.Provider
      value={{
        playSound,
        playMusic,
        stopMusic,
        setMusicVolume,
        setSoundVolume,
        isMusicEnabled,
        isSoundEnabled,
        toggleMusic,
        toggleSound,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};
