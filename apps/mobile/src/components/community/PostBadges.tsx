import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize } from '@/constants/theme';
import { CATEGORY_LABELS, type Post } from '@/lib/posts';

type Props = {
  post: Pick<Post, 'category' | 'best_at' | 'fact_check_status'>;
};

// 글 제목 위의 작은 표시들: 말머리, 베스트, 팩트 체크
export default function PostBadges({ post }: Props) {
  return (
    <View style={styles.row}>
      <Text style={[styles.badge, styles.category]}>{CATEGORY_LABELS[post.category]}</Text>
      {post.best_at ? <Text style={[styles.badge, styles.best]}>베스트</Text> : null}
      {post.fact_check_status === 'checked' ? (
        <Text style={[styles.badge, styles.checked]}>팩트 체크됨</Text>
      ) : null}
      {post.fact_check_status === 'caution' ? (
        <Text style={[styles.badge, styles.caution]}>확인 필요</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    fontSize: fontSize.caption,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  category: {
    color: colors.textMuted,
    backgroundColor: '#F3ECE6',
  },
  best: {
    color: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  checked: {
    color: '#2F7A4F',
    backgroundColor: '#E5F4EA',
  },
  caution: {
    color: '#9A5B00',
    backgroundColor: '#FFF1D6',
  },
});
