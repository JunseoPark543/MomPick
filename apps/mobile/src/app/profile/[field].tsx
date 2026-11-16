import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChildStep from '@/components/onboarding/ChildStep';
import NeighborhoodStep from '@/components/onboarding/NeighborhoodStep';
import NicknameStep from '@/components/onboarding/NicknameStep';
import { colors } from '@/constants/theme';

const TITLES = {
  nickname: '닉네임 변경',
  child: '아이 출생 연월 변경',
  neighborhood: '동네 변경',
} as const;

// 시작하기 화면을 그대로 써서 항목 하나를 고친다
export default function ProfileFieldScreen() {
  const { field } = useLocalSearchParams<{ field: keyof typeof TITLES }>();
  const done = () => router.back();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Stack.Screen options={{ title: TITLES[field] ?? '내 정보 수정' }} />
      {field === 'nickname' && <NicknameStep onDone={done} submitLabel="저장" />}
      {field === 'child' && <ChildStep onDone={done} submitLabel="저장" />}
      {field === 'neighborhood' && <NeighborhoodStep onDone={done} submitLabel="이 동네로 변경" />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 12,
  },
});
