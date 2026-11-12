import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AppButton from '@/components/AppButton';
import MonthPicker from '@/components/MonthPicker';
import StepFrame from '@/components/onboarding/StepFrame';
import { colors, fontSize } from '@/constants/theme';
import { fromBirthMonthDate, monthsOld, toBirthMonthDate, type YearMonth } from '@/lib/childAge';
import { useProfile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

type Props = {
  onDone: () => void;
};

export default function ChildStep({ onDone }: Props) {
  const { refresh } = useProfile();
  const [birth, setBirth] = useState<YearMonth | null>(null);
  // 이전 단계로 돌아왔다가 다시 온 경우, 이미 저장한 아이 정보를 고친다
  const [existingChildId, setExistingChildId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('children')
      .select('id, birth_month')
      .order('created_at')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setExistingChildId(data.id);
          setBirth(fromBirthMonthDate(data.birth_month));
        }
      });
  }, []);

  async function handleNext() {
    if (!birth) {
      setErrorMessage('아이가 태어난 연도와 달을 골라 주세요.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    const birthMonth = toBirthMonthDate(birth);
    const { error } = existingChildId
      ? await supabase.from('children').update({ birth_month: birthMonth }).eq('id', existingChildId)
      : await supabase.from('children').insert({ birth_month: birthMonth });
    if (error) {
      setSaving(false);
      setErrorMessage('저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    await refresh();
    setSaving(false);
    onDone();
  }

  return (
    <StepFrame
      title="아이가 언제 태어났나요?"
      description={'같은 월령 엄마들의 글과 꼭 맞는 상품을 보여드려요.\n태어난 연도와 달만 받아요.'}
      footer={<AppButton title="다음" onPress={handleNext} loading={saving} />}>
      <MonthPicker value={birth} onChange={setBirth} />

      {birth ? (
        <View style={styles.ageBox}>
          <Text style={styles.ageText}>
            {birth.year}년 {birth.month}월생 · 지금 약 <Text style={styles.ageStrong}>{monthsOld(birth)}개월</Text>
          </Text>
        </View>
      ) : null}

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </StepFrame>
  );
}

const styles = StyleSheet.create({
  ageBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    padding: 16,
  },
  ageText: {
    fontSize: fontSize.body,
    color: colors.text,
  },
  ageStrong: {
    fontWeight: '700',
    color: colors.primary,
  },
  error: {
    fontSize: fontSize.body,
    color: colors.error,
  },
});
