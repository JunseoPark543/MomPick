import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import AppButton from '@/components/AppButton';
import AppTextInput from '@/components/AppTextInput';
import StepFrame from '@/components/onboarding/StepFrame';
import { colors, fontSize } from '@/constants/theme';
import { useProfile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9_]{2,12}$/;

type Props = {
  onDone: () => void;
};

export default function NicknameStep({ onDone }: Props) {
  const { profile, refresh } = useProfile();
  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleNext() {
    const value = nickname.trim();
    if (!NICKNAME_PATTERN.test(value)) {
      setErrorMessage('한글·영문·숫자로 2~12자, 띄어쓰기 없이 만들어 주세요.');
      return;
    }
    if (!profile) {
      setErrorMessage('회원 정보를 불러오지 못했어요. 앱을 다시 열어 주세요.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    const { error } = await supabase.from('profiles').update({ nickname: value }).eq('id', profile.id);
    if (error) {
      setSaving(false);
      // 23505: 이미 같은 값이 있음 (닉네임 중복)
      setErrorMessage(error.code === '23505' ? '이미 쓰고 있는 닉네임이에요. 다른 닉네임을 써 주세요.' : '저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    await refresh();
    setSaving(false);
    onDone();
  }

  return (
    <StepFrame
      title="맘픽에서 쓸 닉네임을 정해 주세요"
      description="동네 게시판과 중고거래에서 다른 회원에게 보여요."
      footer={<AppButton title="다음" onPress={handleNext} loading={saving} />}>
      <AppTextInput
        label="닉네임"
        value={nickname}
        onChangeText={setNickname}
        placeholder="예: 행복한도담맘"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={12}
        onSubmitEditing={handleNext}
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </StepFrame>
  );
}

const styles = StyleSheet.create({
  error: {
    fontSize: fontSize.body,
    color: colors.error,
  },
});
