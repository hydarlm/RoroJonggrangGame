import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sword, Shield, Zap, Heart, X, Crown } from 'lucide-react-native';
import Animated, {
  FadeIn,
  SlideInLeft,
  SlideInRight,
  BounceIn,
} from 'react-native-reanimated';

interface BattleGameProps {
  isVisible: boolean;
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface Character {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  magic: number;
}

interface BattleAction {
  id: string;
  name: string;
  type: 'attack' | 'defend' | 'magic' | 'heal';
  icon: any;
  damage?: number;
  healing?: number;
  cost?: number;
}

const battleActions: BattleAction[] = [
  {
    id: 'sword_attack',
    name: 'Serangan Pedang',
    type: 'attack',
    icon: Sword,
    damage: 25,
  },
  { id: 'defend', name: 'Bertahan', type: 'defend', icon: Shield },
  {
    id: 'magic_bolt',
    name: 'Serangan Magis',
    type: 'magic',
    icon: Zap,
    damage: 35,
    cost: 20,
  },
  {
    id: 'heal',
    name: 'Penyembuhan',
    type: 'heal',
    icon: Heart,
    healing: 30,
    cost: 15,
  },
];

export default function BattleGame({
  isVisible,
  onComplete,
  onClose,
}: BattleGameProps) {
  const [gamePhase, setGamePhase] = useState<'intro' | 'battle' | 'result'>(
    'intro'
  );
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [round, setRound] = useState(1);
  const [playerMana, setPlayerMana] = useState(100);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isDefending, setIsDefending] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const [player, setPlayer] = useState<Character>({
    name: 'Pasukan Prambanan',
    hp: 100,
    maxHp: 100,
    attack: 20,
    defense: 15,
    magic: 25,
  });

  const [enemy, setEnemy] = useState<Character>({
    name: 'Bandung Bondowoso',
    hp: 120,
    maxHp: 120,
    attack: 30,
    defense: 20,
    magic: 35,
  });

