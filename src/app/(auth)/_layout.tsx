import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontSize: 20, fontWeight: '700', color: colors.text },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
      }}>
      <Stack.Screen name="login" options={{ title: '' }} />
      <Stack.Screen name="signup" options={{ title: '회원가입' }} />
    </Stack>
  );
}
