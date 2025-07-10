import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator, // Ditambahkan untuk indikator loading
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Save, Download, Trash2, X, Calendar, WifiOff } from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase'; // Impor client Supabase

// Interface SaveData tidak berubah, ini adalah "bentuk" data di sisi aplikasi
interface SaveData {
  id: string; // Akan menggunakan UUID dari database
  chapterId: number;
  sceneIndex: number;
  timestamp: number;
  relationshipScore: number;
  choices: Record<string, string>;
  achievements: string[];
}

// Props komponen juga tidak berubah
interface SaveLoadSystemProps {
  isVisible: boolean;
  onClose: () => void;
  onLoad?: (saveData: SaveData) => void;
  currentSaveData?: Partial<SaveData>;
  mode: 'save' | 'load';
}

export default function SaveLoadSystem({
  isVisible,
  onClose,
  onLoad,
  currentSaveData,
  mode,
}: SaveLoadSystemProps) {
  // State untuk menyimpan data 6 slot
  const [saveSlots, setSaveSlots] = useState<(SaveData | null)[]>(
    Array(6).fill(null)
  );
  // State baru untuk menangani status loading saat berinteraksi dengan database
  const [isLoading, setIsLoading] = useState(false);
  // State baru untuk menangani error
  const [error, setError] = useState<string | null>(null);

  // useEffect sekarang akan memanggil fungsi untuk memuat data dari Supabase
  useEffect(() => {
    if (isVisible) {
      loadSaveSlotsFromCloud();
    }
  }, [isVisible]);

  // Fungsi untuk memuat data dari Supabase
  const loadSaveSlotsFromCloud = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Dapatkan data pengguna yang sedang login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Pengguna tidak terautentikasi.");

      // Ambil semua slot save dari database yang dimiliki pengguna ini
      const { data: loadedSaves, error: dbError } = await supabase
        .from('game_save_slots')
        .select('*')
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      // Siapkan array kosong untuk 6 slot
      const newSlots = Array(6).fill(null);
      // Pindahkan data dari database ke array slot yang sesuai
      for (const save of loadedSaves) {
        newSlots[save.slot_index] = {
          id: save.id,
          chapterId: save.chapter_id,
          sceneIndex: save.scene_index,
          timestamp: new Date(save.saved_at).getTime(),
          relationshipScore: save.relationship_score,
          choices: save.choices,
          achievements: save.achievements,
        };
      }
      setSaveSlots(newSlots);
    } catch (e: any) {
      console.error('Gagal memuat data dari cloud:', e);
      setError('Gagal memuat data. Periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk menyimpan data ke Supabase
  const saveToSlot = async (slotIndex: number) => {
    if (!currentSaveData) return;
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Pengguna tidak terautentikasi.");

      // Gunakan 'upsert' untuk INSERT (jika slot baru) atau UPDATE (jika menimpa)
      const { error: dbError } = await supabase
        .from('game_save_slots')
        .upsert({
          user_id: user.id,
          slot_index: slotIndex,
          chapter_id: currentSaveData.chapterId || 1,
          scene_index: currentSaveData.sceneIndex || 0,
          relationship_score: currentSaveData.relationshipScore || 50,
          choices: currentSaveData.choices || {},
          achievements: currentSaveData.achievements || [],
          saved_at: new Date().toISOString(),
        }, { onConflict: 'user_id, slot_index' }); // Kunci untuk upsert

      if (dbError) throw dbError;

      Alert.alert('Berhasil', 'Game berhasil disimpan di cloud!');
      onClose();
    } catch (e) {
      console.error('Gagal menyimpan game ke cloud:', e);
      Alert.alert('Error', 'Gagal menyimpan game.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk memuat game dari slot yang dipilih
  const loadFromSlot = (slotIndex: number) => {
    const saveData = saveSlots[slotIndex];
    if (saveData && onLoad) {
      Alert.alert(
        'Muat Game',
        `Anda yakin ingin memuat progres dari Chapter ${saveData.chapterId}? Progres saat ini akan hilang.`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Lanjutkan',
            style: 'default',
            onPress: () => {
              onLoad(saveData);
              onClose();
            },
          },
        ]
      );
    }
  };

  // Fungsi untuk menghapus data dari Supabase
  const deleteSlot = async (slotIndex: number) => {
    Alert.alert('Hapus Save', 'Apakah Anda yakin ingin menghapus save ini dari cloud?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          setIsLoading(true);
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Pengguna tidak terautentikasi.");
            
            const { error: dbError } = await supabase
              .from('game_save_slots')
              .delete()
              .match({ user_id: user.id, slot_index: slotIndex });
            
            if (dbError) throw dbError;

            // Muat ulang data dari server untuk menyegarkan UI
            await loadSaveSlotsFromCloud();
          } catch (e) {
            console.error('Gagal menghapus save dari cloud:', e);
            Alert.alert('Error', 'Gagal menghapus save.');
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  // Fungsi utilitas untuk format tanggal, tidak berubah
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // Render utama
  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <Animated.View entering={SlideInDown.springify()} style={styles.saveLoadContainer}>
          <LinearGradient
            colors={['rgba(26,26,26,0.98)', 'rgba(45,27,78,0.98)', 'rgba(26,26,26,0.98)']}
            style={styles.saveLoadContent}
          >
            <View style={styles.header}>
              <Text style={styles.title}>{mode === 'save' ? 'Simpan Game' : 'Muat Game'}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose} disabled={isLoading}>
                <X size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Tampilan UI saat loading, error, atau menampilkan data */}
            {isLoading ? (
              <View style={styles.feedbackContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
                <Text style={styles.feedbackText}>Menghubungi server...</Text>
              </View>
            ) : error ? (
              <View style={styles.feedbackContainer}>
                <WifiOff size={40} color="#FF6B6B" />
                <Text style={styles.feedbackText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadSaveSlotsFromCloud}>
                    <Text style={styles.retryButtonText}>Coba Lagi</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={styles.slotsContainer} showsVerticalScrollIndicator={false}>
                {saveSlots.map((saveData, index) => (
                  <Animated.View key={index} entering={FadeIn.delay(index * 100)} style={styles.saveSlot}>
                    {saveData ? (
                      <TouchableOpacity
                        style={styles.saveSlotContent}
                        onPress={() => mode === 'load' ? loadFromSlot(index) : saveToSlot(index)}
                        disabled={isLoading}
                      >
                        <View style={styles.saveInfo}>
                          <Text style={styles.saveTitle}>Chapter {saveData.chapterId} - Scene {saveData.sceneIndex + 1}</Text>
                          <View style={styles.saveDetails}>
                            <Calendar size={12} color="#D4AF37" />
                            <Text style={styles.saveDate}>{formatDate(saveData.timestamp)}</Text>
                          </View>
                          <Text style={styles.saveProgress}>
                            Hubungan: {saveData.relationshipScore}% | Pencapaian: {saveData.achievements.length}
                          </Text>
                        </View>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteSlot(index)} disabled={isLoading}>
                          <Trash2 size={16} color="#FF6B6B" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.emptySaveSlot}
                        onPress={() => (mode === 'save' ? saveToSlot(index) : undefined)}
                        disabled={mode === 'load' || isLoading}
                      >
                        <View style={styles.emptySlotIcon}>
                          {mode === 'save' ? <Save size={24} color="#666" /> : <Download size={24} color="#666" />}
                        </View>
                        <Text style={styles.emptySlotText}>{mode === 'save' ? 'Slot Kosong' : 'Tidak Ada Save'}</Text>
                      </TouchableOpacity>
                    )}
                  </Animated.View>
                ))}
              </ScrollView>
            )}
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Styles tidak banyak berubah, hanya penambahan untuk feedback
const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  saveLoadContainer: { width: '90%', maxHeight: '80%' },
  saveLoadContent: { borderRadius: 20, padding: 24, borderWidth: 2, borderColor: '#D4AF37' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontFamily: 'PlayfairDisplay-Bold', color: '#D4AF37' },
  closeButton: { padding: 8 },
  slotsContainer: { maxHeight: 400 },
  saveSlot: { marginBottom: 12 },
  saveSlotContent: { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', padding: 16, flexDirection: 'row', alignItems: 'center' },
  saveInfo: { flex: 1 },
  saveTitle: { fontSize: 16, fontFamily: 'PlayfairDisplay-Bold', color: '#FFF', marginBottom: 4 },
  saveDetails: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  saveDate: { fontSize: 12, fontFamily: 'CrimsonText-Regular', color: '#D4AF37', marginLeft: 4 },
  saveProgress: { fontSize: 12, fontFamily: 'CrimsonText-Regular', color: '#FFF', opacity: 0.8 },
  deleteButton: { padding: 8, borderRadius: 8, backgroundColor: 'rgba(255, 107, 107, 0.2)' },
  emptySaveSlot: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderStyle: 'dashed', padding: 24, alignItems: 'center', justifyContent: 'center' },
  emptySlotIcon: { marginBottom: 8 },
  emptySlotText: { fontSize: 14, fontFamily: 'CrimsonText-Regular', color: '#666' },
  // Style baru untuk feedback
  feedbackContainer: {
    height: 400, // Samakan tinggi dengan ScrollView
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    opacity: 0.8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000',
    fontFamily: 'PlayfairDisplay-Bold',
  }
});
