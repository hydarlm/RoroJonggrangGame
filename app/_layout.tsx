import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  CrimsonText_400Regular,
  CrimsonText_600SemiBold,
} from '@expo-google-fonts/crimson-text';
import * as SplashScreen from 'expo-splash-screen';

// Impor semua Provider untuk membungkus aplikasi
import { SessionProvider } from '../contexts/SessionProvider';
import { SoundProvider } from '../components/SoundManager';
import { ProgressProvider } from '../components/ProgressTracker';

// Mencegah splash screen hilang secara otomatis sebelum font dimuat
SplashScreen.preventAutoHideAsync();

/**
 * RootLayout adalah komponen kerangka utama aplikasi.
 * Ia bertanggung jawab untuk:
 * 1. Memuat aset penting seperti font.
 * 2. Menampilkan splash screen saat loading.
 * 3. Mengatur Provider global (Session, Sound, Progress).
 * 4. Mendefinisikan navigator utama (Stack) dan rute-rute level atas.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
    'CrimsonText-Regular': CrimsonText_400Regular,
    'CrimsonText-SemiBold': CrimsonText_600SemiBold,
  });

  // Sembunyikan splash screen setelah font selesai dimuat atau jika ada error
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Jangan render apapun sampai font siap untuk mencegah layout shift
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    // Provider disusun dari yang paling global (Session) ke yang lebih spesifik.
    // Semua komponen di dalam aplikasi akan memiliki akses ke context ini.
    <SessionProvider>
      <ProgressProvider>
        <SoundProvider>
          {/* Stack Navigator sebagai navigator utama. */}
          {/* headerShown: false akan menyembunyikan header default di semua layar. */}
          <Stack screenOptions={{ headerShown: false }}>
            
            {/* Mendeklarasikan rute-rute utama di level atas (root) */}

            {/* Rute untuk gerbang login utama */}
            <Stack.Screen name="index" />
            
            {/* Rute untuk grup layout (tabs) yang berisi menu utama, pencapaian, dll. */}
            <Stack.Screen name="(tabs)" />

            {/* REVISI: Mendaftarkan rute chapter secara eksplisit */}
            {/* Ini memungkinkan kita memberikan opsi presentasi khusus. */}
            {/* 'modal' akan membuat layar chapter muncul dari bawah, cocok untuk masuk ke level baru. */}
            <Stack.Screen 
              name="chapter/[id]" 
              options={{ presentation: 'modal' }} 
            />

            {/* REVISI: Mendaftarkan rute story intro */}
            <Stack.Screen name="story" />

            {/* Rute untuk halaman "404 Not Found" */}
            <Stack.Screen name="not-found" />
            
          </Stack>
          <StatusBar style="light" />
        </SoundProvider>
      </ProgressProvider>
    </SessionProvider>
  );
}
