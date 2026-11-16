import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize } from '@/constants/theme';
import { CATEGORY_LABELS, type Post } from '@/lib/posts';
import { timeAgo } from '@/lib/time';

type Props = {
  post: Post;
};

// 카페 게시판 스타일의 한 줄: [말머리] 제목 [댓글 수] / 닉네임 · 동 · 시간 · 좋아요
export default function PostCard({ post }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.titleLine}>
        <Text style={styles.title} numberOfLines={1}>
          <Text style={styles.category}>[{CATEGORY_LABELS[post.category]}] </Text>
          {post.best_at ? <Text style={styles.best}>BEST </Text> : null}
          {post.title}
        </Text>
        {post.comment_count > 0 ? <Text style={styles.commentCount}>[{post.comment_count}]</Text> : null}
      </View>
      <View style={styles.metaLine}>
        <Text style={styles.meta} numberOfLines={1}>
          {post.author?.nickname ?? '알 수 없음'} · {post.neighborhood.dong} · {timeAgo(post.created_at)}
          {post.like_count > 0 ? ` · 좋아요 ${post.like_count}` : ''}
        </Text>
        {post.fact_check_status === 'checked' ? <Text style={styles.checked}>팩트 체크됨</Text> : null}
        {post.fact_check_status === 'caution' ? <Text style={styles.caution}>확인 필요</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE6',
  },
  pressed: {
    backgroundColor: '#FBF5F0',
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    flexShrink: 1,
    fontSize: fontSize.body,
    color: colors.text,
  },
  category: {
    color: colors.textMuted,
  },
  best: {
    color: colors.primary,
    fontWeight: '800',
  },
  commentCount: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.primary,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    flexShrink: 1,
    fontSize: 13,
    color: colors.textMuted,
  },
  checked: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2F7A4F',
  },
  caution: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9A5B00',
  },
});
