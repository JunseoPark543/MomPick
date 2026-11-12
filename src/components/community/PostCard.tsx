import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import PostBadges from '@/components/community/PostBadges';
import { colors, fontSize } from '@/constants/theme';
import type { Post } from '@/lib/posts';
import { timeAgo } from '@/lib/time';

type Props = {
  post: Post;
};

// 글 목록의 한 칸
export default function PostCard({ post }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <PostBadges post={post} />
      <Text style={styles.title} numberOfLines={1}>
        {post.title}
      </Text>
      <Text style={styles.body} numberOfLines={2}>
        {post.body}
      </Text>
      <View style={styles.meta}>
        <Text style={styles.metaText} numberOfLines={1}>
          {post.author?.nickname ?? '알 수 없음'} · {post.neighborhood.dong} · {timeAgo(post.created_at)}
        </Text>
        <View style={styles.counts}>
          <Ionicons name="heart-outline" size={16} color={colors.textMuted} />
          <Text style={styles.metaText}>{post.like_count}</Text>
          <Ionicons name="chatbubble-outline" size={16} color={colors.textMuted} />
          <Text style={styles.metaText}>{post.comment_count}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: '#FBF5F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    lineHeight: 24,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  metaText: {
    flexShrink: 1,
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  counts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
