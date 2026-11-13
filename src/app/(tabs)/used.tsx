import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import ProductThumb from '@/components/ProductThumb';
import SegmentedTabs from '@/components/SegmentedTabs';
import TopBar from '@/components/TopBar';
import { colors, fontSize } from '@/constants/theme';
import { SAMPLE_USED_ITEMS, USED_CATEGORIES, type UsedItem } from '@/data/sample';
import { formatWon } from '@/lib/format';
import { useProfile } from '@/lib/profile';
import { useRequireLogin } from '@/lib/requireLogin';
import { confirm } from '@/lib/confirm';

function minutesLabel(minutes: number) {
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`;
  return `${Math.floor(minutes / 1440)}일 전`;
}

// 중고거래 목록 (지금은 예시 데이터, 4단계에서 실제 매물로 교체)
export default function UsedScreen() {
  const { profile } = useProfile();
  const requireLogin = useRequireLogin();
  const [category, setCategory] = useState(USED_CATEGORIES[0]);

  const placeName = profile?.neighborhood?.dong ?? '서울';

  return (
    <View style={styles.container}>
      <TopBar>
        <Text style={styles.place}>{placeName}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.text} />
        <View style={styles.spacer} />
        <Ionicons name="search-outline" size={26} color={colors.text} />
        <Ionicons name="notifications-outline" size={26} color={colors.text} />
      </TopBar>

      <View style={styles.categories}>
        <SegmentedTabs
          value={category}
          onChange={setCategory}
          options={USED_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
      </View>

      <FlatList
        data={SAMPLE_USED_ITEMS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UsedRow item={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />

      <Pressable
        accessibilityRole="button"
        onPress={() => requireLogin(() => confirm('준비 중', '판매하기는 4단계에서 만들어요.'))}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
        <Ionicons name="add" size={26} color="#FFFFFF" />
        <Text style={styles.fabLabel}>판매하기</Text>
      </Pressable>
    </View>
  );
}

function UsedRow({ item }: { item: UsedItem }) {
  const statusLabel = item.status === 'reserved' ? '예약중' : item.status === 'sold' ? '거래완료' : null;

  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={item.status === 'sold' && styles.soldThumb}>
        <ProductThumb icon={item.icon} tint={item.tint} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.meta}>
          {item.dong} · {minutesLabel(item.minutesAgo)}
        </Text>
        <View style={styles.priceRow}>
          {statusLabel ? (
            <Text style={[styles.status, item.status === 'sold' && styles.statusSold]}>{statusLabel}</Text>
          ) : null}
          <Text style={styles.price}>{item.price === 0 ? '나눔 🧡' : formatWon(item.price)}</Text>
        </View>
        <View style={styles.counts}>
          {item.chats > 0 ? (
            <>
              <Ionicons name="chatbubbles-outline" size={15} color={colors.textMuted} />
              <Text style={styles.countText}>{item.chats}</Text>
            </>
          ) : null}
          {item.likes > 0 ? (
            <>
              <Ionicons name="heart-outline" size={15} color={colors.textMuted} />
              <Text style={styles.countText}>{item.likes}</Text>
            </>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  place: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  spacer: {
    flex: 1,
  },
  categories: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContent: {
    paddingBottom: 96,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  rowPressed: {
    backgroundColor: '#FBF5F0',
  },
  soldThumb: {
    opacity: 0.5,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 23,
  },
  meta: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  status: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: '#3C9D6E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusSold: {
    backgroundColor: colors.textMuted,
  },
  price: {
    fontSize: fontSize.button,
    fontWeight: '800',
    color: colors.text,
  },
  counts: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 'auto',
  },
  countText: {
    fontSize: 13,
    color: colors.textMuted,
    marginRight: 6,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 28,
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  fabPressed: {
    opacity: 0.85,
  },
  fabLabel: {
    fontSize: fontSize.button,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
