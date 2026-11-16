import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AppButton from '@/components/AppButton';
import { colors, fontSize } from '@/constants/theme';
import { confirm } from '@/lib/confirm';
import { formatWon } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { timeAgo } from '@/lib/time';

type Order = {
  id: string;
  status: 'paid' | 'cancelled';
  total: number;
  discount: number;
  created_at: string;
  order_items: { product_name: string; quantity: number }[];
};

type Subscription = {
  id: string;
  interval_weeks: number;
  status: 'active' | 'cancelled';
  next_delivery_date: string;
  product: { name: string; price: number } | null;
};

// 마켓 주문 내역 + 정기 구독
export default function OrdersScreen() {
  const { done } = useLocalSearchParams<{ done?: 'order' | 'subscribe' }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const load = useCallback(async () => {
    const [o, s] = await Promise.all([
      supabase
        .from('orders')
        .select('id, status, total, discount, created_at, order_items(product_name, quantity)')
        .order('created_at', { ascending: false })
        .returns<Order[]>(),
      supabase
        .from('subscriptions')
        .select('id, interval_weeks, status, next_delivery_date, product:products(name, price)')
        .order('created_at', { ascending: false })
        .returns<Subscription[]>(),
    ]);
    setOrders(o.data ?? []);
    setSubscriptions(s.data ?? []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function cancelSubscription(id: string) {
    const ok = await confirm('구독 해지', '정기 구독을 해지할까요?', '해지');
    if (!ok) return;
    await supabase.rpc('cancel_subscription', { p_id: id });
    load();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {done ? (
        <View style={styles.doneBox}>
          <Text style={styles.doneText}>
            {done === 'order' ? '주문이 완료됐어요! (데모 결제)' : '정기 구독을 시작했어요! (데모)'}
          </Text>
        </View>
      ) : null}

      <Text style={styles.section}>정기 구독</Text>
      {subscriptions.length === 0 ? <Text style={styles.empty}>구독 중인 상품이 없어요.</Text> : null}
      {subscriptions.map((s) => (
        <View key={s.id} style={styles.card}>
          <Text style={styles.title}>{s.product?.name}</Text>
          <Text style={styles.meta}>
            {s.interval_weeks === 1 ? '매주' : `${s.interval_weeks}주마다`} ·{' '}
            {s.status === 'active' ? `다음 배송 ${s.next_delivery_date}` : '해지됨'}
          </Text>
          {s.status === 'active' ? (
            <AppButton title="구독 해지" variant="text" onPress={() => cancelSubscription(s.id)} />
          ) : null}
        </View>
      ))}

      <Text style={styles.section}>주문 내역</Text>
      {orders.length === 0 ? <Text style={styles.empty}>아직 주문이 없어요.</Text> : null}
      {orders.map((o) => (
        <View key={o.id} style={styles.card}>
          <Text style={styles.meta}>
            {timeAgo(o.created_at)} · {o.status === 'paid' ? '결제 완료 (데모)' : '취소됨'}
          </Text>
          {o.order_items.map((item) => (
            <Text key={item.product_name} style={styles.title}>
              {item.product_name} × {item.quantity}
            </Text>
          ))}
          <Text style={styles.total}>
            {formatWon(o.total)}
            {o.discount > 0 ? <Text style={styles.discount}> (쿠폰 -{formatWon(o.discount)})</Text> : null}
          </Text>
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
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    padding: 16,
  },
  doneText: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  section: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
  },
  empty: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  title: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  total: {
    fontSize: fontSize.body,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },
  discount: {
    fontSize: 13,
    fontWeight: '400',
    color: '#E5243B',
  },
});
