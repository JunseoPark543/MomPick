import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

// 폰은 authStorage.native.ts, 웹은 authStorage.ts 가 쓰인다
import { authStorage } from '@/lib/authStorage';

// 주소와 publishable 키는 앱에 들어가도 되는 공개용 값이다.
// 실제 값은 .env.local 에 둔다 (Git에 올라가지 않음).
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('.env.local 에 EXPO_PUBLIC_SUPABASE_URL 과 EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY 를 넣어주세요.');
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    // 페이지를 미리 만드는 단계(저장소 없음)에서는 로그인 정보를 저장하지 않는다
    persistSession: authStorage !== undefined,
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
