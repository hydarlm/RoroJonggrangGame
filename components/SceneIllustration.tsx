import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ZoomIn, ZoomOut, X } from 'lucide-react-native';
import Animated, {
  FadeIn,
  ZoomIn as ReanimatedZoomIn,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface SceneIllustrationProps {
  imageUrl?: number | string;
  title?: string;
  allowZoom?: boolean;
  overlay?: boolean;
  children?: React.ReactNode;
}

export default function SceneIllustration({
  imageUrl,
  title,
  allowZoom = true,
  overlay = true,
  children,
}: SceneIllustrationProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleZoomToggle = () => {
    if (allowZoom) {
      setIsZoomed(!isZoomed);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={handleZoomToggle}
        activeOpacity={allowZoom ? 0.8 : 1}
        disabled={!allowZoom}
      >
        <Image
          source={
            typeof imageUrl === 'string'
              ? { uri: imageUrl }
              : imageUrl
          }
          style={styles.image}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
        />

        {overlay && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.overlay}
          />
        )}

        {imageLoaded && allowZoom && (
          <Animated.View
            entering={FadeIn.delay(500)}
            style={styles.zoomIndicator}
          >
            <View style={styles.zoomIcon}>
              <ZoomIn size={16} color="#FFF" />
            </View>
          </Animated.View>
        )}

        {children}
      </TouchableOpacity>

      {/* Zoom Modal */}
      <Modal
        visible={isZoomed}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsZoomed(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setIsZoomed(false)}
            activeOpacity={1}
          >
            <Animated.View
              style={styles.zoomedImageContainer}
              entering={ReanimatedZoomIn}
            >
              <Image
                source={
                  typeof imageUrl === 'string'
                    ? { uri: imageUrl }
                    : imageUrl
                }
                style={styles.zoomedImage}
                resizeMode="contain"
              />
            </Animated.View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsZoomed(false)}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
                style={styles.closeButtonGradient}
              >
                <X size={24} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  zoomIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  zoomIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomedImageContainer: {
    width: width * 0.95,
    height: height * 0.8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  zoomedImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  closeButtonGradient: {
    padding: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
