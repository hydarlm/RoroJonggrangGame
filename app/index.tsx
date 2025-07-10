import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { LinearGradient } from 'expo-linear-gradient';
import { LogIn, User, Play, LogOut, Save } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const ActionButton: React.FC<{ icon: React.ReactNode; text: string; onPress: () => void; primary?: boolean; }> = ({ icon, text, onPress, primary = false }) => (
  <Animated.View entering={FadeInDown.duration(600)}>
    <TouchableOpacity style={primary ? styles.primaryButton : styles.secondaryButton} onPress={onPress}>
      {icon}
      <Text style={primary ? styles.primaryButtonText : styles.secondaryButtonText}>{text}</Text>
    </TouchableOpacity>
  </Animated.View>
);

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [guestProgressExists, setGuestProgressExists] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (!session) {
        try {
          const guestSaves = await AsyncStorage.getItem('gameSaves');
          setGuestProgressExists(guestSaves !== null && JSON.parse(guestSaves).some((s: any) => s !== null));
        } catch {
          setGuestProgressExists(false);
        }
      }

      setIsLoading(false);
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === 'SIGNED_IN') {
        setSession(session);
      } else if (_event === 'SIGNED_OUT') {
        setSession(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const processMigration = async () => {
      if (session && !isMigrating) {
        const migrationDataRaw = await AsyncStorage.getItem('migration-in-progress');
        if (migrationDataRaw) {
          setIsMigrating(true);
          try {
            const guestSavesToMigrate = JSON.parse(migrationDataRaw);
            const savesForSupabase = guestSavesToMigrate
              .map((save: any, index: number) => {
                if (!save) return null;
                return {
                  user_id: session.user.id,
                  slot_index: index,
                  chapter_id: save.chapterId,
                  scene_index: save.sceneIndex,
                  relationship_score: save.relationshipScore,
                  choices: save.choices,
                  achievements: save.achievements,
                  saved_at: new Date(save.timestamp).toISOString(),
                };
              })
              .filter((s: any) => s !== null);

            const { error } = await supabase
              .from('game_save_slots')
              .upsert(savesForSupabase, { onConflict: 'user_id, slot_index' });

            if (error) throw error;

            await AsyncStorage.multiRemove(['gameSaves', 'migration-in-progress']);
            Alert.alert("Sukses!", "Progres Anda telah berhasil ditautkan ke akun Google Anda.");
          } catch (e) {
            console.error("Gagal memindahkan data ke cloud:", e);
            Alert.alert("Error", "Gagal memindahkan data. Progres Anda masih aman di perangkat ini.");
          } finally {
            setIsMigrating(false);
          }
        }
      }
    };

    processMigration();
  }, [session, isMigrating]);

  const handleNavigateToGame = useCallback(() => {
    router.replace('../home');
  }, [router]);

  const handleGoogleLogin = useCallback(async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  }, []);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsLoading(false);
  }, []);

  const handleMigrateProgress = useCallback(() => {
    Alert.alert(
      "Simpan Progres ke Cloud",
      "Proses ini akan menautkan progres tamu Anda ke Akun Google. Progres lokal akan dipindahkan ke cloud dan dihapus dari perangkat ini. Lanjutkan?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Lanjutkan & Login",
          onPress: async () => {
            setIsLoading(true);
            try {
              const guestSavesRaw = await AsyncStorage.getItem('gameSaves');
              if (!guestSavesRaw) throw new Error("Data tamu tidak ditemukan.");
              await AsyncStorage.setItem('migration-in-progress', guestSavesRaw);
              const { error: authError } = await supabase.auth.signInWithOAuth({ provider: 'google' });
              if (authError) throw authError;
            } catch (error) {
              console.error("Gagal memulai migrasi:", error);
              Alert.alert("Error", "Gagal memulai proses penyimpanan ke cloud.");
              setIsLoading(false);
            }
          }
        }
      ]
    );
  }, []);

  if (isLoading || isMigrating) {
    return (
      <ImageBackground source={require('../assets/images/bghome.png')} style={styles.background}>
        <View style={styles.feedbackContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.feedbackText}>
            {isMigrating ? "Menautkan progres ke akun Anda..." : "Memeriksa sesi..."}
          </Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../assets/images/bghome.png')} style={styles.background}>
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(75,0,130,0.8)', 'rgba(0,0,0,0.9)']}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <Animated.View entering={FadeInUp.duration(800)} style={styles.titleContainer}>
            <Text style={styles.title}>Roro Jonggrang</Text>
            <Text style={styles.subtitle}>Legenda Candi Prambanan</Text>
          </Animated.View>

          <View style={styles.buttonContainer}>
            {session ? (
              <>
                <Text style={styles.welcomeText}>Selamat datang, {session.user.email}!</Text>
                <ActionButton icon={<Play size={20} color="#000" />} text="Lanjutkan" onPress={handleNavigateToGame} primary />
                <ActionButton icon={<LogOut size={18} color="#D4AF37" />} text="Keluar" onPress={handleLogout} />
              </>
            ) : guestProgressExists ? (
              <>
                <Text style={styles.welcomeText}>Anda memiliki progres yang belum disimpan.</Text>
                <ActionButton icon={<Save size={20} color="#000" />} text="Simpan Progres dengan Google" onPress={handleMigrateProgress} primary />
                <ActionButton icon={<User size={18} color="#D4AF37" />} text="Lanjutkan sebagai Tamu" onPress={handleNavigateToGame} />
              </>
            ) : (
              <>
                <Text style={styles.welcomeText}>Mulai Petualangan Anda</Text>
                <ActionButton icon={<LogIn size={20} color="#000" />} text="Login dengan Google" onPress={handleGoogleLogin} primary />
                <ActionButton icon={<User size={18} color="#D4AF37" />} text="Main sebagai Tamu" onPress={handleNavigateToGame} />
              </>
            )}
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

// Styles tetap sama seperti sebelumnya
const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1 },
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
    fontFamily: 'CrimsonText-Regular',
  },
  titleContainer: {
    alignItems: 'center',
    position: 'absolute',
    top: '20%',
    width: '90%',
  },
  title: {
    fontSize: 48,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#D4AF37',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    opacity: 0.9,
    marginTop: 8,
  },
  buttonContainer: {
    width: '90%',
    maxWidth: 400,
    marginTop: '20%',
  },
  welcomeText: {
    fontSize: 18,
    fontFamily: 'CrimsonText-Regular',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Bold',
    marginLeft: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  secondaryButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontFamily: 'CrimsonText-SemiBold',
    marginLeft: 12,
  },
});
