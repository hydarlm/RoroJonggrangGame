import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native'; 

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://oqzhxgvthozdybkybgdl.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xemh4Z3Z0aG96ZHlia3liZ2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzE5ODksImV4cCI6MjA2NjgwNzk4OX0.DAgbsfTTDii_2sgefGB3PzbqU42vtP-Vzcpk1BfsVxQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web', 
  },
});