  useEffect(() => {
    if (gamePhase === 'battle' && turn === 'enemy' && enemy.hp > 0) {
      const timer = setTimeout(() => {
        performEnemyAction();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [turn, gamePhase, enemy.hp]);

  const startBattle = () => {
    setGamePhase('battle');
    setBattleLog(['Pertempuran dimulai!']);
  };

  const performPlayerAction = (action: BattleAction) => {
    if (turn !== 'player') return;

    let newPlayerMana = playerMana;
    let newPlayer = { ...player };
    let newEnemy = { ...enemy };
    let logMessage = '';

    // Check mana cost
    if (action.cost && playerMana < action.cost) {
      Alert.alert(
        'Mana Tidak Cukup',
        `Anda membutuhkan ${action.cost} mana untuk aksi ini.`
      );
      return;
    }

    switch (action.type) {
      case 'attack':
        const attackDamage = Math.max(
          1,
          (action.damage || 0) - newEnemy.defense + Math.random() * 10
        );
        newEnemy.hp = Math.max(0, newEnemy.hp - attackDamage);
        logMessage = `${player.name} menyerang dengan ${
          action.name
        }! Damage: ${Math.round(attackDamage)}`;
        break;

      case 'defend':
        setIsDefending(true);
        logMessage = `${player.name} bersiap bertahan!`;
        break;

      case 'magic':
        if (action.cost) newPlayerMana -= action.cost;
        const magicDamage = Math.max(
          1,
          (action.damage || 0) + Math.random() * 15
        );
        newEnemy.hp = Math.max(0, newEnemy.hp - magicDamage);
        logMessage = `${player.name} menggunakan ${
          action.name
        }! Damage: ${Math.round(magicDamage)}`;
        break;

      case 'heal':
        if (action.cost) newPlayerMana -= action.cost;
        const healAmount = action.healing || 0;
        newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + healAmount);
        logMessage = `${player.name} menggunakan ${action.name}! HP pulih: ${healAmount}`;
        break;
    }

    setPlayer(newPlayer);
    setEnemy(newEnemy);
    setPlayerMana(newPlayerMana);
    setBattleLog((prev) => [...prev, logMessage]);

    if (newEnemy.hp <= 0) {
      endBattle(true);
    } else {
      setTurn('enemy');
    }
  };

  const performEnemyAction = () => {
    if (enemy.hp <= 0) return;

    const actions = ['attack', 'magic', 'heal'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    let newPlayer = { ...player };
    let newEnemy = { ...enemy };
    let logMessage = '';

    switch (randomAction) {
      case 'attack':
        const damage = Math.max(
          1,
          newEnemy.attack -
            (isDefending ? newPlayer.defense * 2 : newPlayer.defense) +
            Math.random() * 10
        );
        newPlayer.hp = Math.max(0, newPlayer.hp - damage);
        logMessage = `${enemy.name} menyerang! Damage: ${Math.round(damage)}`;
        break;

      case 'magic':
        const magicDamage = Math.max(1, newEnemy.magic + Math.random() * 15);
        newPlayer.hp = Math.max(0, newPlayer.hp - magicDamage);
        logMessage = `${
          enemy.name
        } menggunakan serangan magis! Damage: ${Math.round(magicDamage)}`;
        break;

      case 'heal':
        if (newEnemy.hp < newEnemy.maxHp * 0.5) {
          const healAmount = 25;
          newEnemy.hp = Math.min(newEnemy.maxHp, newEnemy.hp + healAmount);
          logMessage = `${enemy.name} menyembuhkan diri! HP pulih: ${healAmount}`;
        } else {
          const damage = Math.max(
            1,
            newEnemy.attack - newPlayer.defense + Math.random() * 10
          );
          newPlayer.hp = Math.max(0, newPlayer.hp - damage);
          logMessage = `${enemy.name} menyerang! Damage: ${Math.round(damage)}`;
        }
        break;
    }

    setPlayer(newPlayer);
    setEnemy(newEnemy);
    setIsDefending(false);
    setBattleLog((prev) => [...prev, logMessage]);

    // Restore some mana each turn
    setPlayerMana((prev) => Math.min(100, prev + 10));

    if (newPlayer.hp <= 0) {
      endBattle(false);
    } else {
      setTurn('player');
      setRound((prev) => prev + 1);
    }
  };

  const endBattle = (playerWon: boolean) => {
    const baseScore = playerWon ? 50 : 20;
    const hpBonus = Math.round((player.hp / player.maxHp) * 30);
    const roundBonus = Math.max(0, 20 - round);
    const finalScore = Math.min(100, baseScore + hpBonus + roundBonus);

    setTotalScore(finalScore);
    setGamePhase('result');

    const resultMessage = playerWon
      ? `${player.name} menang! Prambanan berhasil bertahan!`
      : `${enemy.name} menang! Prambanan telah ditaklukkan!`;

    setBattleLog((prev) => [...prev, resultMessage]);
  };

  const handleFinish = () => {
    onComplete(totalScore);
    resetGame();
  };

  const resetGame = () => {
    setGamePhase('intro');
    setTurn('player');
    setRound(1);
    setPlayerMana(100);
    setBattleLog([]);
    setIsDefending(false);
    setTotalScore(0);
    setPlayer({
      name: 'Pasukan Prambanan',
      hp: 100,
      maxHp: 100,
      attack: 20,
      defense: 15,
      magic: 25,
    });
    setEnemy({
      name: 'Bandung Bondowoso',
      hp: 120,
      maxHp: 120,
      attack: 30,
      defense: 20,
      magic: 35,
    });
  };

  const getHealthBarColor = (hp: number, maxHp: number) => {
    const percentage = hp / maxHp;
    if (percentage > 0.6) return '#4CAF50';
    if (percentage > 0.3) return '#FF9800';
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
            'rgba(139,69,19,0.9)',
          ]}
          style={styles.modalContent}
        >
          {gamePhase === 'intro' && (
            <Animated.View entering={FadeIn} style={styles.introContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Pertempuran Prambanan</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <X size={24} color="#FFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.introText}>
                Pasukan Bandung Bondowoso menyerang Kerajaan Prambanan! Pimpin
                pertahanan dan lindungi kerajaan dari invasi!
              </Text>

              <View style={styles.charactersPreview}>
                <View style={styles.characterCard}>
                  <Shield size={32} color="#4CAF50" />
                  <Text style={styles.characterName}>{player.name}</Text>
                  <Text style={styles.characterStats}>
                    HP: {player.hp} | ATK: {player.attack}
                  </Text>
                </View>

                <Text style={styles.vsText}>VS</Text>

                <View style={styles.characterCard}>
                  <Sword size={32} color="#F44336" />
                  <Text style={styles.characterName}>{enemy.name}</Text>
                  <Text style={styles.characterStats}>
                    HP: {enemy.hp} | ATK: {enemy.attack}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.startButton}
                onPress={startBattle}
              >
                <Text style={styles.startButtonText}>Mulai Pertempuran</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {gamePhase === 'battle' && (
            <Animated.View entering={FadeIn} style={styles.battleContainer}>
              <View style={styles.battleHeader}>
                <Text style={styles.roundText}>Round {round}</Text>
                <Text style={styles.turnText}>
                  {turn === 'player' ? 'Giliran Anda' : 'Giliran Musuh'}
                </Text>
              </View>

              <View style={styles.charactersContainer}>
                <Animated.View entering={SlideInLeft} style={styles.playerSide}>
                  <Text style={styles.characterName}>{player.name}</Text>
                  <View style={styles.healthBar}>
                    <View
                      style={[
                        styles.healthFill,
                        {
                          width: `${(player.hp / player.maxHp) * 100}%`,
                          backgroundColor: getHealthBarColor(
                            player.hp,
                            player.maxHp
                          ),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.healthText}>
                    {player.hp}/{player.maxHp}
                  </Text>

                  <View style={styles.manaBar}>
                    <View
                      style={[styles.manaFill, { width: `${playerMana}%` }]}
                    />
                  </View>
                  <Text style={styles.manaText}>Mana: {playerMana}/100</Text>
                </Animated.View>

                <Animated.View entering={SlideInRight} style={styles.enemySide}>
                  <Text style={styles.characterName}>{enemy.name}</Text>
                  <View style={styles.healthBar}>
                    <View
                      style={[
                        styles.healthFill,
                        {
                          width: `${(enemy.hp / enemy.maxHp) * 100}%`,
                          backgroundColor: getHealthBarColor(
                            enemy.hp,
                            enemy.maxHp
                          ),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.healthText}>
                    {enemy.hp}/{enemy.maxHp}
                  </Text>
                </Animated.View>
              </View>

              <View style={styles.battleLog}>
                <Text style={styles.logTitle}>Log Pertempuran:</Text>
                <View style={styles.logContent}>
                  {battleLog.slice(-3).map((log, index) => (
                    <Text key={index} style={styles.logText}>
                      {log}
                    </Text>
                  ))}
                </View>
              </View>

              {turn === 'player' && (
                <View style={styles.actionsContainer}>
                  <Text style={styles.actionsTitle}>Pilih Aksi:</Text>
                  <View style={styles.actionButtons}>
                    {battleActions.map((action) => {
                      const IconComponent = action.icon;
                      const canUse = !action.cost || playerMana >= action.cost;

                      return (
                        <TouchableOpacity
                          key={action.id}
                          style={[
                            styles.actionButton,
                            !canUse && styles.disabledAction,
                          ]}
                          onPress={() => performPlayerAction(action)}
                          disabled={!canUse}
                        >
                          <IconComponent
                            size={20}
                            color={canUse ? '#FFF' : '#666'}
                          />
                          <Text
                            style={[
                              styles.actionText,
                              !canUse && styles.disabledText,
                            ]}
                          >
                            {action.name}
                          </Text>
                          {action.cost && (
                            <Text style={styles.costText}>({action.cost})</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </Animated.View>
          )}

          {gamePhase === 'result' && (
            <Animated.View entering={BounceIn} style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Crown size={48} color="#D4AF37" />
                <Text style={styles.resultTitle}>Hasil Pertempuran</Text>
              </View>

              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{totalScore}%</Text>
                <Text style={styles.scoreLabel}>Skor Strategi</Text>
              </View>

              <Text style={styles.resultMessage}>
                {totalScore >= 80
                  ? 'Strategi brilian! Anda memimpin dengan sangat baik!'
                  : totalScore >= 60
                  ? 'Pertempuran yang baik! Kepemimpinan yang solid.'
                  : totalScore >= 40
                  ? 'Cukup baik, tapi masih bisa diperbaiki.'
                  : 'Pertempuran yang sulit. Terus berlatih!'}
              </Text>

              <View style={styles.battleSummary}>
                <Text style={styles.summaryTitle}>Ringkasan Pertempuran:</Text>
                <Text style={styles.summaryText}>Round: {round}</Text>
                <Text style={styles.summaryText}>
                  HP Tersisa: {player.hp}/{player.maxHp}
                </Text>
                <Text style={styles.summaryText}>
                  Status: {player.hp > 0 ? 'Menang' : 'Kalah'}
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
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
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
    marginBottom: 30,
  },
  charactersPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  characterCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  characterName: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#FFF',
    marginTop: 8,
    textAlign: 'center',
  },
  characterStats: {
    fontSize: 12,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    opacity: 0.8,
    marginTop: 4,
  },
  vsText: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
  },
  startButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  startButtonText: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#000',
  },
  battleContainer: {
    flex: 1,
  },
  battleHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  roundText: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
  },
  turnText: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    marginTop: 4,
  },
  charactersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  playerSide: {
    flex: 1,
    marginRight: 10,
  },
  enemySide: {
    flex: 1,
    marginLeft: 10,
  },
  healthBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
    borderRadius: 4,
  },
  healthText: {
    fontSize: 12,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    marginTop: 4,
  },
  manaBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  manaFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },
  manaText: {
    fontSize: 12,
    fontFamily: 'CrimsonText-Regular',
    color: '#2196F3',
    marginTop: 4,
  },
  battleLog: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 80,
  },
  logTitle: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  logContent: {
    flex: 1,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    marginBottom: 4,
    opacity: 0.9,
  },
  actionsContainer: {
    marginTop: 'auto',
  },
  actionsTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    padding: 12,
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  disabledAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    marginTop: 4,
    textAlign: 'center',
  },
  disabledText: {
    color: '#666',
  },
  costText: {
    fontSize: 10,
    fontFamily: 'CrimsonText-Regular',
    color: '#2196F3',
    marginTop: 2,
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
  resultMessage: {
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  battleSummary: {
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
