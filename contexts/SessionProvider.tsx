import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';

type SessionContextType = {
  session: Session | null;
  isLoading: boolean;
  logout: () => Promise<void>; // Tambahan fungsi logout
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  isLoading: true,
  logout: async () => {}, // Default dummy
});

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session ?? null);
      setIsLoading(false);
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fungsi logout lengkap
  const logout = async () => {
    try {
      await supabase.auth.signOut();        // Supabase logout
      await AsyncStorage.clear();           // Bersihkan progres lokal
      setSession(null);                     // Reset context
    } catch (error) {
      console.error('Logout gagal:', error);
    }
  };

  const value: SessionContextType = {
    session,
    isLoading,
    logout,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

// Hook untuk menggunakan session di mana saja
export const useSession = () => useContext(SessionContext);
