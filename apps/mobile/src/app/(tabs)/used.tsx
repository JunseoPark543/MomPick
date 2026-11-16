import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import RegionPicker from '@/components/RegionPicker';
import SegmentedTabs from '@/components/SegmentedTabs';
import TopBar from '@/components/TopBar';
import UsedRow from '@/components/used/UsedRow';
import { colors, fontSize } from '@/constants/theme';
import { useProfile } from '@/lib/profile';
import { useRequireLogin } from '@/lib/requireLogin';
import { supabase } from '@/lib/supabase';
import { USED_CATEGORIES, USED_CATEGORY_LABELS, USED_COLUMNS, type UsedCategory, type UsedItem } from '@/lib/used';

type CategoryFilter = 'all' | UsedCategory;

// 중고거래 목록: 회원은 같은 구, 비회원은 전체 매물
export default function UsedScreen() {
  const { profile } = useProfile();
  const requireLogin = useRequireLogin();
  const mySigungu = profile?.neighborhood?.sigungu ?? null;

  // 고른 지역: 아직 안 골랐으면(undefined) 내 구, null 이면 서울 전체
  const [region, setRegion] = useState<string | null | undefined>(undefined);
  const sigungu = region === undefined ? mySigungu : region;
  const [pickerOpen, setPickerOpen] = useState(false);

  const [category, setCategory] = useState<CategoryFilter>('all');
  const [items, setItems] = useState<UsedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    let query = supabase.from('used_items').select(USED_COLUMNS);
    if (sigungu) query = query.eq('neighborhood.sigungu', sigungu);
    if (category !== 'all') query = query.eq('category', category);
    const { data } = await query.order('created_at', { ascending: false }).limit(50).returns<UsedItem[]>();
    setItems(data ?? []);
  }, [sigungu, category]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <TopBar>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="지역 선택"
          onPress={() => setPickerOpen(true)}
          style={styles.placeButton}
          hitSlop={8}>
          <Text style={styles.place}>{sigungu ?? '서울 전체'}</Text>
          <Ionicons name="chevron-down" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.spacer} />
        <Pressable accessibilityLabel="채팅 목록" onPress={() => requireLogin(() => router.push('/chats'))} hitSlop={8}>
          <Ionicons name="chatbubbles-outline" size={26} color={colors.text} />
        </Pressable>
      </TopBar>

      <View style={styles.categories}>
        <SegmentedTabs<CategoryFilter>
          value={category}
          onChange={setCategory}
          options={[
            { value: 'all', label: '전체' },
            ...USED_CATEGORIES.map((c) => ({ value: c, label: USED_CATEGORY_LABELS[c] })),
          ]}
        />
      </View>

      {loading && items.length === 0 ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <UsedRow item={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={styles.empty}>아직 매물이 없어요.{'\n'}첫 물건을 올려 보세요!</Text>}
          contentContainerStyle={styles.listContent}
        />
      )}

      <RegionPicker
        visible={pickerOpen}
        value={sigungu}
        mySigungu={mySigungu}
        onSelect={setRegion}
        onClose={() => setPickerOpen(false)}
      />

      <Pressable
        accessibilityRole="button"
        onPress={() => requireLogin(() => router.push('/used/new'))}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
        <Ionicons name="add" size={26} color="#FFFFFF" />
        <Text style={styles.fabLabel}>판매하기</Text>
      </Pressable>
    </View>
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
  placeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
  },
  spacer: {
    flex: 1,
  },
  categories: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  loading: {
    marginTop: 48,
  },
  listContent: {
    paddingBottom: 96,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  empty: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 26,
    marginTop: 64,
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
