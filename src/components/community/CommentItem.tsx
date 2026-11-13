import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize } from '@/constants/theme';
import type { Comment } from '@/lib/comments';
import { timeAgo } from '@/lib/time';

type Props = {
  comment: Comment;
  isMine: boolean;
  onDelete: () => void;
  onReport: () => void;
  onBlock: () => void;
};

export default function CommentItem({ comment, isMine, onDelete, onReport, onBlock }: Props) {
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
            <Text style={styles.action}>삭제</Text>
          </Pressable>
        ) : (
          <>
            <Pressable accessibilityRole="button" onPress={onReport} hitSlop={10}>
              <Text style={styles.action}>신고</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onBlock} hitSlop={10}>
              <Text style={styles.action}>차단</Text>
            </Pressable>
          </>
        )}
      </View>

      {comment.is_hidden ? <Text style={styles.hiddenNotice}>신고가 많아 다른 회원에게는 숨겨진 댓글이에요.</Text> : null}

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
  action: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  hiddenNotice: {
    fontSize: fontSize.caption,
    color: colors.error,
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
