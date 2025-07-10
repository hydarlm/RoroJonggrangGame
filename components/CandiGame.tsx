import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Hammer, Star, X, Zap } from 'lucide-react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  BounceIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface CandiGameProps {
  isVisible: boolean;
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface CandiPiece {
  id: string;
  type: 'base' | 'pillar' | 'roof' | 'decoration';
  name: string;
  points: number;
  buildTime: number;
  color: string;
}

const candiPieces: CandiPiece[] = [
  {
    id: 'stone_base',
    name: 'Pondasi Batu',
    type: 'base',
    points: 10,
    buildTime: 2,
    color: '#8B7355',
  },
  {
    id: 'marble_base',
    name: 'Pondasi Marmer',
    type: 'base',
    points: 15,
    buildTime: 3,
    color: '#F5F5DC',
  },
  {
    id: 'simple_pillar',
    name: 'Pilar Sederhana',
    type: 'pillar',
    points: 8,
    buildTime: 1.5,
    color: '#A0522D',
  },
  {
    id: 'carved_pillar',
    name: 'Pilar Ukiran',
    type: 'pillar',
    points: 12,
    buildTime: 2.5,
    color: '#D2691E',
  },
  {
    id: 'basic_roof',
    name: 'Atap Dasar',
    type: 'roof',
    points: 6,
    buildTime: 1,
    color: '#8B4513',
  },
  {
    id: 'ornate_roof',
    name: 'Atap Ornamen',
    type: 'roof',
    points: 10,
    buildTime: 2,
    color: '#CD853F',
  },
  {
    id: 'simple_carving',
    name: 'Ukiran Sederhana',
    type: 'decoration',
    points: 5,
    buildTime: 1,
    color: '#DEB887',
  },
  {
    id: 'detailed_carving',
    name: 'Ukiran Detail',
    type: 'decoration',
    points: 8,
    buildTime: 1.5,
    color: '#F4A460',
  },
];

