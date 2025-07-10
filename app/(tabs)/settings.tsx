import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
  Platform,
  Modal,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Volume2,
  VolumeX,
  RefreshCw,
  Info,
  Settings as SettingsIcon,
  Download,
  Share,
  Star,
  X,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSoundManager } from '@/components/SoundManager';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    musicEnabled: true,
    autoAdvance: false,
    textSpeed: 1,
    vibrationEnabled: true,
    autoSave: true,
  });

  const {
    isMusicEnabled,
    isSoundEnabled,
    toggleMusic,
    toggleSound,
    setMusicVolume,
    setSoundVolume,
  } = useSoundManager();

  const [musicVolume, setMusicVolumeState] = useState(0.7);
  const [soundVolume, setSoundVolumeState] = useState(0.8);
  const [aboutVisible, setAboutVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('gameSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        setMusicVolumeState(parsed.musicVolume || 0.7);
        setSoundVolumeState(parsed.soundVolume || 0.8);
      }
    })();
  }, []);

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      const settingsToSave = {
        ...newSettings,
        musicVolume,
        soundVolume,
      };
      await AsyncStorage.setItem(
        'gameSettings',
        JSON.stringify(settingsToSave)
      );
      setSettings(newSettings);
    } catch (err) {
      console.log('Failed to save settings:', err);
    }
  };

  const resetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Yakin ingin menghapus semua progress? Ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'gameProgress',
                'chapterProgress',
                'achievements',
                'hasPlayedBefore',
              ]);
              Alert.alert('Sukses', 'Progress telah direset.');
            } catch {
              Alert.alert('Gagal', 'Tidak bisa mereset progress.');
            }
          },
        },
      ]
    );
  };

  const exportSave = async () => {
    try {
      const data = {
        gameProgress: await AsyncStorage.getItem('gameProgress'),
        chapterProgress: await AsyncStorage.getItem('chapterProgress'),
        achievements: await AsyncStorage.getItem('achievements'),
        settings: await AsyncStorage.getItem('gameSettings'),
        timestamp: new Date().toISOString(),
      };

      if (Platform.OS === 'web') {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `save-roro-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }

      Alert.alert('Berhasil', 'Data berhasil diekspor.');
    } catch {
      Alert.alert('Gagal', 'Ekspor data gagal.');
    }
  };

  const shareGame = () => {
    Alert.alert('Bagikan Game', 'Ajak teman bermain game Roro Jonggrang!', [
      { text: 'Tutup', style: 'cancel' },
      {
        text: 'Bagikan',
        onPress: () => {
          if (Platform.OS === 'web') {
            navigator
              .share?.({
                title: 'Roro Jonggrang',
                text: 'Mainkan game budaya Indonesia!',
                url: window.location.href,
              })
              .catch(() => {
                navigator.clipboard?.writeText(window.location.href);
                Alert.alert('Link Disalin', 'Tautan disalin ke clipboard.');
              });
          }
        },
      },
    ]);
  };

  const rateGame = () => {
    Alert.alert(
      'Beri Rating',
      'Suka dengan game ini? Dukung kami dengan rating!',
      [
        { text: 'Nanti Saja', style: 'cancel' },
        {
          text: '⭐ Beri Rating',
          onPress: () =>
            Alert.alert('Terima Kasih!', 'Rating kamu sangat berarti!'),
        },
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    Icon: React.ComponentType<{ size?: number; color?: string }>,
    i: number
  ) => (
    <Animated.View
      entering={FadeInDown.delay(i * 100)}
      style={styles.settingItem}
    >
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>
          <Icon size={24} color="#D4AF37" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#767577', true: '#D4AF37' }}
          thumbColor={value ? '#FFF' : '#f4f3f4'}
        />
      </View>
    </Animated.View>
  );

  const renderSliderItem = (
    title: string,
    description: string,
    value: number,
    onChange: (value: number) => void,
    Icon: React.ComponentType<{ size?: number; color?: string }>,
    i: number
  ) => (
    <Animated.View
      entering={FadeInDown.delay(i * 100)}
      style={styles.settingItem}
    >
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>
          <Icon size={24} color="#D4AF37" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={value}
          onValueChange={onChange}
          minimumTrackTintColor="#D4AF37"
          maximumTrackTintColor="rgba(255,255,255,0.3)"
        />
        <Text style={styles.sliderValue}>{Math.round(value * 100)}%</Text>
      </View>
    </Animated.View>
  );

  const renderActionItem = (
    title: string,
    desc: string,
    onPress: () => void,
    Icon: React.ComponentType<{ size?: number; color?: string }>,
    i: number,
    danger: boolean = false
  ) => (
    <Animated.View
      entering={FadeInDown.delay(i * 100)}
      style={styles.settingItem}
    >
      <TouchableOpacity style={styles.settingContent} onPress={onPress}>
        <View style={styles.settingIcon}>
          <Icon size={24} color={danger ? '#FF6B6B' : '#D4AF37'} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, danger && styles.destructiveText]}>
            {title}
          </Text>
          <Text style={styles.settingDescription}>{desc}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d1b4e', '#1a1a1a']}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pengaturan</Text>
          <Text style={styles.headerSubtitle}>Atur pengalaman bermainmu</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audio</Text>
            {renderSettingItem(
              'Musik',
              'Aktifkan musik latar',
              isMusicEnabled,
              toggleMusic,
              Volume2,
              0
            )}
            {isMusicEnabled &&
              renderSliderItem(
                'Volume Musik',
                'Sesuaikan suara musik',
                musicVolume,
                setMusicVolumeState,
                Volume2,
                1
              )}
            {renderSettingItem(
              'Efek Suara',
              'Suara interaksi & efek',
              isSoundEnabled,
              toggleSound,
              Volume2,
              2
            )}
            {isSoundEnabled &&
              renderSliderItem(
                'Volume Efek',
                'Atur volume efek',
                soundVolume,
                setSoundVolumeState,
                Volume2,
                3
              )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gameplay</Text>
            {renderSettingItem(
              'Auto Advance',
              'Dialog jalan otomatis',
              settings.autoAdvance,
              (v) => saveSettings({ ...settings, autoAdvance: v }),
              SettingsIcon,
              4
            )}
            {renderSettingItem(
              'Auto Save',
              'Simpan otomatis',
              settings.autoSave,
              (v) => saveSettings({ ...settings, autoSave: v }),
              Download,
              5
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data & Sosial</Text>
            {renderActionItem(
              'Ekspor Save',
              'Simpan data ke file',
              exportSave,
              Download,
              6
            )}
            {renderActionItem(
              'Bagikan Game',
              'Ajak teman bermain',
              shareGame,
              Share,
              7
            )}
            {renderActionItem(
              'Beri Rating',
              'Beri kami feedback',
              rateGame,
              Star,
              8
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lainnya</Text>
            {renderActionItem(
              'Tentang',
              'Tentang pengembang',
              () => setAboutVisible(true),
              Info,
              9
            )}
            {renderActionItem(
              'Reset Progress',
              'Hapus semua progress',
              resetProgress,
              RefreshCw,
              10,
              true
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={aboutVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setAboutVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setAboutVisible(false)}
              >
                <X size={24} color="#FFF" />
              </TouchableOpacity>
              <Image
                source={require('@/assets/creator1.jpg')}
                style={styles.creatorImage}
              />
              <Text style={styles.modalTitle}> Kelompok 2</Text>
              <Text style={styles.modalText}> © 2025 roro-jonggrang-game-interaktif. All rights reserved.</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  header: { paddingTop: 60, paddingBottom: 20, alignItems: 'center' },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    opacity: 0.8,
    marginTop: 8,
  },
  content: { paddingHorizontal: 20 },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginBottom: 12,
    padding: 16,
  },
  settingContent: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingText: { flex: 1 },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#FFF',
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    opacity: 0.8,
    marginTop: 2,
  },
  destructiveText: { color: '#FF6B6B' },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  slider: { flex: 1 },
  sliderValue: {
    fontSize: 14,
    color: '#D4AF37',
    marginLeft: 12,
    minWidth: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#2d1b4e',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  modalTitle: {
    fontSize: 40,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginTop: 12,
  },
  modalText: {
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    marginTop: 10,
  },
  modalClose: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  creatorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#D4AF37',
    marginBottom: 12,
  },
});