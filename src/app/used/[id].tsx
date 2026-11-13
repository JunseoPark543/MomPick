import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import SegmentedTabs from '@/components/SegmentedTabs';
import { colors, fontSize } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { confirm } from '@/lib/confirm';
import { formatWon } from '@/lib/format';
import { useRequireLogin } from '@/lib/requireLogin';
import { supabase } from '@/lib/supabase';
import { timeAgo } from '@/lib/time';
import {
  CONDITION_LABELS,
  STATUS_LABELS,
  USED_CATEGORY_LABELS,
  USED_COLUMNS,
  deleteUsedImages,
  usedImageUrl,
  type UsedItem,
} from '@/lib/used';

export default function UsedItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const requireLogin = useRequireLogin();
  const { width } = useWindowDimensions();

  const [item, setItem] = useState<UsedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      supabase
        .from('used_items')
        .select(USED_COLUMNS)
        .eq('id', id)
        .maybeSingle<UsedItem>()
        .then(({ data }) => {
          setItem(data);
          setLoading(false);
        });
    }, [id]),
  );

  // 이미 있는 채팅방이면 열고, 없으면 만든다
  async function openChat() {
    if (!item || !session) return;
    setBusy(true);
    const existing = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('item_id', item.id)
      .eq('buyer_id', session.user.id)
      .maybeSingle();
    let roomId = existing.data?.id;
    if (!roomId) {
      const created = await supabase.from('chat_rooms').insert({ item_id: item.id }).select('id').single();
      roomId = created.data?.id;
    }
    setBusy(false);
    if (roomId) router.push({ pathname: '/chat/[roomId]', params: { roomId } });
  }

  async function changeStatus(status: 'selling' | 'reserved') {
    if (!item) return;
    const { error } = await supabase.from('used_items').update({ status }).eq('id', item.id);
    if (!error) setItem({ ...item, status });
  }

  async function handleDelete() {
    if (!item) return;
    const ok = await confirm('매물 삭제', '이 매물을 삭제할까요? 채팅 내용도 함께 사라져요.', '삭제');
    if (!ok) return;
    const { error } = await supabase.from('used_items').delete().eq('id', item.id);
    if (error) return;
    await deleteUsedImages(item.image_paths);
    router.back();
  }

  if (loading) return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.missing}>삭제되었거나 볼 수 없는 매물이에요.</Text>
      </View>
    );
  }

  const isMine = item.seller_id === session?.user.id;
  const isSold = item.status === 'sold';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '' }} />
      <ScrollView>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))}>
          {item.image_paths.map((path) => (
            <Image key={path} source={{ uri: usedImageUrl(path) }} style={{ width, height: width }} />
          ))}
        </ScrollView>
        {item.image_paths.length > 1 ? (
          <Text style={styles.pager}>
            {imageIndex + 1} / {item.image_paths.length}
          </Text>
        ) : null}

        <View style={styles.seller}>
          <Text style={styles.sellerName}>{item.seller?.nickname ?? '알 수 없음'}</Text>
          <Text style={styles.sellerPlace}>
            {item.neighborhood.sigungu} {item.neighborhood.dong}
          </Text>
        </View>

        <View style={styles.body}>
          {item.status !== 'selling' ? (
            <Text style={[styles.status, isSold && styles.statusSold]}>{STATUS_LABELS[item.status]}</Text>
          ) : null}
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>
            {USED_CATEGORY_LABELS[item.category]} · {timeAgo(item.created_at)} · 채팅 {item.chat_count}
          </Text>

          <View style={styles.specs}>
            <Spec label="상태" value={CONDITION_LABELS[item.condition]} />
            {item.size ? <Spec label="사이즈" value={item.size} /> : null}
            {item.usage_period ? <Spec label="사용 기간" value={item.usage_period} /> : null}
            <Spec label="거래 방식" value={item.safe_pay_available ? '직거래 · 안전결제' : '직거래만'} />
          </View>

          {item.description ? <Text style={styles.description}>{item.description}</Text> : null}

          {isMine && !isSold ? (
            <View style={styles.owner}>
              <Text style={styles.ownerLabel}>판매 상태</Text>
              <View style={styles.bleed}>
                <SegmentedTabs<'selling' | 'reserved'>
                  value={item.status === 'reserved' ? 'reserved' : 'selling'}
                  onChange={changeStatus}
                  options={[
                    { value: 'selling', label: '판매중' },
                    { value: 'reserved', label: '예약중' },
                  ]}
                />
              </View>
              <Text style={styles.hint}>거래 완료는 채팅방에서 구매자를 골라 처리해요.</Text>
            </View>
          ) : null}
          {isMine ? <AppButton title="매물 삭제" variant="text" onPress={handleDelete} /> : null}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <View style={styles.bottomInner}>
          <View style={styles.priceBox}>
            <Text style={styles.price}>{item.price === 0 ? '나눔 🧡' : formatWon(item.price)}</Text>
            {item.safe_pay_available ? <Text style={styles.safePay}>안전결제 가능</Text> : null}
          </View>
          <View style={styles.cta}>
            {isMine ? (
              <AppButton title="내 채팅 보기" onPress={() => router.push('/chats')} />
            ) : (
              <AppButton
                title={isSold ? '거래완료' : '채팅하기'}
                onPress={() => requireLogin(openChat)}
                disabled={isSold}
                loading={busy}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.specRow}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  missing: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 64,
  },
  pager: {
    position: 'absolute',
    right: 12,
    top: 12,
    fontSize: 13,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  seller: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sellerName: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
  },
  sellerPlace: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  body: {
    padding: 16,
    gap: 10,
  },
  status: {
    alignSelf: 'flex-start',
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: '#3C9D6E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusSold: {
    backgroundColor: colors.textMuted,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 30,
  },
  meta: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  specs: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  specRow: {
    flexDirection: 'row',
  },
  specLabel: {
    width: 80,
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  specValue: {
    flex: 1,
    fontSize: fontSize.caption,
    color: colors.text,
    fontWeight: '600',
  },
  description: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 28,
    marginTop: 4,
  },
  owner: {
    gap: 6,
    marginTop: 12,
  },
  ownerLabel: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
  },
  bleed: {
    marginHorizontal: -16,
  },
  hint: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  bottomInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  priceBox: {
    flex: 1,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  safePay: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2A6FDB',
  },
  cta: {
    minWidth: 140,
  },
});
