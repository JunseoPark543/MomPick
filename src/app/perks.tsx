import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AppButton from '@/components/AppButton';
import { colors, fontSize } from '@/constants/theme';
import { confirm } from '@/lib/confirm';
import { useProfile } from '@/lib/profile';
import { rpcErrorMessage } from '@/lib/rpcError';
import { supabase } from '@/lib/supabase';

const PERKS = [
  { code: 'kidscafe_raffle', title: '키즈카페 이용권 추첨', text: '매달 추첨으로 제휴 키즈카페 이용권을 드려요.' },
  { code: 'sample_box', title: '프라이빗 샘플박스', text: '신제품 이유식·육아용품 샘플을 먼저 받아 보세요.' },
] as const;

function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// 숲 맘 특권 (데모: 추첨·발송은 운영자가 처리)
export default function PerksScreen() {
  const { profile } = useProfile();
  const [applied, setApplied] = useState<string[]>([]);
  const isForest = (profile?.level ?? 0) >= 4;

  const load = useCallback(async () => {
    const { data } = await supabase.from('perk_entries').select('perk').eq('period', thisMonth());
    setApplied((data ?? []).map((row) => row.perk));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function apply(code: string) {
    const { error } = await supabase.rpc('apply_perk', { p_perk: code });
    if (error) {
      await confirm('신청하지 못했어요', rpcErrorMessage(error));
      return;
    }
    load();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>
        {isForest ? '숲 맘만 누릴 수 있는 특권이에요. 한 달에 한 번씩 신청할 수 있어요.' : '숲 맘(Lv.4)이 되면 신청할 수 있어요.\n정기 구독을 유지하고 팩트 체크에 기여해 보세요.'}
      </Text>
      {PERKS.map((p) => {
        const done = applied.includes(p.code);
        return (
          <View key={p.code} style={styles.card}>
            <Text style={styles.title}>{p.title}</Text>
            <Text style={styles.text}>{p.text}</Text>
            <AppButton
              title={done ? '이번 달 신청 완료' : '신청하기'}
              disabled={!isForest || done}
              onPress={() => apply(p.code)}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  intro: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 26,
    backgroundColor: '#E5F4EA',
    borderRadius: 12,
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  text: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    lineHeight: 24,
  },
});
