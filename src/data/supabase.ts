import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!url || !key) {
  throw new Error(
    'Supabase não configurado: copie .env.example para .env e preencha EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_KEY (veja o README).',
  );
}

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

export const PLACE_PHOTOS_BUCKET = 'place-photos';

export function photoUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return supabase.storage.from(PLACE_PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl;
}
