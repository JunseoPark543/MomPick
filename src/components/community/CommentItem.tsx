import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize } from '@/constants/theme';
import type { Comment } from '@/lib/comments';
import { timeAgo } from '@/lib/time';

type Props = {
  comment: Comment;
  isMine: boolean;
  onDelete: () => void;
};

export default function CommentItem({ comment, isMine, onDelete }: Props) {
  return (
    <View style={[styles.container, comment.is_fact_check && styles.factCheck]}>
      <View style={styles.header}>
        {comment.is_fact_check ? (
          <View style={styles.factLabel}>
            <Ionicons name="checkmark-done" size={16} color="#2F7A4F" />
            <Text style={styles.factLabelText}>팩트 체크</Text>
          </View>
        ) : null}
        <Text style={styles.meta} numberOfLines={1}>
          {comment.author?.nickname ?? '알 수 없음'} · {timeAgo(comment.created_at)}
        </Text>
        {isMine ? (
          <Pressable accessibilityRole="button" onPress={onDelete} hitSlop={10}>
            <Text style={styles.delete}>삭제</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.body}>{comment.body}</Text>

      {comment.source ? (
        <Text style={styles.source} selectable>
          출처: {comment.source}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  factCheck: {
    backgroundColor: '#F2FAF4',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderTopWidth: 0,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  factLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  factLabelText: {
    fontSize: fontSize.caption,
    fontWeight: '700',
    color: '#2F7A4F',
  },
  meta: {
    flex: 1,
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  delete: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  body: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 26,
  },
  source: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
});
