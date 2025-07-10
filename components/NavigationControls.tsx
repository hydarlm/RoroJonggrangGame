import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Chrome as Home,
} from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface NavigationControlsProps {
  onBack?: () => void;
  onNext?: () => void;
  onMenu?: () => void;
  showBack?: boolean;
  showNext?: boolean;
  showMenu?: boolean;
  showHome?: boolean;
  isVisible?: boolean;
  disabled?: boolean;
}

export default function NavigationControls({
  onBack,
  onNext,
  onMenu,
  showBack = true,
  showNext = true,
  showMenu = true,
  showHome = true,
  isVisible = true,
  disabled = false,
}: NavigationControlsProps) {
  const handleHome = () => {
    router.push('/');
  };

  if (!isVisible) return null;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
      {/* Left Controls */}
      <View style={styles.leftControls}>
        {showBack && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onBack}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.3)', 'rgba(212, 175, 55, 0.1)']}
              style={styles.buttonGradient}
            >
              <ChevronLeft size={24} color={disabled ? '#666' : '#D4AF37'} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {showHome && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleHome}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.3)', 'rgba(212, 175, 55, 0.1)']}
              style={styles.buttonGradient}
            >
              <Home size={20} color={disabled ? '#666' : '#D4AF37'} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Right Controls */}
      <View style={styles.rightControls}>
        {showMenu && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onMenu}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.3)', 'rgba(212, 175, 55, 0.1)']}
              style={styles.buttonGradient}
            >
              <Menu size={20} color={disabled ? '#666' : '#D4AF37'} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {showNext && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onNext}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.3)', 'rgba(212, 175, 55, 0.1)']}
              style={styles.buttonGradient}
            >
              <ChevronRight size={24} color={disabled ? '#666' : '#D4AF37'} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 50,
    zIndex: 999,
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    marginHorizontal: 4,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonGradient: {
    padding: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
});
