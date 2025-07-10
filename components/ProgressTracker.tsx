import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  PropsWithChildren,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/contexts/SessionProvider';

// REVISI: Interface GameStats diubah untuk menyimpan daftar ID pencapaian
interface GameStats {
  totalPlayTime: number;
  chaptersCompleted: number;
  unlockedAchievements: string[]; // Diubah dari achievementsUnlocked (number)
  choicesMade: number;
  minigamesPlayed: number;
  bestScores: Record<string, number>;
  endings: string[];
  favoriteCharacter: string;
  relationshipScores: Record<string, number>;
}

interface ProgressContextType {
  gameStats: GameStats;
  isLoading: boolean;
  updatePlayTime: (minutes: number) => void;
  completeChapter: (chapterId: number, score: number) => void;
  unlockAchievement: (achievementId: string) => void;
  recordChoice: (choiceId: string, chapterId: number) => void;
  recordMinigame: (gameType: string, score: number) => void;
  recordEnding: (endingType: string) => void;
  updateRelationship: (character: string, score: number) => void;
  getCompletionPercentage: () => number;
  getPlayTimeFormatted: () => string;
  resetProgress: () => Promise<void>;
}

// REVISI: Nilai default disesuaikan dengan perubahan interface
const defaultStats: GameStats = {
  totalPlayTime: 0,
  chaptersCompleted: 0,
  unlockedAchievements: [], // Diubah
  choicesMade: 0,
  minigamesPlayed: 0,
  bestScores: {},
  endings: [],
  favoriteCharacter: '',
  relationshipScores: {
    roro_jonggrang: 50,
    bandung_bondowoso: 50,
    raja_baka: 50,
  },
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgressTracker = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgressTracker harus digunakan di dalam ProgressProvider');
  }
  return context;
};

export const ProgressProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [gameStats, setGameStats] = useState<GameStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useSession();
  const sessionStartTime = useRef(Date.now());

  const loadGameStats = useCallback(async () => {
    setIsLoading(true);
    try {
      let stats: GameStats | null = null;
      if (session) {
        const { data, error } = await supabase
          .from('user_stats')
          .select('stats')
          .eq('user_id', session.user.id)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) stats = data.stats as GameStats;
      } else {
        const statsString = await AsyncStorage.getItem('gameStats');
        if (statsString) stats = JSON.parse(statsString);
      }
      // REVISI: Memastikan data yang dimuat memiliki semua properti default
      setGameStats({ ...defaultStats, ...(stats || {}) });
    } catch (error) {
      console.log('Error loading game stats:', error);
      setGameStats(defaultStats);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadGameStats();
  }, [loadGameStats]);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime.current) / 60000);
      if (elapsed > 0) {
        updatePlayTime(elapsed);
        sessionStartTime.current = Date.now();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const saveGameStats = useCallback(async (newStats: GameStats) => {
    try {
      if (session) {
        const { error } = await supabase
          .from('user_stats')
          .upsert({ user_id: session.user.id, stats: newStats }, { onConflict: 'user_id' });
        if (error) throw error;
      } else {
        await AsyncStorage.setItem('gameStats', JSON.stringify(newStats));
      }
    } catch (error) {
      console.log('Error saving game stats:', error);
    }
  }, [session]);

  const updateAndSaveStats = useCallback((updateFunction: (prevStats: GameStats) => GameStats) => {
    setGameStats(prev => {
        const newStats = updateFunction(prev);
        saveGameStats(newStats);
        return newStats;
    });
  }, [saveGameStats]);

  const resetProgress = async () => {
    await AsyncStorage.removeItem('gameStats');
    setGameStats(defaultStats);
  };

  const updatePlayTime = (minutes: number) => {
    updateAndSaveStats(prev => ({ ...prev, totalPlayTime: prev.totalPlayTime + minutes }));
  };

  const completeChapter = (chapterId: number, score: number) => {
    updateAndSaveStats(prev => ({
      ...prev,
      chaptersCompleted: Math.max(prev.chaptersCompleted, chapterId),
      bestScores: {
        ...prev.bestScores,
        [`chapter_${chapterId}`]: Math.max(prev.bestScores[`chapter_${chapterId}`] || 0, score),
      },
    }));
  };
  
  // REVISI: Implementasi fungsi unlockAchievement
  const unlockAchievement = (achievementId: string) => {
    updateAndSaveStats(prev => {
      if (prev.unlockedAchievements.includes(achievementId)) return prev; // Hindari duplikasi
      return {
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, achievementId]
      };
    });
  };

  const recordChoice = (choiceId: string, chapterId: number) => {
    updateAndSaveStats(prev => ({ ...prev, choicesMade: prev.choicesMade + 1 }));
  };

  const recordMinigame = (gameType: string, score: number) => {
    updateAndSaveStats(prev => ({
      ...prev,
      minigamesPlayed: prev.minigamesPlayed + 1,
      bestScores: {
        ...prev.bestScores,
        [gameType]: Math.max(prev.bestScores[gameType] || 0, score),
      },
    }));
  };

  const recordEnding = (endingType: string) => {
    updateAndSaveStats(prev => {
      if (prev.endings.includes(endingType)) return prev;
      return { ...prev, endings: [...prev.endings, endingType] };
    });
  };

  const updateRelationship = (character: string, score: number) => {
    updateAndSaveStats(prev => {
      const updatedScores = { ...prev.relationshipScores, [character]: score };
      const highest = Math.max(...Object.values(updatedScores));
      const favorite = Object.keys(updatedScores).find(c => updatedScores[c] === highest) || '';
      return { ...prev, relationshipScores: updatedScores, favoriteCharacter: favorite };
    });
  };

  const getCompletionPercentage = (): number => {
    const totalChapters = 5;
    const totalAchievements = 10; // Sesuaikan dengan jumlah achievement Anda
    const totalEndings = 3;

    const chapterProgress = (gameStats.chaptersCompleted / totalChapters) * 40;
    const achievementProgress = (gameStats.unlockedAchievements.length / totalAchievements) * 40;
    const endingProgress = (gameStats.endings.length / totalEndings) * 20;

    return Math.round(chapterProgress + achievementProgress + endingProgress);
  };

  const getPlayTimeFormatted = (): string => {
    const hours = Math.floor(gameStats.totalPlayTime / 60);
    const minutes = gameStats.totalPlayTime % 60;
    return hours > 0 ? `${hours}j ${minutes}m` : `${minutes}m`;
  };

  return (
    <ProgressContext.Provider
      value={{
        gameStats,
        isLoading,
        updatePlayTime,
        completeChapter,
        unlockAchievement,
        recordChoice,
        recordMinigame,
        recordEnding,
        updateRelationship,
        getCompletionPercentage,
        getPlayTimeFormatted,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};
