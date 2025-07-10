import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shirt, Crown, Gem, Star, X } from 'lucide-react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  BounceIn,
} from 'react-native-reanimated';

interface DressUpGameProps {
  isVisible: boolean;
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface ClothingItem {
  id: string;
  name: string;
  type: 'dress' | 'jewelry' | 'crown' | 'shoes';
  icon: any;
  color: string;
  points: number;
}

const clothingItems: ClothingItem[] = [
  {
    id: 'royal_dress',
    name: 'Gaun Kerajaan',
    type: 'dress',
    icon: Shirt,
    color: '#D4AF37',
    points: 20,
  },
  {
    id: 'simple_dress',
    name: 'Gaun Sederhana',
    type: 'dress',
    icon: Shirt,
    color: '#8B4513',
    points: 10,
  },
  {
    id: 'elegant_dress',
    name: 'Gaun Elegan',
    type: 'dress',
    icon: Shirt,
    color: '#4B0082',
    points: 15,
  },

  {
    id: 'golden_crown',
    name: 'Mahkota Emas',
    type: 'crown',
    icon: Crown,
    color: '#D4AF37',
    points: 20,
  },
  {
    id: 'silver_crown',
    name: 'Mahkota Perak',
    type: 'crown',
    icon: Crown,
    color: '#C0C0C0',
    points: 15,
  },
  {
    id: 'flower_crown',
    name: 'Mahkota Bunga',
    type: 'crown',
    icon: Crown,
    color: '#FF69B4',
    points: 10,
  },

  {
    id: 'diamond_necklace',
    name: 'Kalung Berlian',
    type: 'jewelry',
    icon: Gem,
    color: '#E0E0E0',
    points: 20,
  },
  {
    id: 'pearl_necklace',
    name: 'Kalung Mutiara',
    type: 'jewelry',
    icon: Gem,
    color: '#F5F5DC',
    points: 15,
  },
  {
    id: 'gold_necklace',
    name: 'Kalung Emas',
    type: 'jewelry',
    icon: Gem,
    color: '#D4AF37',
    points: 10,
  },
];

export default function DressUpGame({
  isVisible,
  onComplete,
  onClose,
}: DressUpGameProps) {
  const [selectedItems, setSelectedItems] = useState<
    Record<string, ClothingItem>
  >({});
  const [gamePhase, setGamePhase] = useState<'playing' | 'result'>('playing');
  const [totalScore, setTotalScore] = useState(0);

  const handleItemSelect = (item: ClothingItem) => {
    setSelectedItems((prev) => ({
      ...prev,
      [item.type]: item,
    }));
  };

  const handleComplete = () => {
    const score = Object.values(selectedItems).reduce(
      (sum, item) => sum + item.points,
      0
    );
    const maxScore = 80; // Maximum possible score
    const normalizedScore = Math.round((score / maxScore) * 100);

    setTotalScore(normalizedScore);
    setGamePhase('result');
  };

  const handleFinish = () => {
    onComplete(totalScore);
    resetGame();
  };

  const resetGame = () => {
    setSelectedItems({});
    setGamePhase('playing');
    setTotalScore(0);
  };

  const getItemsByType = (type: string) => {
    return clothingItems.filter((item) => item.type === type);
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Sempurna! Roro Jonggrang terlihat sangat anggun!';
    if (score >= 60)
      return 'Bagus! Penampilan yang elegan untuk seorang putri.';
    if (score >= 40) return 'Cukup baik, tapi masih bisa lebih cantik lagi.';
    return 'Hmm, mungkin perlu kombinasi yang lebih baik.';
  };

  const renderClothingCategory = (type: string, title: string) => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.itemsScroll}
      >
        {getItemsByType(type).map((item) => {
          const IconComponent = item.icon;
          const isSelected = selectedItems[type]?.id === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.clothingItem,
                isSelected && styles.selectedItem,
                { borderColor: item.color },
              ]}
              onPress={() => handleItemSelect(item)}
            >
              <View
                style={[
                  styles.itemIcon,
                  { backgroundColor: item.color + '20' },
                ]}
              >
                <IconComponent size={24} color={item.color} />
              </View>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPoints}>+{item.points}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.9)',
            'rgba(26,26,26,0.95)',
            'rgba(75,0,130,0.9)',
          ]}
          style={styles.modalContent}
        >
          {gamePhase === 'playing' ? (
            <Animated.View entering={FadeIn} style={styles.gameContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Dandani Roro Jonggrang</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <X size={24} color="#FFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.instruction}>
                Pilih pakaian dan aksesoris yang tepat untuk Roro Jonggrang
              </Text>

              <ScrollView style={styles.categoriesContainer}>
                {renderClothingCategory('dress', 'Gaun')}
                {renderClothingCategory('crown', 'Mahkota')}
                {renderClothingCategory('jewelry', 'Perhiasan')}
              </ScrollView>

              <View style={styles.selectedPreview}>
                <Text style={styles.previewTitle}>Pilihan Saat Ini:</Text>
                <View style={styles.selectedItems}>
                  {Object.entries(selectedItems).map(([type, item]) => {
                    const IconComponent = item.icon;
                    return (
                      <View key={type} style={styles.selectedItemPreview}>
                        <IconComponent size={20} color={item.color} />
                        <Text style={styles.selectedItemName}>{item.name}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.completeButton,
                  Object.keys(selectedItems).length < 3 &&
                    styles.disabledButton,
                ]}
                onPress={handleComplete}
                disabled={Object.keys(selectedItems).length < 3}
              >
                <Text style={styles.completeButtonText}>Selesai</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View entering={BounceIn} style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Star size={48} color="#D4AF37" />
                <Text style={styles.resultTitle}>Hasil Dandanan</Text>
              </View>

              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{totalScore}%</Text>
                <Text style={styles.scoreLabel}>Skor Kecantikan</Text>
              </View>

              <View style={styles.starsContainer}>
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    size={32}
                    color={totalScore >= star * 33 ? '#D4AF37' : '#666'}
                    fill={totalScore >= star * 33 ? '#D4AF37' : 'transparent'}
                  />
                ))}
              </View>

              <Text style={styles.resultMessage}>
                {getScoreMessage(totalScore)}
              </Text>

              <View style={styles.finalOutfit}>
                <Text style={styles.outfitTitle}>Penampilan Final:</Text>
                {Object.values(selectedItems).map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <View key={item.id} style={styles.finalItem}>
                      <IconComponent size={16} color={item.color} />
                      <Text style={styles.finalItemName}>{item.name}</Text>
                      <Text style={styles.finalItemPoints}>+{item.points}</Text>
                    </View>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.finishButton}
                onPress={handleFinish}
              >
                <Text style={styles.finishButtonText}>Lanjutkan Cerita</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '95%',
    maxHeight: '90%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  gameContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
  },
  closeButton: {
    padding: 8,
  },
  instruction: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  categoriesContainer: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginBottom: 12,
  },
  itemsScroll: {
    flexDirection: 'row',
  },
  clothingItem: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  selectedItem: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    borderColor: '#D4AF37',
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 12,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  itemPoints: {
    fontSize: 12,
    fontFamily: 'CrimsonText-SemiBold',
    color: '#D4AF37',
  },
  selectedPreview: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  selectedItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedItemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedItemName: {
    fontSize: 12,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    marginLeft: 6,
  },
  completeButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  completeButtonText: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#000',
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginTop: 12,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreText: {
    fontSize: 48,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
  },
  scoreLabel: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    opacity: 0.8,
    marginTop: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resultMessage: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  finalOutfit: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  outfitTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginBottom: 12,
    textAlign: 'center',
  },
  finalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  finalItemName: {
    fontSize: 14,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    flex: 1,
    marginLeft: 12,
  },
  finalItemPoints: {
    fontSize: 14,
    fontFamily: 'CrimsonText-SemiBold',
    color: '#D4AF37',
  },
  finishButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#000',
  },
});
