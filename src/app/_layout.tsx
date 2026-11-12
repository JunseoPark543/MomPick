import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ProfileProvider, useProfile } from '@/lib/profile';

// 로그인 상태를 확인할 때까지 시작 화면(스플래시)을 유지한다
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </ProfileProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { session, isLoading: authLoading } = useAuth();
  const { isOnboarded, isLoading: profileLoading } = useProfile();

  if (!authLoading && !profileLoading) {
    SplashScreen.hide();
  }

  const loggedIn = !!session;

  return (
    <View style={styles.flex}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 시작하기까지 마친 회원 */}
        <Stack.Protected guard={loggedIn && isOnboarded}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>

        {/* 가입했지만 닉네임·아이·동네를 아직 안 정한 회원 */}
        <Stack.Protected guard={loggedIn && !isOnboarded}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>

        {/* 로그인 안 한 사람 */}
        <Stack.Protected guard={!loggedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>

      {/* 로그인 직후 회원 정보를 불러오는 동안 화면이 깜빡이지 않게 가린다 */}
      {profileLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
