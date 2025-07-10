import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Trophy,
  Star,
  Crown,
  Heart,
  Sword,
  Book,
  Clock,
  Target,
  Award,
  Lock,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, BounceIn } from 'react-native-reanimated';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'story' | 'quiz' | 'choice' | 'special' | 'completion' | 'time';
  isUnlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlockedAt?: string;
}

interface GameStats {
  choicesMade: number;
  bestScores: Record<string, number>;
  relationshipScores: Record<string, number>;
  chaptersCompleted: number;
  totalPlayTime: number;
}

export default function AchievementsScreen() {
  // Initialize default game stats
  const [gameStats, setGameStats] = useState<GameStats>({
    choicesMade: 0,
    bestScores: {},
    relationshipScores: {},
    chaptersCompleted: 0,
    totalPlayTime: 0,
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_chapter',
      title: 'Awal Perjalanan',
      description: 'Selesaikan Chapter 1',
      icon: Book,
      category: 'story',
      isUnlocked: false,
      rarity: 'common',
      points: 10,
    },
    {
      id: 'perfect_quiz',
      title: 'Cendekia Prambanan',
      description: 'Jawab semua quiz dengan sempurna',
      icon: Star,
      category: 'quiz',
      isUnlocked: false,
      progress: 0,
      maxProgress: 5,
      rarity: 'rare',
      points: 25,
    },
    {
      id: 'wise_choices',
      title: 'Kebijaksanaan Roro',
      description: 'Buat 10 pilihan bijak dalam dialog',
      icon: Crown,
      category: 'choice',
      isUnlocked: false,
      progress: 0,
      maxProgress: 10,
      rarity: 'rare',
      points: 20,
    },
    {
      id: 'romantic_ending',
      title: 'Cinta Sejati',
      description: 'Raih ending romantis',
      icon: Heart,
      category: 'story',
      isUnlocked: false,
      rarity: 'epic',
      points: 30,
    },
    {
      id: 'battle_master',
      title: 'Ahli Strategi',
      description: 'Menangkan semua mini-game battle dengan skor tinggi',
      icon: Sword,
      category: 'special',
      isUnlocked: false,
      rarity: 'epic',
      points: 35,
    },
    {
      id: 'story_master',
      title: 'Master Legenda',
      description: 'Selesaikan semua chapter',
      icon: Trophy,
      category: 'completion',
      isUnlocked: false,
      rarity: 'legendary',
      points: 50,
    },
    {
      id: 'speed_reader',
      title: 'Pembaca Cepat',
      description: 'Selesaikan satu chapter dalam 15 menit',
      icon: Clock,
      category: 'time',
      isUnlocked: false,
      rarity: 'rare',
      points: 20,
    },
    {
      id: 'perfectionist',
      title: 'Perfeksionis',
      description: 'Dapatkan skor 100% di semua mini-game',
      icon: Target,
      category: 'special',
      isUnlocked: false,
      progress: 0,
      maxProgress: 3,
      rarity: 'legendary',
      points: 50,
    },
    {
      id: 'collector',
      title: 'Kolektor',
      description: 'Buka semua item di galeri',
      icon: Award,
      category: 'completion',
      isUnlocked: false,
      progress: 0,
      maxProgress: 9,
      rarity: 'epic',
      points: 30,
    },
    {
      id: 'relationship_expert',
      title: 'Ahli Hubungan',
      description: 'Capai hubungan 80+ dengan semua karakter',
      icon: Heart,
      category: 'choice',
      isUnlocked: false,
      progress: 0,
      maxProgress: 3,
      rarity: 'epic',
      points: 35,
    },
  ]);

  const [stats, setStats] = useState({
    totalAchievements: 0,
    unlockedAchievements: 0,
    totalPoints: 0,
    earnedPoints: 0,
    completionPercentage: 0,
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadGameStats();
    loadAchievements();
  }, []);

  useEffect(() => {
    updateAchievements();
  }, [gameStats]);

  const loadGameStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem('gameStats');
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        setGameStats(parsedStats);
      }
    } catch (error) {
      console.log('Error loading game stats:', error);
    }
  };

  const updateAchievements = () => {
    const updatedAchievements = achievements.map((achievement) => {
      let progress = achievement.progress || 0;

      // Update progress based on game stats
      switch (achievement.id) {
        case 'wise_choices':
          progress = Math.min(
            gameStats.choicesMade,
            achievement.maxProgress || 10
          );
          break;
        case 'perfectionist':
          const perfectScores = Object.values(gameStats.bestScores).filter(
            (score) => score >= 100
          ).length;
          progress = Math.min(perfectScores, achievement.maxProgress || 3);
          break;
        case 'relationship_expert':
          const highRelationships = Object.values(
            gameStats.relationshipScores
          ).filter((score) => score >= 80).length;
          progress = Math.min(highRelationships, achievement.maxProgress || 3);
          break;
      }

      return {
        ...achievement,
        progress,
      };
    });

    setAchievements(updatedAchievements);
  };

  const loadAchievements = async () => {
    try {
      const savedAchievements = await AsyncStorage.getItem('achievements');
      const unlockedIds = savedAchievements
        ? JSON.parse(savedAchievements)
        : [];

      const updatedAchievements = achievements.map((achievement) => {
        const isUnlocked = unlockedIds.includes(achievement.id);
        return {
          ...achievement,
          isUnlocked,
          unlockedAt: isUnlocked ? new Date().toISOString() : undefined,
        };
      });

      setAchievements(updatedAchievements);

      const totalPoints = updatedAchievements.reduce(
        (sum, ach) => sum + ach.points,
        0
      );
      const earnedPoints = updatedAchievements
        .filter((ach) => ach.isUnlocked)
        .reduce((sum, ach) => sum + ach.points, 0);

      setStats({
        totalAchievements: updatedAchievements.length,
        unlockedAchievements: unlockedIds.length,
        totalPoints,
        earnedPoints,
        completionPercentage: Math.round(
          (unlockedIds.length / updatedAchievements.length) * 100
        ),
      });
    } catch (error) {
      console.log('Error loading achievements:', error);
    }
  };

  const categories = [
    { id: 'all', name: 'Semua', icon: Trophy },
    { id: 'story', name: 'Cerita', icon: Book },
    { id: 'quiz', name: 'Kuis', icon: Star },
    { id: 'choice', name: 'Pilihan', icon: Crown },
    { id: 'special', name: 'Spesial', icon: Sword },
    { id: 'completion', name: 'Selesai', icon: Award },
    { id: 'time', name: 'Waktu', icon: Clock },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '#8B8B8B';
      case 'rare':
        return '#4A90E2';
      case 'epic':
        return '#9B59B6';
      case 'legendary':
        return '#F39C12';
      default:
        return '#D4AF37';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'Umum';
      case 'rare':
        return 'Langka';
      case 'epic':
        return 'Epik';
      case 'legendary':
        return 'Legendaris';
      default:
        return 'Khusus';
    }
  };

  const filteredAchievements =
    selectedCategory === 'all'
      ? achievements
      : achievements.filter((ach) => ach.category === selectedCategory);

  const showAchievementDetails = (achievement: Achievement) => {
    const rarityName = getRarityName(achievement.rarity);
    const progressText =
      achievement.progress !== undefined
        ? `\n\nProgress: ${achievement.progress}/${achievement.maxProgress}`
        : '';

    const unlockedText =
      achievement.isUnlocked && achievement.unlockedAt
        ? `\n\nDibuka: ${new Date(achievement.unlockedAt).toLocaleDateString(
            'id-ID'
          )}`
        : '';

    Alert.alert(
      achievement.title,
      `${achievement.description}\n\nRaritas: ${rarityName}\nPoin: ${achievement.points}${progressText}${unlockedText}`,
      [{ text: 'Tutup' }]
    );
  };

  const renderCategoryButton = (category: any, index: number) => {
    const IconComponent = category.icon;
    const isSelected = selectedCategory === category.id;

    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryButton, isSelected && styles.selectedCategory]}
        onPress={() => setSelectedCategory(category.id)}
      >
        <IconComponent size={16} color={isSelected ? '#000' : '#D4AF37'} />
        <Text
          style={[
            styles.categoryText,
            isSelected && styles.selectedCategoryText,
          ]}
        >
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderAchievement = (achievement: Achievement, index: number) => {
    const IconComponent = achievement.icon;
    const rarityColor = getRarityColor(achievement.rarity);

    return (
      <Animated.View
        key={achievement.id}
        entering={FadeInDown.delay(index * 50)}
      >
        <TouchableOpacity
          style={[
            styles.achievementCard,
            achievement.isUnlocked && styles.unlockedCard,
            { borderLeftColor: rarityColor, borderLeftWidth: 4 },
          ]}
          onPress={() => showAchievementDetails(achievement)}
        >
          <View style={styles.achievementContent}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: achievement.isUnlocked
                    ? rarityColor + '30'
                    : 'rgba(255,255,255,0.1)',
                },
              ]}
            >
              {achievement.isUnlocked ? (
                <IconComponent size={24} color={rarityColor} />
              ) : (
                <Lock size={24} color="#666" />
              )}
            </View>

            <View style={styles.achievementInfo}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.achievementTitle,
                    !achievement.isUnlocked && styles.lockedText,
                  ]}
                >
                  {achievement.title}
                </Text>
                <Text style={[styles.pointsText, { color: rarityColor }]}>
                  {achievement.points}pt
                </Text>
              </View>

              <Text
                style={[
                  styles.achievementDescription,
                  !achievement.isUnlocked && styles.lockedText,
                ]}
              >
                {achievement.description}
              </Text>

              <View style={styles.achievementMeta}>
                <View
                  style={[
                    styles.rarityBadge,
                    { backgroundColor: rarityColor + '20' },
                  ]}
                >
                  <Text style={[styles.rarityText, { color: rarityColor }]}>
                    {getRarityName(achievement.rarity)}
                  </Text>
                </View>

                {achievement.progress !== undefined && (
                  <Text style={styles.progressText}>
                    {achievement.progress}/{achievement.maxProgress}
                  </Text>
                )}
              </View>
            </View>

            {achievement.isUnlocked && (
              <Animated.View entering={BounceIn} style={styles.unlockedBadge}>
                <Trophy size={16} color="#D4AF37" />
              </Animated.View>
            )}
          </View>

          {achievement.progress !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        (achievement.progress /
                          (achievement.maxProgress || 1)) *
                        100
                      }%`,
                      backgroundColor: rarityColor,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d1b4e', '#1a1a1a']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pencapaian</Text>
        <Text style={styles.headerSubtitle}>
          {stats.unlockedAchievements}/{stats.totalAchievements} Terbuka
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Trophy size={20} color="#D4AF37" />
            <Text style={styles.statValue}>{stats.unlockedAchievements}</Text>
            <Text style={styles.statLabel}>Pencapaian</Text>
          </View>

          <View style={styles.statCard}>
            <Star size={20} color="#D4AF37" />
            <Text style={styles.statValue}>{stats.earnedPoints}</Text>
            <Text style={styles.statLabel}>Poin</Text>
          </View>

          <View style={styles.statCard}>
            <Award size={20} color="#D4AF37" />
            <Text style={styles.statValue}>{stats.completionPercentage}%</Text>
            <Text style={styles.statLabel}>Selesai</Text>
          </View>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map(renderCategoryButton)}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredAchievements.map(renderAchievement)}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    minWidth: 80,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    opacity: 0.8,
    marginTop: 2,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoriesScroll: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'CrimsonText-SemiBold',
    color: '#D4AF37',
    marginLeft: 4,
  },
  selectedCategoryText: {
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  achievementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
    padding: 16,
  },
  unlockedCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#FFF',
    flex: 1,
  },
  pointsText: {
    fontSize: 12,
    fontFamily: 'CrimsonText-SemiBold',
    marginLeft: 8,
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    opacity: 0.8,
    marginTop: 4,
    marginBottom: 8,
  },
  lockedText: {
    opacity: 0.5,
  },
  achievementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 10,
    fontFamily: 'CrimsonText-SemiBold',
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'CrimsonText-Regular',
    color: '#D4AF37',
  },
  unlockedBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    padding: 6,
    borderRadius: 8,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
