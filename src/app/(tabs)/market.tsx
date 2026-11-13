import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import DealTimer from '@/components/market/DealTimer';
import ProductCard from '@/components/market/ProductCard';
import TopBar from '@/components/TopBar';
import { colors, fontSize } from '@/constants/theme';
import { MARKET_CATEGORIES, SAMPLE_DEALS, todayDealEndsAt } from '@/data/sample';

// 마켓 (지금은 예시 데이터, 5단계에서 실제 상품으로 교체)
export default function MarketScreen() {
  // 2개씩 한 줄로 묶어 2열 격자를 만든다
  const rows = [];
  for (let i = 0; i < SAMPLE_DEALS.length; i += 2) rows.push(SAMPLE_DEALS.slice(i, i + 2));

  return (
    <View style={styles.container}>
      <TopBar>
        <View style={styles.search}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            placeholder="이유식, 기저귀, 물티슈 검색"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
        </View>
        <Ionicons name="cart-outline" size={28} color={colors.text} />
      </TopBar>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.categoryGrid}>
          {MARKET_CATEGORIES.map((c) => (
            <View key={c.label} style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <Ionicons name={c.icon} size={26} color={colors.primary} />
              </View>
              <Text style={styles.categoryLabel}>{c.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerSmall}>이번 주 맘픽 기획전</Text>
          <Text style={styles.bannerTitle}>중기 이유식 첫 구매{'\n'}무료배송</Text>
          <Text style={styles.bannerHint}>싹트 맘 등급까지 한 걸음!</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>오늘의 특가</Text>
          <DealTimer endsAt={todayDealEndsAt()} />
        </View>

        <View style={styles.grid}>
          {rows.map((row, i) => (
            <View key={i} style={styles.gridRow}>
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
  categoryLabel: {
    fontSize: fontSize.caption,
    color: colors.text,
  },
  banner: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFE9D6',
    gap: 6,
  },
  bannerSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B4651E',
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
