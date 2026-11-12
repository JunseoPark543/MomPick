import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

// 주소와 publishable 키는 앱에 들어가도 되는 공개용 값이다.
// 실제 값은 .env.local 에 둔다 (Git에 올라가지 않음).
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('.env.local 에 EXPO_PUBLIC_SUPABASE_URL 과 EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY 를 넣어주세요.');
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// 앱이 화면에 떠 있을 때만 로그인 토큰을 자동 갱신한다
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
