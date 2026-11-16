import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import PostCard from '@/components/community/PostCard';
import SegmentedTabs from '@/components/SegmentedTabs';
import TopBar from '@/components/TopBar';
import { colors, fontSize } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { fromBirthMonthDate } from '@/lib/childAge';
import { fetchFeed, type Feed, type Post } from '@/lib/posts';
import { useProfile } from '@/lib/profile';
import { useRequireLogin } from '@/lib/requireLogin';

const PAGE_SIZE = 20;

export default function CommunityScreen() {
  const { session } = useAuth();
  const { profile, childBirthMonth } = useProfile();
  const requireLogin = useRequireLogin();
  const sigungu = profile?.neighborhood?.sigungu ?? null;

  // 비회원은 동네·동기 정보가 없으므로 전체·베스트만 볼 수 있다
  const feedOptions: { value: Feed; label: string }[] = session
    ? [
        { value: 'local', label: sigungu ? `우리 동네 · ${sigungu}` : '우리 동네' },
        { value: 'all', label: '전체글' },
        { value: 'cohort', label: cohortLabel(childBirthMonth) },
        { value: 'best', label: '베스트' },
      ]
    : [
        { value: 'all', label: '전체글' },
        { value: 'best', label: '베스트' },
      ];

  const [selectedFeed, setSelectedFeed] = useState<Feed>(session ? 'local' : 'all');
  // 로그인·로그아웃으로 고른 게시판이 사라지면 전체글로
  const feed = feedOptions.some((o) => o.value === selectedFeed) ? selectedFeed : 'all';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(
    async (mode: 'reset' | 'more', from: number) => {
      const { data, error } = await fetchFeed(feed, { sigungu, cohortMonth: childBirthMonth }, from, PAGE_SIZE);
      if (error) {
        setErrorMessage('글을 불러오지 못했어요. 아래로 당겨서 다시 시도해 주세요.');
        return;
      }
      setErrorMessage('');
      setPosts((prev) => (mode === 'reset' ? data : [...prev, ...data]));
      setHasMore(data.length === PAGE_SIZE);
    },
    [feed, sigungu, childBirthMonth],
  );

  // 이 탭에 들어올 때마다(글을 쓰고 돌아왔을 때 포함) 새로 불러온다
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load('reset', 0).finally(() => setLoading(false));
    }, [load]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await load('reset', 0);
    setRefreshing(false);
  }

  function handleEndReached() {
    if (!loading && hasMore && posts.length > 0) {
      load('more', posts.length);
    }
  }

  function changeFeed(next: Feed) {
    setPosts([]);
    setSelectedFeed(next);
  }

  const emptyText =
    feed === 'best'
      ? '아직 베스트 글이 없어요.\n좋아요를 많이 받은 글이 여기에 모여요.'
      : `아직 ${{ local: `${sigungu ?? '우리 동네'} `, all: '', cohort: '동기 엄마들의 ' }[feed]}글이 없어요.\n첫 글을 남겨 보세요!`;

  return (
    <View style={styles.container}>
      <TopBar>
        <View style={styles.cafeIcon}>
          <Ionicons name="people" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.cafeText}>
          <Text style={styles.cafeName}>맘픽 {sigungu ?? '서울'} 엄마들</Text>
          <Text style={styles.cafeSub}>우리 동네 육아 이야기</Text>
        </View>
        <Ionicons name="search-outline" size={26} color={colors.text} />
      </TopBar>

      <View style={styles.boards}>
        <SegmentedTabs<Feed> value={feed} onChange={changeFeed} options={feedOptions} />
      </View>

      {loading && posts.length === 0 ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard post={item} />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
          ListHeaderComponent={errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : undefined}
          ListEmptyComponent={errorMessage ? undefined : <Text style={styles.empty}>{emptyText}</Text>}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="글쓰기"
        onPress={() =>
          requireLogin(() =>
            router.push({ pathname: '/post/write', params: { board: feed === 'cohort' ? 'cohort' : 'local' } }),
          )
        }
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
        <Ionicons name="pencil" size={22} color="#FFFFFF" />
        <Text style={styles.fabLabel}>글쓰기</Text>
      </Pressable>
    </View>
  );
}

function cohortLabel(birthMonth: string | null) {
  if (!birthMonth) return '동기 모임';
  const { year, month } = fromBirthMonthDate(birthMonth);
  return `${String(year).slice(2)}년 ${month}월생 동기`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  cafeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cafeText: {
    flex: 1,
  },
  cafeName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  cafeSub: {
    fontSize: 13,
    color: colors.textMuted,
  },
  boards: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  loading: {
    marginTop: 48,
  },
  listContent: {
    paddingBottom: 96,
  },
  error: {
    fontSize: fontSize.body,
    color: colors.error,
    padding: 20,
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
    gap: 6,
    height: 56,
    paddingHorizontal: 22,
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
