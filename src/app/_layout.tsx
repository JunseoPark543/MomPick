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
        {/* 누구나: 약관·개인정보처리방침 (가입 화면에서도 열 수 있게) */}
        <Stack.Screen name="legal/[doc]" options={{ ...detailHeader, title: '' }} />

        {/* 둘러보기: 비회원 + 시작하기를 마친 회원 */}
        <Stack.Protected guard={!loggedIn || isOnboarded}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="post/[id]" options={{ ...detailHeader, title: '' }} />
          <Stack.Screen name="used/[id]" options={{ ...detailHeader, title: '' }} />
          <Stack.Screen name="product/[id]" options={{ ...detailHeader, title: '' }} />
          <Stack.Screen name="grades" options={{ ...detailHeader, title: '등급 안내' }} />
        </Stack.Protected>

        {/* 글쓰기·신고: 시작하기까지 마친 회원만 */}
        <Stack.Protected guard={loggedIn && isOnboarded}>
          <Stack.Screen name="post/write" options={{ ...detailHeader, title: '글쓰기' }} />
          <Stack.Screen name="report" options={{ ...detailHeader, title: '신고하기', presentation: 'modal' }} />
          <Stack.Screen name="used/new" options={{ ...detailHeader, title: '내 물건 팔기' }} />
          <Stack.Screen name="chats" options={{ ...detailHeader, title: '채팅' }} />
          <Stack.Screen name="chat/[roomId]" options={{ ...detailHeader, title: '채팅' }} />
          <Stack.Screen name="profile/edit" options={{ ...detailHeader, title: '내 정보 수정' }} />
          <Stack.Screen name="profile/[field]" options={{ ...detailHeader, title: '' }} />
          <Stack.Screen name="checkout" options={{ ...detailHeader, title: '주문하기' }} />
          <Stack.Screen name="subscribe" options={{ ...detailHeader, title: '정기 구독' }} />
          <Stack.Screen name="orders" options={{ ...detailHeader, title: '주문·구독 내역' }} />
          <Stack.Screen name="sterilize/new" options={{ ...detailHeader, title: '살균 서비스 신청' }} />
          <Stack.Screen name="sterilize/history" options={{ ...detailHeader, title: '살균 신청 내역' }} />
          <Stack.Screen name="coupons" options={{ ...detailHeader, title: '쿠폰함' }} />
          <Stack.Screen name="perks" options={{ ...detailHeader, title: '숲 맘 특권' }} />
          <Stack.Screen name="settings" options={{ ...detailHeader, title: '설정' }} />
          <Stack.Screen name="level-up" options={{ ...detailHeader, title: '', presentation: 'modal' }} />
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
