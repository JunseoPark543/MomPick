import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import CommentInput from '@/components/community/CommentInput';
import CommentItem from '@/components/community/CommentItem';
import LikeButton from '@/components/community/LikeButton';
import PostBadges from '@/components/community/PostBadges';
import { colors, fontSize } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { blockUser } from '@/lib/block';
import { fetchComments, type Comment } from '@/lib/comments';
import { confirm } from '@/lib/confirm';
import { BOARD_LABELS, POST_COLUMNS, type Post } from '@/lib/posts';
import { supabase } from '@/lib/supabase';
import { useRequireLogin } from '@/lib/requireLogin';
import { timeAgo } from '@/lib/time';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const myId = session?.user.id;
  const headerHeight = useHeaderHeight();
  const requireLogin = useRequireLogin();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadComments = useCallback(async () => {
    const { data } = await fetchComments(id);
    if (data) setComments(data);
  }, [id]);

  // 수정하고 돌아왔을 때도 새 내용이 보이도록 화면에 들어올 때마다 불러온다
  useFocusEffect(
    useCallback(() => {
      Promise.all([
        supabase.from('posts').select(POST_COLUMNS).eq('id', id).maybeSingle<Post>(),
        supabase.from('post_likes').select('post_id').eq('post_id', id).maybeSingle(),
        loadComments(),
      ]).then(([postResult, likeResult]) => {
        setPost(postResult.data);
        setLiked(!!likeResult.data);
        setLoading(false);
      });
    }, [id, loadComments]),
  );

  async function toggleLike() {
    if (!post) return;
    // 누르자마자 화면에 반영하고, 실패하면 되돌린다
    const nextLiked = !liked;
    setLiked(nextLiked);
    setPost({ ...post, like_count: post.like_count + (nextLiked ? 1 : -1) });

    const { error } = nextLiked
      ? await supabase.from('post_likes').insert({ post_id: post.id })
      : await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', myId ?? '');
    if (error) {
      setLiked(!nextLiked);
      setPost(post);
    }
  }

  async function handleCommentPosted() {
    await loadComments();
    if (post) setPost({ ...post, comment_count: post.comment_count + 1 });
  }

  async function handleDeleteComment(commentId: string) {
    const ok = await confirm('댓글 삭제', '이 댓글을 삭제할까요?', '삭제');
    if (!ok) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) return;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    if (post) setPost({ ...post, comment_count: Math.max(post.comment_count - 1, 0) });
  }

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

  const isMine = post.author_id === myId;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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

        <View style={styles.actions}>
          <LikeButton
            liked={liked}
            count={post.like_count}
            disabled={isMine}
            onPress={() => requireLogin(toggleLike)}
          />
          {isMine ? (
            <View style={styles.ownerActions}>
              <View style={styles.ownerAction}>
                <AppButton
                  title="수정"
                  variant="text"
                  onPress={() => router.push({ pathname: '/post/write', params: { id: post.id } })}
                />
              </View>
              <View style={styles.ownerAction}>
                <AppButton title="삭제" variant="text" onPress={handleDelete} />
              </View>
            </View>
          ) : (
            <View style={styles.ownerActions}>
              <View style={styles.ownerAction}>
                <AppButton
                  title="신고"
                  variant="text"
                  onPress={() =>
                    requireLogin(() => router.push({ pathname: '/report', params: { postId: post.id } }))
                  }
                />
              </View>
              <View style={styles.ownerAction}>
                <AppButton
                  title="차단"
                  variant="text"
                  onPress={() =>
                    requireLogin(async () => {
                      if (await blockUser(post.author_id, post.author?.nickname)) router.back();
                    })
                  }
                />
              </View>
            </View>
          )}
        </View>

        <Text style={styles.commentsTitle}>댓글 {comments.length}</Text>
        {comments.length === 0 ? <Text style={styles.noComments}>첫 댓글을 남겨 보세요.</Text> : null}
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            isMine={comment.author_id === myId}
            onDelete={() => handleDeleteComment(comment.id)}
            onReport={() =>
              requireLogin(() => router.push({ pathname: '/report', params: { commentId: comment.id } }))
            }
            onBlock={() =>
              requireLogin(async () => {
                if (await blockUser(comment.author_id, comment.author?.nickname)) {
                  setComments((prev) => prev.filter((c) => c.author_id !== comment.author_id));
                }
              })
            }
          />
        ))}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.inputArea}>
        {session ? (
          <CommentInput postId={post.id} onPosted={handleCommentPosted} />
        ) : (
          <View style={styles.guestInput}>
            <AppButton title="로그인하고 댓글 남기기" variant="text" onPress={() => router.push('/login')} />
          </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 8,
  },
  ownerActions: {
    flexDirection: 'row',
  },
  ownerAction: {
    minWidth: 72,
  },
  commentsTitle: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  noComments: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    paddingVertical: 12,
  },
  inputArea: {
    backgroundColor: colors.surface,
  },
  guestInput: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
});
