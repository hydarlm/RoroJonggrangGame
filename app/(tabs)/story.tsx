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
import { router } from 'expo-router';
import { ChevronRight, BookOpen, Award } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  score?: number;
}

export default function StoryScreen() {
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: 1,
      title: 'Kerajaan Prambanan',
      subtitle: 'Awal Legenda',
      description:
        'Perkenalan dengan Roro Jonggrang dan keindahan Kerajaan Prambanan yang megah.',
      isUnlocked: true,
      isCompleted: false,
    },
    {
      id: 2,
      title: 'Bandung Bondowoso',
      subtitle: 'Pangeran Perkasa',
      description:
        'Kedatangan pangeran sakti yang menaklukkan kerajaan dengan kekuatan magisnya.',
      isUnlocked: false,
      isCompleted: false,
    },
    {
      id: 3,
      title: 'Lamaran & Tantangan',
      subtitle: 'Permintaan Mustahil',
      description:
        'Roro Jonggrang memberikan tantangan membangun seribu candi dalam satu malam.',
      isUnlocked: false,
      isCompleted: false,
    },
    {
      id: 4,
      title: 'Pembangunan Candi',
      subtitle: 'Malam yang Panjang',
      description:
        'Usaha gigih Bandung Bondowoso dan tipu daya Roro Jonggrang.',
      isUnlocked: false,
      isCompleted: false,
    },
    {
      id: 5,
      title: 'Akhir Cerita',
      subtitle: 'Multiple Endings',
      description: 'Berbagai kemungkinan akhir cerita tergantung pilihan Anda.',
      isUnlocked: false,
      isCompleted: false,
    },
  ]);

  useEffect(() => {
    loadChapterProgress();
  }, []);

  const loadChapterProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('chapterProgress');
      if (progress) {
        const savedProgress = JSON.parse(progress);
        setChapters((prevChapters) =>
          prevChapters.map((chapter) => ({
            ...chapter,
            ...savedProgress[chapter.id],
          }))
        );
      }
    } catch (error) {
      console.log('Error loading chapter progress:', error);
    }
  };

  const playChapter = (chapterId: number) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    if (!chapter?.isUnlocked) {
      Alert.alert(
        'Chapter Terkunci',
        'Selesaikan chapter sebelumnya untuk membuka chapter ini.',
        [{ text: 'OK' }]
      );
      return;
    }

    router.push(`/chapter/${chapterId}`);
  };

  const renderChapter = (chapter: Chapter, index: number) => (
    <Animated.View
      key={chapter.id}
      entering={FadeInDown.delay(index * 100)}
      style={[
        styles.chapterCard,
        !chapter.isUnlocked && styles.lockedChapter,
        chapter.isCompleted && styles.completedChapter,
      ]}
    >
      <TouchableOpacity
        style={styles.chapterContent}
        onPress={() => playChapter(chapter.id)}
        disabled={!chapter.isUnlocked}
      >
        <View style={styles.chapterHeader}>
          <View style={styles.chapterNumber}>
            <Text style={styles.chapterNumberText}>{chapter.id}</Text>
          </View>
          <View style={styles.chapterInfo}>
            <Text style={styles.chapterTitle}>{chapter.title}</Text>
            <Text style={styles.chapterSubtitle}>{chapter.subtitle}</Text>
          </View>
          <View style={styles.chapterActions}>
            {chapter.isCompleted && (
              <View style={styles.completedBadge}>
                <Award size={16} color="#D4AF37" />
                <Text style={styles.scoreText}>{chapter.score || 0}%</Text>
              </View>
            )}
            <ChevronRight
              size={24}
              color={chapter.isUnlocked ? '#D4AF37' : '#666'}
            />
          </View>
        </View>

        <Text
          style={[
            styles.chapterDescription,
            !chapter.isUnlocked && styles.lockedText,
          ]}
        >
          {chapter.description}
        </Text>

        <View style={styles.chapterFooter}>
          <View style={styles.chapterMeta}>
            <BookOpen size={14} color="#8B4513" />
            <Text style={styles.chapterMetaText}>
              {chapter.isUnlocked ? 'Tersedia' : 'Terkunci'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d1b4e', '#1a1a1a']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perjalanan Legenda</Text>
        <Text style={styles.headerSubtitle}>
          Pilih chapter untuk memulai petualangan
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {chapters.map((chapter, index) => renderChapter(chapter, index))}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  chapterCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  lockedChapter: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  completedChapter: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: '#D4AF37',
  },
  chapterContent: {
    padding: 20,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chapterNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  chapterNumberText: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#000',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#FFF',
  },
  chapterSubtitle: {
    fontSize: 14,
    fontFamily: 'CrimsonText-Regular',
    color: '#D4AF37',
    marginTop: 2,
  },
  chapterActions: {
    alignItems: 'center',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 12,
    fontFamily: 'CrimsonText-SemiBold',
    color: '#D4AF37',
    marginLeft: 4,
  },
  chapterDescription: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    lineHeight: 22,
    opacity: 0.9,
  },
  lockedText: {
    opacity: 0.5,
  },
  chapterFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
  },
  chapterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterMetaText: {
    fontSize: 12,
    fontFamily: 'CrimsonText-Regular',
    color: '#8B4513',
    marginLeft: 6,
  },
});