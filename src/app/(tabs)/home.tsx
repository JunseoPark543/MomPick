import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import DealTimer from '@/components/market/DealTimer';
import ProductThumb from '@/components/ProductThumb';
import TopBar from '@/components/TopBar';
import { colors, fontSize } from '@/constants/theme';
import { SAMPLE_DEALS, SAMPLE_USED_ITEMS, discountRate, todayDealEndsAt } from '@/data/sample';
import { useAuth } from '@/lib/auth';
import { fromBirthMonthDate, monthsOld } from '@/lib/childAge';
import { formatWon } from '@/lib/format';
import { CATEGORY_LABELS, POST_COLUMNS, type Post } from '@/lib/posts';
import { useProfile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const { session } = useAuth();
  const { profile, childBirthMonth } = useProfile();
  const [popular, setPopular] = useState<Post[]>([]);

  const months = childBirthMonth ? monthsOld(fromBirthMonthDate(childBirthMonth)) : null;

  // 인기 글: 회원이면 같은 월령 동기 글, 비회원이면 동네 게시판 전체에서 좋아요 많은 순
  useFocusEffect(
    useCallback(() => {
      let query = supabase.from('posts').select(POST_COLUMNS);
      query = childBirthMonth ? query.eq('cohort_month', childBirthMonth) : query.eq('board', 'local');
      query
        .order('like_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5)
        .returns<Post[]>()
        .then(({ data }) => setPopular(data ?? []));
    }, [childBirthMonth]),
  );

  return (
    <View style={styles.container}>
      <TopBar>
        <Image source={require('../../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.spacer} />
        <Ionicons name="search-outline" size={26} color={colors.text} />
        <Ionicons name="notifications-outline" size={26} color={colors.text} />
      </TopBar>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 등급 카드 (7단계에서 실제 등급으로 교체) */}
        <Pressable style={styles.gradeCard} onPress={() => router.push('/my')}>
          {session ? (
            <>
              <Text style={styles.gradeSmall}>{profile?.nickname}님은</Text>
              <Text style={styles.gradeTitle}>Lv.1 씨앗 맘 🌱</Text>
              <Text style={styles.gradeHint}>다음 등급까지: 이유식 첫 구매 또는 중고거래 1회</Text>
            </>
          ) : (
            <>
              <Text style={styles.gradeTitle}>맘픽 시작하기</Text>
              <Text style={styles.gradeHint}>로그인하고 등급 혜택과 동네 소식을 받아보세요 →</Text>
            </>
          )}
        </Pressable>

        <Section title="오늘의 특가" right={<DealTimer endsAt={todayDealEndsAt()} />} onMore={() => router.push('/market')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {SAMPLE_DEALS.map((p) => (
              <View key={p.id} style={styles.dealCard}>
                <ProductThumb icon={p.icon} tint={p.tint} size={130} radius={10} />
                <Text style={styles.dealName} numberOfLines={2}>
                  {p.name}
                </Text>
                <Text style={styles.dealPrice}>
                  <Text style={styles.dealDiscount}>{discountRate(p)}% </Text>
                  {formatWon(p.price)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Section>

        <Section
          title={months !== null ? `${months}개월 동기 인기 글` : '동네 인기 글'}
          onMore={() => router.push('/community')}>
          <View style={styles.box}>
            {popular.length === 0 ? (
              <Text style={styles.emptyText}>아직 글이 없어요. 첫 글을 남겨 보세요!</Text>
            ) : (
              popular.map((post) => (
                <Pressable
                  key={post.id}
                  onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}
                  style={styles.popularRow}>
                  <Text style={styles.popularTitle} numberOfLines={1}>
                    <Text style={styles.popularCategory}>[{CATEGORY_LABELS[post.category]}] </Text>
                    {post.title}
                  </Text>
                  <Text style={styles.popularMeta}>♡ {post.like_count}</Text>
                </Pressable>
              ))
            )}
          </View>
        </Section>

        <Section title="동네 새 중고 매물" onMore={() => router.push('/used')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {SAMPLE_USED_ITEMS.slice(0, 5).map((item) => (
              <View key={item.id} style={styles.usedCard}>
                <ProductThumb icon={item.icon} tint={item.tint} size={120} radius={10} />
                <Text style={styles.usedTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.usedPrice}>{item.price === 0 ? '나눔' : formatWon(item.price)}</Text>
              </View>
            ))}
          </ScrollView>
        </Section>
      </ScrollView>
    </View>
  );
}

type SectionProps = {
  title: string;
  right?: React.ReactNode;
  onMore: () => void;
  children: React.ReactNode;
};

function Section({ title, right, onMore, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {right}
        <View style={styles.spacer} />
        <Pressable onPress={onMore} hitSlop={10}>
          <Text style={styles.more}>더보기</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logo: {
    width: 72,
    height: 40,
  },
  spacer: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
    gap: 28,
  },
  gradeCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 18,
    backgroundColor: colors.primary,
    gap: 4,
  },
  gradeSmall: {
    fontSize: fontSize.caption,
    color: 'rgba(255,255,255,0.85)',
  },
  gradeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  gradeHint: {
    fontSize: fontSize.caption,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  more: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  hList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dealCard: {
    width: 130,
    gap: 4,
  },
  dealName: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 19,
  },
  dealPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  dealDiscount: {
    color: '#E5243B',
  },
  box: {
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  emptyText: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    paddingVertical: 16,
  },
  popularRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F3ECE6',
  },
  popularTitle: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  popularCategory: {
    color: colors.textMuted,
  },
  popularMeta: {
    fontSize: 13,
    color: colors.primary,
  },
  usedCard: {
    width: 120,
    gap: 4,
  },
  usedTitle: {
    fontSize: 14,
    color: colors.text,
  },
  usedPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
});
