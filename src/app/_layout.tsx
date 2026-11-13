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
        {/* 누구나: 상태에 맞는 화면으로 보내주는 안내 화면 */}
        <Stack.Screen name="index" />

        {/* 둘러보기: 비회원 + 시작하기를 마친 회원 */}
        <Stack.Protected guard={!loggedIn || isOnboarded}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="post/[id]" options={{ ...detailHeader, title: '' }} />
        </Stack.Protected>

        {/* 글쓰기·신고: 시작하기까지 마친 회원만 */}
        <Stack.Protected guard={loggedIn && isOnboarded}>
          <Stack.Screen name="post/write" options={{ ...detailHeader, title: '글쓰기' }} />
          <Stack.Screen name="report" options={{ ...detailHeader, title: '신고하기', presentation: 'modal' }} />
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

// 탭 바깥 화면(글 상세 등)의 위쪽 제목줄 모양
const detailHeader = {
  headerShown: true,
  headerStyle: { backgroundColor: colors.background },
  headerTitleStyle: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal' as const,
};

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
