import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AppButton from '@/components/AppButton';
import { colors, fontSize } from '@/constants/theme';
import { confirm } from '@/lib/confirm';
import { formatWon } from '@/lib/format';
import { STERILIZE_ITEM_LABELS, STERILIZE_STATUS_LABELS, type SterilizeItem } from '@/lib/sterilize';
import { supabase } from '@/lib/supabase';

type Request = {
  id: string;
  items: SterilizeItem[];
  pickup_date: string;
  total: number;
  status: keyof typeof STERILIZE_STATUS_LABELS;
};

// 살균 서비스 신청 내역
export default function SterilizeListScreen() {
  const { done } = useLocalSearchParams<{ done?: string }>();
  const [requests, setRequests] = useState<Request[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('sterilization_requests')
      .select('id, items, pickup_date, total, status')
      .order('created_at', { ascending: false })
      .returns<Request[]>();
    setRequests(data ?? []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function cancel(id: string) {
    const ok = await confirm('신청 취소', '살균 신청을 취소할까요?', '취소하기');
    if (!ok) return;
    await supabase.rpc('cancel_sterilization', { p_id: id });
    load();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {done ? (
        <View style={styles.doneBox}>
          <Text style={styles.doneText}>살균 신청이 접수됐어요! (데모)</Text>
        </View>
      ) : null}

      <AppButton title="+ 새로 신청하기" onPress={() => router.push('/sterilize/new')} />

      {requests.length === 0 ? <Text style={styles.empty}>아직 신청 내역이 없어요.</Text> : null}
      {requests.map((r) => (
        <View key={r.id} style={styles.card}>
          <Text style={styles.status}>{STERILIZE_STATUS_LABELS[r.status]}</Text>
          <Text style={styles.title}>{r.items.map((i) => STERILIZE_ITEM_LABELS[i]).join(', ')}</Text>
          <Text style={styles.meta}>
            수거 희망일 {r.pickup_date} · {formatWon(r.total)}
          </Text>
          {r.status === 'requested' ? (
            <AppButton title="신청 취소" variant="text" onPress={() => cancel(r.id)} />
          ) : null}
        </View>
      ))}
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
    gap: 10,
  },
  doneBox: {
    backgroundColor: '#E5F4EA',
    borderRadius: 12,
    padding: 16,
  },
  doneText: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: '#2F7A4F',
    textAlign: 'center',
  },
  empty: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  status: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