export default function CandiGame({
  isVisible,
  onComplete,
  onClose,
}: CandiGameProps) {
  const [gamePhase, setGamePhase] = useState<'intro' | 'building' | 'result'>(
    'intro'
  );
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
  const [candiCount, setCandiCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);
  const [currentBuild, setCurrentBuild] = useState<CandiPiece | null>(null);
  const [buildProgress, setBuildProgress] = useState(0);
  const [magicPower, setMagicPower] = useState(100);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  const progressValue = useSharedValue(0);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value}%`,
    };
  });

  useEffect(() => {
    if (gamePhase === 'building' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gamePhase === 'building') {
      endGame();
    }
  }, [timeLeft, gamePhase]);

  useEffect(() => {
    if (isBuilding && currentBuild) {
      const buildTimer = setInterval(() => {
        setBuildProgress((prev) => {
          const newProgress = prev + 100 / (currentBuild.buildTime * 10);
          progressValue.value = withTiming(newProgress, { duration: 100 });

          if (newProgress >= 100) {
            completeBuild();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(buildTimer);
    }
  }, [isBuilding, currentBuild]);

  const startGame = () => {
    setGamePhase('building');
    setTimeLeft(60);
    setCandiCount(0);
    setTotalScore(0);
    setCombo(0);
    setMaxCombo(0);
    setMagicPower(100);
  };

  const startBuilding = (piece: CandiPiece) => {
    if (isBuilding || magicPower < 10) return;

    setIsBuilding(true);
    setCurrentBuild(piece);
    setBuildProgress(0);
    progressValue.value = 0;
    setMagicPower((prev) => Math.max(0, prev - 10));
  };

  const completeBuild = () => {
    if (!currentBuild) return;

    const comboMultiplier = Math.min(2, 1 + combo * 0.1);
    const points = Math.round(currentBuild.points * comboMultiplier);

    setCandiCount((prev) => prev + 1);
    setTotalScore((prev) => prev + points);
    setCombo((prev) => {
      const newCombo = prev + 1;
      setMaxCombo((current) => Math.max(current, newCombo));
      return newCombo;
    });

    // Restore some magic power
    setMagicPower((prev) => Math.min(100, prev + 5));

    setIsBuilding(false);
    setCurrentBuild(null);
    setBuildProgress(0);
    progressValue.value = 0;
  };

  const useMagicBoost = () => {
    if (magicPower < 30 || !isBuilding) return;

    setMagicPower((prev) => prev - 30);
    setBuildProgress((prev) => Math.min(100, prev + 50));
    progressValue.value = withTiming(Math.min(100, buildProgress + 50), {
      duration: 300,
    });
  };

  const endGame = () => {
    const timeBonus = Math.max(0, timeLeft * 2);
    const comboBonus = maxCombo * 5;
    const finalScore = Math.min(
      100,
      Math.round(((totalScore + timeBonus + comboBonus) / 500) * 100)
    );

    setTotalScore(finalScore);
    setGamePhase('result');
  };

  const handleFinish = () => {
    onComplete(totalScore);
    resetGame();
  };

  const resetGame = () => {
    setGamePhase('intro');
    setTimeLeft(60);
    setCandiCount(0);
    setTotalScore(0);
    setIsBuilding(false);
    setCurrentBuild(null);
    setBuildProgress(0);
    setMagicPower(100);
    setCombo(0);
    setMaxCombo(0);
    progressValue.value = 0;
  };

  const getTimeColor = () => {
    if (timeLeft > 40) return '#4CAF50';
    if (timeLeft > 20) return '#FF9800';
    return '#F44336';
  };

  const getMagicColor = () => {
    if (magicPower > 60) return '#2196F3';
    if (magicPower > 30) return '#FF9800';
    return '#F44336';
  };

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
          {gamePhase === 'intro' && (
            <Animated.View entering={FadeIn} style={styles.introContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Pembangunan Seribu Candi</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <X size={24} color="#FFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.introText}>
                Bantu Bandung Bondowoso membangun candi dengan kekuatan magis!
                Pilih komponen candi dan bangun secepat mungkin sebelum waktu
                habis.
              </Text>

              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Cara Bermain:</Text>
                <Text style={styles.instructionText}>
                  • Pilih komponen candi untuk membangun
                </Text>
                <Text style={styles.instructionText}>
                  • Setiap komponen membutuhkan waktu dan mana
                </Text>
                <Text style={styles.instructionText}>
                  • Bangun combo untuk bonus poin
                </Text>
                <Text style={styles.instructionText}>
                  • Gunakan magic boost untuk mempercepat
                </Text>
              </View>

              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Hammer size={20} color="#000" />
                <Text style={styles.startButtonText}>Mulai Membangun</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {gamePhase === 'building' && (
            <Animated.View entering={FadeIn} style={styles.gameContainer}>
              <View style={styles.gameHeader}>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Clock size={16} color={getTimeColor()} />
                    <Text style={[styles.statText, { color: getTimeColor() }]}>
                      {timeLeft}s
                    </Text>
                  </View>

                  <View style={styles.statItem}>
                    <Star size={16} color="#D4AF37" />
                    <Text style={styles.statText}>{candiCount} Candi</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Zap size={16} color={getMagicColor()} />
                    <Text style={[styles.statText, { color: getMagicColor() }]}>
                      {magicPower}%
                    </Text>
                  </View>
                </View>

                {combo > 0 && (
                  <Animated.View
                    entering={BounceIn}
                    style={styles.comboIndicator}
                  >
                    <Text style={styles.comboText}>Combo x{combo}</Text>
                  </Animated.View>
                )}
              </View>

              {isBuilding && currentBuild && (
                <Animated.View
                  entering={SlideInDown}
                  style={styles.buildingProgress}
                >
                  <Text style={styles.buildingText}>
                    Membangun: {currentBuild.name}
                  </Text>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[styles.progressFill, progressStyle]}
                    />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.boostButton,
                      magicPower < 30 && styles.disabledButton,
                    ]}
                    onPress={useMagicBoost}
                    disabled={magicPower < 30}
                  >
                    <Zap size={16} color={magicPower >= 30 ? '#FFF' : '#666'} />
                    <Text
                      style={[
                        styles.boostText,
                        magicPower < 30 && styles.disabledText,
                      ]}
                    >
                      Magic Boost (-30)
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              <View style={styles.piecesContainer}>
                <Text style={styles.piecesTitle}>Pilih Komponen:</Text>
                <View style={styles.piecesGrid}>
                  {candiPieces.map((piece) => (
                    <TouchableOpacity
                      key={piece.id}
                      style={[
                        styles.pieceButton,
                        { borderColor: piece.color },
                        (isBuilding || magicPower < 10) && styles.disabledPiece,
                      ]}
                      onPress={() => startBuilding(piece)}
                      disabled={isBuilding || magicPower < 10}
                    >
                      <View
                        style={[
                          styles.pieceIcon,
                          { backgroundColor: piece.color + '30' },
                        ]}
                      >
                        <Hammer size={16} color={piece.color} />
                      </View>
                      <Text style={styles.pieceName}>{piece.name}</Text>
                      <Text style={styles.pieceStats}>
                        +{piece.points} | {piece.buildTime}s
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {gamePhase === 'result' && (
            <Animated.View entering={BounceIn} style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Star size={48} color="#D4AF37" />
                <Text style={styles.resultTitle}>Pembangunan Selesai!</Text>
              </View>

              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{totalScore}%</Text>
                <Text style={styles.scoreLabel}>Efisiensi Pembangunan</Text>
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
                {totalScore >= 80
                  ? 'Luar biasa! Anda membangun dengan sangat efisien!'
                  : totalScore >= 60
                  ? 'Bagus! Pembangunan berjalan dengan baik.'
                  : totalScore >= 40
                  ? 'Cukup baik, tapi masih bisa lebih cepat.'
                  : 'Pembangunan agak lambat. Terus berlatih!'}
              </Text>

              <View style={styles.buildingSummary}>
                <Text style={styles.summaryTitle}>Ringkasan Pembangunan:</Text>
                <Text style={styles.summaryText}>
                  Candi Dibangun: {candiCount}
                </Text>
                <Text style={styles.summaryText}>
                  Combo Maksimal: {maxCombo}
                </Text>
                <Text style={styles.summaryText}>
                  Status:{' '}
                  {candiCount >= 15 ? 'Target Tercapai!' : 'Perlu Lebih Cepat'}
                </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  introContainer: {
    alignItems: 'center',
  },
  introText: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  instructionsContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    marginBottom: 4,
    opacity: 0.9,
  },
  startButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#000',
    marginLeft: 8,
  },
  gameContainer: {
    flex: 1,
  },
  gameHeader: {
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    fontFamily: 'CrimsonText-SemiBold',
    color: '#FFF',
    marginLeft: 4,
  },
  comboIndicator: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 8,
    padding: 8,
    alignSelf: 'center',
    marginTop: 8,
  },
  comboText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
  },
  buildingProgress: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  buildingText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 4,
  },
  boostButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#666',
  },
  boostText: {
    fontSize: 14,
    fontFamily: 'CrimsonText-SemiBold',
    color: '#FFF',
    marginLeft: 6,
  },
  disabledText: {
    color: '#666',
  },
  piecesContainer: {
    flex: 1,
  },
  piecesTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginBottom: 12,
  },
  piecesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pieceButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  disabledPiece: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: '#666',
    opacity: 0.5,
  },
  pieceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  pieceName: {
    fontSize: 12,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  pieceStats: {
    fontSize: 10,
    fontFamily: 'CrimsonText-Regular',
    color: '#D4AF37',
    textAlign: 'center',
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginTop: 12,
    textAlign: 'center',
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
  buildingSummary: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    marginBottom: 4,
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
