import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChildStep from '@/components/onboarding/ChildStep';
import NeighborhoodStep from '@/components/onboarding/NeighborhoodStep';
import NicknameStep from '@/components/onboarding/NicknameStep';
import { colors, fontSize } from '@/constants/theme';
import { useProfile } from '@/lib/profile';

const STEPS = ['nickname', 'child', 'neighborhood'] as const;
type Step = (typeof STEPS)[number];

// 가입 직후 시작하기: 닉네임 → 아이 출생 연월 → 동네
export default function OnboardingScreen() {
  const { isLoading } = useProfile();

  // 회원 정보를 다 불러온 뒤에 어느 단계부터 할지 정한다
  if (isLoading) return null;
  return <OnboardingFlow />;
}

function OnboardingFlow() {
  const { profile, hasChild } = useProfile();

  // 중간에 앱을 껐다 켜면 아직 안 한 단계부터 이어서 한다
  const [step, setStep] = useState<Step>(() => {
    if (!profile?.nickname) return 'nickname';
    if (!hasChild) return 'child';
    return 'neighborhood';
  });

  const index = STEPS.indexOf(step);
  const goTo = (i: number) => setStep(STEPS[i]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {index > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="이전 단계"
            onPress={() => goTo(index - 1)}
            hitSlop={12}
            style={styles.back}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.back} />
        )}
        <Text style={styles.progress}>
          {index + 1} / {STEPS.length}
        </Text>
        <View style={styles.back} />
      </View>

      {step === 'nickname' && <NicknameStep onDone={() => goTo(1)} />}
      {step === 'child' && <ChildStep onDone={() => goTo(2)} />}
      {step === 'neighborhood' && <NeighborhoodStep />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    minHeight: 52,
  },
  back: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
