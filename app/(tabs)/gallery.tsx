import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageIcon, Lock, Star, X, ZoomIn } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  FadeInDown,
  ZoomIn as ReanimatedZoomIn,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string | number; // Perubahan di sini
  chapterRequired: number;
  isUnlocked: boolean;
  category: 'character' | 'scene' | 'ending' | 'concept';
}

const galleryItems: GalleryItem[] = [
  {
    id: 'roro_portrait',
    title: 'Roro Jonggrang',
    description:
      'Putri cantik Kerajaan Prambanan yang terkenal akan kecantikan dan kesombongannya.',
    imageUrl: require('../../assets/images/gallery/roro_portrait.png'),
    chapterRequired: 1,
    isUnlocked: false,
    category: 'character',
  },
  {
    id: 'bandung_portrait',
    title: 'Bandung Bondowoso',
    description:
      'Pangeran sakti mandraguna dari Kerajaan Pengging yang memiliki kekuatan magis.',
    imageUrl: require('../../assets/images/gallery/bandung_portrait.png'),
    chapterRequired: 2,
    isUnlocked: false,
    category: 'character',
  },
  {
    id: 'RajaBaka_portrait',
    title: 'Raja Baka',
    description:
      'raja raksasa dari Kerajaan Pengging yang kuat, kejam, dan ambisius.',
    imageUrl: require('../../assets/images/gallery/RajaBaka_portrait.png'),
    chapterRequired: 3,
    isUnlocked: false,
    category: 'character',
  },
  {
    id: 'prambanan_palace',
    title: 'Istana Prambanan',
    description:
      'Kerajaan yang megah dan makmur di bawah pemerintahan Raja Baka.',
    imageUrl: require('../../assets/images/gallery/prambanan_palace.png'),
    chapterRequired: 1,
    isUnlocked: false,
    category: 'scene',
  },
  {
    id: 'battle_scene',
    title: 'Pertempuran Prambanan',
    description:
      'Perang dahsyat antara pasukan Prambanan melawan Bandung Bondowoso.',
    imageUrl: require('../../assets/images/gallery/battle_scene.png'),
    chapterRequired: 2,
    isUnlocked: false,
    category: 'scene',
  },
  {
    id: 'candi_construction',
    title: 'Pembangunan Seribu Candi',
    description:
      'Malam yang menentukan nasib dengan bantuan para jin dan makhluk halus.',
    imageUrl: require('../../assets/images/gallery/candi_construction.png'),
    chapterRequired: 4,
    isUnlocked: false,
    category: 'scene',
  },
  {
    id: 'dawn_sabotage',
    title: 'Tipu Daya Fajar',
    description:
      'Roro Jonggrang menyabotase pembangunan dengan meniru suara fajar.',
    imageUrl: require('../../assets/images/gallery/dawn_sabotage.png'),
    chapterRequired: 4,
    isUnlocked: false,
    category: 'scene',
  },
  {
    id: 'classic_ending',
    title: 'Kutukan Arca',
    description:
      'Ending klasik dimana Roro Jonggrang berubah menjadi arca batu.',
    imageUrl: require('../../assets/images/gallery/classic_ending.png'),
    chapterRequired: 5,
    isUnlocked: false,
    category: 'ending',
  },
  {
    id: 'romantic_ending',
    title: 'Cinta Sejati',
    description: 'Ending romantis dimana cinta mengalahkan dendam.',
    imageUrl: require('../../assets/images/gallery/romantic_ending.png'),
    chapterRequired: 5,
    isUnlocked: false,
    category: 'ending',
  },
  {
    id: 'peaceful_ending',
    title: 'Kebijaksanaan',
    description: 'Ending damai dimana kebijaksanaan mengalahkan ego.',
    imageUrl: require('../../assets/images/gallery/peaceful_ending.png'),
    chapterRequired: 5,
    isUnlocked: false,
    category: 'ending',
  },
];

