import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSize } from '@/constants/theme';

type Props = {
  liked: boolean;
  count: number;
  // 내 글이면 누를 수 없고 개수만 보인다
  disabled?: boolean;
  onPress: () => void;
};

export default function LikeButton({ liked, count, disabled = false, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={liked ? '좋아요 취소' : '좋아요'}
      accessibilityState={{ selected: liked, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, liked && styles.liked]}>
      <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? colors.primary : colors.textMuted} />
      <Text style={[styles.label, liked && styles.labelLiked]}>좋아요 {count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  liked: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textMuted,
  },
  labelLiked: {
    color: colors.primary,
  },
});
