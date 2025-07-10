import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Chrome as Home,
  Settings,
  BookOpen,
  Save,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface GameMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onSave?: () => void;
  currentChapter?: number;
  currentScene?: number;
}

export default function GameMenu({
  isVisible,
  onClose,
  onSave,
  currentChapter = 1,
  currentScene = 1,
}: GameMenuProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleHome = () => {
    onClose();
    router.push('/');
  };

  const handleSettings = () => {
    onClose();
    router.push('/settings');
  };

  const handleStory = () => {
    onClose();
    router.push('/story');
  };

  const handleSave = () => {
    onSave?.();
    onClose();
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />

        <Animated.View
          entering={SlideInDown.springify()}
          style={styles.menuContainer}
        >
          <LinearGradient
            colors={[
              'rgba(26,26,26,0.98)',
              'rgba(45,27,78,0.98)',
              'rgba(26,26,26,0.98)',
            ]}
            style={styles.menuContent}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Menu Game</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                Chapter {currentChapter} - Scene {currentScene}
              </Text>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuItem} onPress={handleSave}>
                <View style={styles.menuIcon}>
                  <Save size={20} color="#D4AF37" />
                </View>
                <Text style={styles.menuText}>Simpan Progress</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={toggleSound}>
                <View style={styles.menuIcon}>
                  {soundEnabled ? (
                    <Volume2 size={20} color="#D4AF37" />
                  ) : (
                    <VolumeX size={20} color="#666" />
                  )}
                </View>
                <Text style={styles.menuText}>
                  {soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleStory}>
                <View style={styles.menuIcon}>
                  <BookOpen size={20} color="#D4AF37" />
                </View>
                <Text style={styles.menuText}>Pilih Chapter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleSettings}
              >
                <View style={styles.menuIcon}>
                  <Settings size={20} color="#D4AF37" />
                </View>
                <Text style={styles.menuText}>Pengaturan</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleHome}>
                <View style={styles.menuIcon}>
                  <Home size={20} color="#D4AF37" />
                </View>
                <Text style={styles.menuText}>Kembali ke Menu Utama</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  menuContainer: {
    width: '85%',
    maxWidth: 400,
  },
  menuContent: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
  },
  closeButton: {
    padding: 8,
  },
  progressInfo: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'CrimsonText-Regular',
    color: '#D4AF37',
  },
  menuItems: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    padding: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    flex: 1,
  },
});
