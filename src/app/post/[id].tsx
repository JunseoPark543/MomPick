import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import AppButton from '@/components/AppButton';
import PostBadges from '@/components/community/PostBadges';
import { colors, fontSize } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { confirm } from '@/lib/confirm';
import { BOARD_LABELS, POST_COLUMNS, type Post } from '@/lib/posts';
import { supabase } from '@/lib/supabase';
import { timeAgo } from '@/lib/time';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  // 수정하고 돌아왔을 때도 새 내용이 보이도록 화면에 들어올 때마다 불러온다
  useFocusEffect(
    useCallback(() => {
      supabase
        .from('posts')
        .select(POST_COLUMNS)
        .eq('id', id)
        .maybeSingle<Post>()
        .then(({ data }) => {
          setPost(data);
          setLoading(false);
        });
    }, [id]),
  );

  async function handleDelete() {
    const ok = await confirm('글 삭제', '이 글을 삭제할까요? 삭제하면 되돌릴 수 없어요.', '삭제');
    if (!ok) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) router.back();
  }

  if (loading) {
    return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  }
  if (!post) {
    return (
      <View style={styles.container}>
        <Text style={styles.missing}>삭제되었거나 볼 수 없는 글이에요.</Text>
      </View>
    );
  }

  const isMine = post.author_id === session?.user.id;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.board}>{BOARD_LABELS[post.board]}</Text>
      <PostBadges post={post} />
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.meta}>
        {post.author?.nickname ?? '알 수 없음'} · {post.neighborhood.sigungu} {post.neighborhood.dong} ·{' '}
        {timeAgo(post.created_at)}
      </Text>

      {post.is_hidden ? (
        <Text style={styles.hiddenNotice}>신고가 많아 다른 회원에게는 숨겨진 글이에요.</Text>
      ) : null}

      <Text style={styles.body}>{post.body}</Text>

      {isMine ? (
        <View style={styles.actions}>
          <View style={styles.actionItem}>
            <AppButton
              title="수정"
              variant="text"
              onPress={() => router.push({ pathname: '/post/write', params: { id: post.id } })}
            />
          </View>
          <View style={styles.actionItem}>
            <AppButton title="삭제" variant="text" onPress={handleDelete} />
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 10,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.background,
  },
  missing: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 64,
  },
  board: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    color: colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 30,
  },
  meta: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  hiddenNotice: {
    fontSize: fontSize.caption,
    color: colors.error,
  },
  body: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 28,
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  actionItem: {
    minWidth: 80,
  },
});
