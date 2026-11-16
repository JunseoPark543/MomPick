import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import DealTimer from '@/components/market/DealTimer';
import ProductCard from '@/components/market/ProductCard';
import TopBar from '@/components/TopBar';
import { colors, fontSize } from '@/constants/theme';
import { MARKET_CATEGORIES, type Product, type ProductCategory } from '@/lib/market';
import { useRequireLogin } from '@/lib/requireLogin';
import { supabase } from '@/lib/supabase';

export default function MarketScreen() {
  const requireLogin = useRequireLogin();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('sort_order')
      .order('created_at', { ascending: false })
      .returns<Product[]>();
    setProducts(data ?? []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const deals = products.filter((p) => p.is_deal);
  const keyword = search.trim();
  const listed = products.filter(
    (p) => (!category || p.category === category) && (!keyword || p.name.includes(keyword)),
  );
  // 가장 먼저 끝나는 특가의 마감 시각
  const dealEnds = deals
    .map((p) => (p.deal_ends_at ? new Date(p.deal_ends_at).getTime() : Infinity))
    .reduce((a, b) => Math.min(a, b), Infinity);

  const rows: Product[][] = [];
  for (let i = 0; i < listed.length; i += 2) rows.push(listed.slice(i, i + 2));

  return (
    <View style={styles.container}>
      <TopBar>
        <View style={styles.search}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="이유식, 기저귀, 물티슈 검색"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
        </View>
        <Pressable accessibilityLabel="주문 내역" onPress={() => requireLogin(() => router.push('/orders'))} hitSlop={8}>
          <Ionicons name="receipt-outline" size={26} color={colors.text} />
        </Pressable>
      </TopBar>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            tintColor={colors.primary}
          />
        }>
        <View style={styles.categoryGrid}>
          {MARKET_CATEGORIES.map((c) => {
            const selected = c.value === category;
            return (
              <Pressable
                key={c.value}
                style={styles.categoryItem}
                onPress={() =>
                  c.value === 'sterilize'
                    ? requireLogin(() => router.push('/sterilize/new'))
                    : setCategory(selected ? null : c.value)
                }>
                <View style={[styles.categoryIcon, selected && styles.categoryIconSelected]}>
                  <Ionicons name={c.icon} size={26} color={selected ? '#FFFFFF' : colors.primary} />
                </View>
                <Text style={[styles.categoryLabel, selected && styles.categoryLabelSelected]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {!category && !keyword ? (
          <>
            <Pressable style={styles.banner} onPress={() => requireLogin(() => router.push('/sterilize/new'))}>
              <Text style={styles.bannerSmall}>맘픽 살균 서비스</Text>
              <Text style={styles.bannerTitle}>유모차·카시트{'\n'}집 앞 수거 살균</Text>
              <Text style={styles.bannerHint}>나무 맘 등급 조건이에요 · 신청하기 →</Text>
            </Pressable>

            {deals.length > 0 ? (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>오늘의 특가</Text>
                  {Number.isFinite(dealEnds) ? <DealTimer endsAt={dealEnds} /> : null}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dealList}>
                  {deals.map((p) => (
                    <ProductCard key={p.id} product={p} width={150} />
                  ))}
                </ScrollView>
              </>
            ) : null}
          </>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {category ? MARKET_CATEGORIES.find((c) => c.value === category)?.label : '전체 상품'}
          </Text>
        </View>
        {rows.length === 0 ? <Text style={styles.empty}>상품이 없어요.</Text> : null}
        <View style={styles.grid}>
          {rows.map((row) => (
            <View key={row[0].id} style={styles.gridRow}>
              {row.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
              {row.length === 1 ? <View style={styles.gridFiller} /> : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  content: {
    paddingBottom: 32,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconSelected: {
    backgroundColor: colors.primary,
  },
  categoryLabel: {
    fontSize: fontSize.caption,
    color: colors.text,
  },
  categoryLabelSelected: {
    fontWeight: '800',
    color: colors.primary,
  },
  banner: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#E5F4EA',
    gap: 6,
  },
  bannerSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2F7A4F',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 30,
  },
  bannerHint: {
    fontSize: 13,
    color: colors.textMuted,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  dealList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  empty: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    paddingHorizontal: 16,
  },
  grid: {
    paddingHorizontal: 16,
    gap: 24,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridFiller: {
    flex: 1,
  },
});
