import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import PostCard from '@/components/community/PostCard';
import SegmentedTabs from '@/components/SegmentedTabs';
import { colors, fontSize } from '@/constants/theme';
import { fromBirthMonthDate } from '@/lib/childAge';
import { fetchFeed, type Feed, type Post } from '@/lib/posts';
import { useProfile } from '@/lib/profile';

const PAGE_SIZE = 20;

export default function CommunityScreen() {
  const { profile, childBirthMonth } = useProfile();
  const sigungu = profile?.neighborhood?.sigungu ?? null;

  const [feed, setFeed] = useState<Feed>('local');
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
    setFeed(next);
  }

  const cohortLabel = (() => {
    if (!childBirthMonth) return '동기 모임';
    const { year, month } = fromBirthMonthDate(childBirthMonth);
    return `${String(year).slice(2)}년 ${month}월생 동기`;
  })();

  const emptyWhose = { local: `${sigungu ?? '우리 동네'} `, all: '', cohort: '동기 엄마들의 ' }[feed];
  const emptyText = `아직 ${emptyWhose}글이 없어요.\n첫 글을 남겨 보세요!`;

  return (
    <View style={styles.container}>
      <SegmentedTabs<Feed>
        value={feed}
        onChange={changeFeed}
        options={[
          { value: 'local', label: sigungu ? `우리 동네 · ${sigungu}` : '우리 동네' },
          { value: 'all', label: '전체' },
          { value: 'cohort', label: cohortLabel },
        ]}
      />

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
        onPress={() => router.push({ pathname: '/post/write', params: { board: feed === 'cohort' ? 'cohort' : 'local' } })}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
        <Ionicons name="pencil" size={22} color="#FFFFFF" />
        <Text style={styles.fabLabel}>글쓰기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