export default function GalleryScreen() {
  const [items, setItems] = useState<GalleryItem[]>(galleryItems);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadGalleryProgress();
  }, []);

  const loadGalleryProgress = async () => {
    try {
      const chapterProgress = await AsyncStorage.getItem('chapterProgress');
      if (chapterProgress) {
        const progress = JSON.parse(chapterProgress);
        const completedChapters = Object.keys(progress)
          .filter((chapterId) => progress[chapterId].isCompleted)
          .map(Number);

        setItems((prevItems) =>
          prevItems.map((item) => ({
            ...item,
            isUnlocked: completedChapters.includes(item.chapterRequired),
          }))
        );
      }
    } catch (error) {
      console.log('Error loading gallery progress:', error);
    }
  };

  const categories = [
    { id: 'all', name: 'Semua', icon: ImageIcon },
    { id: 'character', name: 'Karakter', icon: Star },
    { id: 'scene', name: 'Adegan', icon: ImageIcon },
    { id: 'ending', name: 'Ending', icon: Star },
  ];

  const filteredItems =
    selectedCategory === 'all'
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const handleItemPress = (item: GalleryItem) => {
    if (item.isUnlocked) {
      setSelectedItem(item);
      setShowModal(true);
    }
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
        <IconComponent size={20} color={isSelected ? '#000' : '#D4AF37'} />
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

  const renderGalleryItem = (item: GalleryItem, index: number) => (
    <Animated.View
      key={item.id}
      entering={FadeInDown.delay(index * 100)}
      style={styles.galleryItem}
    >
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleItemPress(item)}
        disabled={!item.isUnlocked}
      >
        <View style={styles.imageContainer}>
          {item.isUnlocked ? (
            <>
              <Image
                source={
                  typeof item.imageUrl === 'string'
                    ? { uri: item.imageUrl }
                    : item.imageUrl
                }
                style={styles.itemImage}
              />
              <View style={styles.imageOverlay}>
                <ZoomIn size={24} color="#FFF" />
              </View>
            </>
          ) : (
            <View style={styles.lockedImage}>
              <Lock size={32} color="#666" />
            </View>
          )}
        </View>

        <View style={styles.itemInfo}>
          <Text
            style={[styles.itemTitle, !item.isUnlocked && styles.lockedText]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.itemDescription,
              !item.isUnlocked && styles.lockedText,
            ]}
          >
            {item.isUnlocked
              ? item.description
              : `Selesaikan Chapter ${item.chapterRequired}`}
          </Text>
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
        <Text style={styles.headerTitle}>Galeri Seni</Text>
        <Text style={styles.headerSubtitle}>
          Koleksi ilustrasi dan karakter dari legenda Roro Jonggrang
        </Text>
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
        <View style={styles.galleryGrid}>
          {filteredItems.map(renderGalleryItem)}
        </View>
      </ScrollView>

      {/* MODAL */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setShowModal(false)}
            activeOpacity={1}
          >
            {selectedItem && (
              <Animated.View
                entering={ReanimatedZoomIn.springify()}
                style={styles.modalContent}
              >
                <Image
                  source={
                    typeof selectedItem.imageUrl === 'string'
                      ? { uri: selectedItem.imageUrl }
                      : selectedItem.imageUrl
                  }
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <View style={styles.modalInfo}>
                  <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                  <Text style={styles.modalDescription}>
                    {selectedItem.description}
                  </Text>
                </View>
              </Animated.View>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  selectedCategory: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'CrimsonText-SemiBold',
    color: '#D4AF37',
    marginLeft: 6,
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
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  galleryItem: {
    width: '48%',
    marginBottom: 20,
  },
  itemContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 6,
  },
  lockedImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#FFF',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    opacity: 0.8,
    lineHeight: 16,
  },
  lockedText: {
    opacity: 0.5,
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
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D4AF37',
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: width * 0.9,
  },
  modalInfo: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    lineHeight: 22,
    opacity: 0.9,
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
