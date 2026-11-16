import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import GradeCard from '@/components/GradeCard';
import DealTimer from '@/components/market/DealTimer';
import ProductCard from '@/components/market/ProductCard';
import TopBar from '@/components/TopBar';
import { colors, fontSize } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import type { Product } from '@/lib/market';
import { useLevelCheck } from '@/lib/useLevelCheck';
import { fromBirthMonthDate, monthsOld } from '@/lib/childAge';
import { formatWon } from '@/lib/format';
import { CATEGORY_LABELS, POST_COLUMNS, type Post } from '@/lib/posts';
import { useProfile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import { USED_COLUMNS, usedImageUrl, type UsedItem } from '@/lib/used';

export default function HomeScreen() {
  const { session } = useAuth();
  const { profile, childBirthMonth } = useProfile();
  const [popular, setPopular] = useState<Post[]>([]);
  const [usedItems, setUsedItems] = useState<UsedItem[]>([]);
  const sigungu = profile?.neighborhood?.sigungu ?? null;

  const months = childBirthMonth ? monthsOld(fromBirthMonthDate(childBirthMonth)) : null;
  const levelCheck = useLevelCheck();
  const [deals, setDeals] = useState<Product[]>([]);

  // 홈에 올 때마다 등급을 확인한다 (시작하기를 막 끝낸 회원은 여기서 씨앗 맘이 된다)
  useFocusEffect(
    useCallback(() => {
      if (session) levelCheck();
      supabase
        .from('products')
        .select('*')
        .eq('is_deal', true)
        .order('sort_order')
        .returns<Product[]>()
        .then(({ data }) => setDeals(data ?? []));
    }, [session, levelCheck]),
  );

  // 가장 먼저 끝나는 특가의 마감 시각
  const dealEnds = deals
    .map((p) => (p.deal_ends_at ? new Date(p.deal_ends_at).getTime() : Infinity))
    .reduce((a, b) => Math.min(a, b), Infinity);

  // 새 중고 매물: 회원은 같은 구, 비회원은 전체에서 판매중인 최신 매물
  useFocusEffect(
    useCallback(() => {
      let query = supabase.from('used_items').select(USED_COLUMNS).eq('status', 'selling');
      if (sigungu) query = query.eq('neighborhood.sigungu', sigungu);
      query
        .order('created_at', { ascending: false })
        .limit(8)
        .returns<UsedItem[]>()
        .then(({ data }) => setUsedItems(data ?? []));
    }, [sigungu]),
  );

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
        <View style={styles.gradeWrap}>
          {session ? (
            <GradeCard />
          ) : (
            <Pressable style={styles.gradeCard} onPress={() => router.push('/grades')}>
              <Text style={styles.gradeTitle}>맘픽 시작하기</Text>
              <Text style={styles.gradeHint}>씨앗 맘부터 숲 맘까지, 등급별 혜택 보기 →</Text>
            </Pressable>
          )}
        </View>

        {deals.length > 0 ? (
          <Section
            title="오늘의 특가"
            right={Number.isFinite(dealEnds) ? <DealTimer endsAt={dealEnds} /> : undefined}
            onMore={() => router.push('/market')}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
              {deals.map((p) => (
                <ProductCard key={p.id} product={p} width={140} />
              ))}
            </ScrollView>
          </Section>
        ) : null}

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
          {usedItems.length === 0 ? (
            <View style={styles.box}>
              <Text style={styles.emptyText}>아직 매물이 없어요. 안 쓰는 육아용품을 올려 보세요!</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
              {usedItems.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.usedCard}
                  onPress={() => router.push({ pathname: '/used/[id]', params: { id: item.id } })}>
                  <Image source={{ uri: usedImageUrl(item.image_paths[0]) }} style={styles.usedThumb} />
                  <Text style={styles.usedTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.usedPrice}>{item.price === 0 ? '나눔' : formatWon(item.price)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
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
  gradeWrap: {
    marginHorizontal: 16,
  },
  gradeCard: {
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
  usedThumb: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: '#F3ECE6',
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
