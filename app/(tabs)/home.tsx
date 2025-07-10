import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Play,
  Trophy,
  Info,
  Settings,
  Volume2,
  VolumeX,
  LogOut,
  Save,
  Home as HomeIcon,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  FadeInDown,
} from 'react-native-reanimated';
import { useSoundManager } from '@/components/SoundManager';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/contexts/SessionProvider';

export default function HomeScreen() {
  const [gameProgress, setGameProgress] = useState(0);
  const [totalAchievements, setTotalAchievements] = useState(0);
  const [lastPlayedChapter, setLastPlayedChapter] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const { playSound, playMusic, stopMusic, isMusicEnabled, toggleMusic } =
    useSoundManager();
  const router = useRouter();
  const { session } = useSession();

  useEffect(() => {
    playMusic('menu');
    return () => {
      stopMusic();
    };
  }, []);

  useEffect(() => {
    loadGameData();
  }, [session]);

  const loadGameData = async () => {
    setIsLoading(true);
    try {
      if (session) {
        const { data, error } = await supabase
          .from('game_save_slots')
          .select('*')
          .eq('user_id', session.user.id);

        if (error) throw error;

        const totalChapters = 5;
        const chapterIds = (data || [])
          .map((s) => Number(s.chapter_id))
          .filter((id) => !isNaN(id));
        const completedChapters = new Set(chapterIds).size;
        setGameProgress(Math.round((completedChapters / totalChapters) * 100));

        const allAchievements = new Set(
          (data || []).flatMap((s) =>
            Array.isArray(s.achievements) ? s.achievements : []
          )
        );
        setTotalAchievements(allAchievements.size);

        setLastPlayedChapter(
          chapterIds.length > 0 ? Math.max(...chapterIds) : 1
        );
      } else {
        const saves = await AsyncStorage.getItem('gameSaves');
        if (saves) {
          const slots = JSON.parse(saves).filter((s: any) => s != null);
          const totalChapters = 5;
          const chapterIds = slots.map((s: any) => s.chapterId);
          setGameProgress(
            Math.round(
              (new Set(chapterIds).size / totalChapters) * 100
            )
          );
          const allAch = new Set(
            slots.flatMap((s: any) =>
              Array.isArray(s.achievements) ? s.achievements : []
            )
          );
          setTotalAchievements(allAch.size);
          setLastPlayedChapter(
            chapterIds.length > 0 ? Math.max(...chapterIds) : 1
          );
        } else {
          setGameProgress(0);
          setTotalAchievements(0);
          setLastPlayedChapter(1);
        }
      }
    } catch (e) {
      console.error('Error loading game data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMusic = () => {
    if (isMusicEnabled) toggleMusic();
    else playMusic('menu');
  };

  const startGame = () => {
    playSound('success');
    if (gameProgress > 0) {
      Alert.alert(
        'Lanjutkan Permainan',
        `Chapter terakhir: ${lastPlayedChapter}`,
        [
          { text: 'Mulai Ulang', onPress: () => router.push('/story') },
          {
            text: 'Lanjutkan',
            onPress: () =>
              router.push(`/chapter/${lastPlayedChapter}`),
          },
        ]
      );
    } else {
      router.push('/story');
    }
  };

  const handleSignOut = async () => {
    playSound('click');
    await supabase.auth.signOut();
    router.replace('/');
  };

  const handleSaveGuestProgress = useCallback(() => {
    playSound('click');
    Alert.alert(
      'Simpan Progres & Daftar',
      'Login dengan Google untuk menyimpan progres Anda.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Lanjutkan & Login',
          onPress: async () => {
            const raw = await AsyncStorage.getItem('gameSaves');
            if (raw) {
              await AsyncStorage.setItem('migration-in-progress', raw);
              await supabase.auth.signInWithOAuth({
                provider: 'google',
              });
            }
          },
        },
      ]
    );
  }, []);

  const showAchievements = () => {
    playSound('click');
    router.push('/achievements');
  };
  const showInfo = () => {
    playSound('click');
    router.push('/not-found');
  };
  const showSettings = () => {
    playSound('click');
    router.push('/settings');
  };
  const goHome = () => {
    playSound('click');
    router.replace('/');
  };

  if (isLoading) {
    return (
      <ImageBackground
        source={require('../../assets/images/bghome.png')}
        style={styles.background}
      >
        <View style={styles.feedbackContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.feedbackText}>Memuat data...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/bghome.png')}
      style={styles.background}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(75,0,130,0.8)', 'rgba(0,0,0,0.9)']}
        style={styles.overlay}
      >
        {/* Toggle Musik */}
        <TouchableOpacity
          style={styles.musicToggle}
          onPress={handleToggleMusic}
        >
          <View style={styles.musicButton}>
            {isMusicEnabled ? (
              <Volume2 size={20} color="#D4AF37" />
            ) : (
              <VolumeX size={20} color="#666" />
            )}
          </View>
        </TouchableOpacity>

        {/* Judul */}
        <View style={styles.container}>
          <Animated.View
            entering={FadeInUp.delay(200).duration(800)}
            style={styles.titleContainer}
          >
            <Text style={styles.title}>Roro Jonggrang</Text>
            <Text style={styles.subtitle}>
              Legenda Candi Prambanan
            </Text>
            <View style={styles.decorativeLine} />
          </Animated.View>

          {/* Statistik Progres & Pencapaian */}
          <Animated.View
            entering={SlideInLeft.delay(400)}
            style={styles.statsContainer}
          >
            <View style={styles.statCard}>
              <Trophy size={20} color="#D4AF37" />
              <Text style={styles.statValue}>{gameProgress}%</Text>
              <Text style={styles.statLabel}>Progres</Text>
            </View>
            <View style={styles.statCard}>
              <Trophy size={20} color="#D4AF37" />
              <Text style={styles.statValue}>
                {totalAchievements}
              </Text>
              <Text style={styles.statLabel}>Pencapaian</Text>
            </View>
          </Animated.View>

          {/* Tombol Aksi */}
          <Animated.View
            entering={FadeInDown.delay(600)}
            style={styles.buttonSection}
          >
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={startGame}
            >
              <Play size={18} color="#000" />
              <Text style={styles.primaryActionText}>
                {gameProgress > 0
                  ? 'Lanjutkan Petualangan'
                  : 'Mulai Petualangan'}
              </Text>
            </TouchableOpacity>

            <Animated.View
              entering={SlideInRight.delay(800)}
              style={styles.categoryRow}
            >
              {[
                { icon: Trophy, text: 'Pencapaian', onPress: showAchievements },
                { icon: Info, text: 'Info', onPress: showInfo },
                {
                  icon: Settings,
                  text: 'Pengaturan',
                  onPress: showSettings,
                },
              ].map(({ icon: Icon, text, onPress }) => (
                <TouchableOpacity
                  key={text}
                  style={styles.categoryButton}
                  onPress={onPress}
                >
                  <Icon size={16} color="#D4AF37" />
                  <Text style={styles.categoryText}>{text}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </Animated.View>

          {/* Area Akun */}
          <Animated.View
            entering={FadeInDown.delay(1000)}
            style={styles.accountContainer}
          >
            {session ? (
              <TouchableOpacity
                style={styles.accountButton}
                onPress={handleSignOut}
              >
                <LogOut size={16} color="#FF6B6B" />
                <Text
                  style={[
                    styles.accountButtonText,
                    { color: '#FF6B6B' },
                  ]}
                >
                  Logout
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.accountButton}
                onPress={handleSaveGuestProgress}
              >
                <Save size={16} color="#45b6fe" />
                <Text
                  style={[
                    styles.accountButtonText,
                    { color: '#45b6fe' },
                  ]}
                >
                  Simpan & Daftar
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.accountButton}
              onPress={goHome}
            >
              <HomeIcon size={16} color="#FFF" />
              <Text style={styles.accountButtonText}>
                Menu Utama
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1 },
  musicToggle: { position: 'absolute', top: 50, right: 20, zIndex: 1000 },
  musicButton: {
    padding: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  feedbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  feedbackText: {
    marginTop: 20,
    fontSize: 16,
    color: '#FFFFFF',
  },
  titleContainer: { alignItems: 'center', marginBottom: 20 },
  title: {
    fontSize: 48,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    marginTop: 8,
    opacity: 0.9,
  },
  decorativeLine: {
    width: 80,
    height: 2,
    backgroundColor: '#D4AF37',
    marginTop: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    minWidth: 100,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    opacity: 0.8,
  },
  buttonSection: {
    width: '100%',
    alignItems: 'center',
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryActionText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    marginLeft: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
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
    margin: 4,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'CrimsonText-SemiBold',
    color: '#D4AF37',
    marginLeft: 4,
  },
  accountContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 6,
  },
  accountButtonText: {
    color: '#FFF',
    fontFamily: 'CrimsonText-SemiBold',
    marginLeft: 6,
    fontSize: 12,
  },
});
