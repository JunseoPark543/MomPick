import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from '@/lib/auth';

// 로그인 상태를 확인할 때까지 시작 화면(스플래시)을 유지한다
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { session, isLoading } = useAuth();

  if (!isLoading) {
    SplashScreen.hide();
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 로그인한 사람만 */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      {/* 로그인 안 한 사람만 */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
