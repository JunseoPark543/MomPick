import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize } from '@/constants/theme';
import { formatWon } from '@/lib/format';
import { timeAgo } from '@/lib/time';
import { STATUS_LABELS, usedImageUrl, type UsedItem } from '@/lib/used';

type Props = {
  item: UsedItem;
};

// 중고 목록의 한 줄: 왼쪽 사진, 오른쪽 제목·동네·시간·가격
export default function UsedRow({ item }: Props) {
  const isSold = item.status === 'sold';

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/used/[id]', params: { id: item.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Image source={{ uri: usedImageUrl(item.image_paths[0]) }} style={[styles.thumb, isSold && styles.soldThumb]} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.meta}>
          {item.neighborhood.dong} · {timeAgo(item.created_at)}
        </Text>
        <View style={styles.priceRow}>
          {item.status !== 'selling' ? (
            <Text style={[styles.status, isSold && styles.statusSold]}>{STATUS_LABELS[item.status]}</Text>
          ) : null}
          <Text style={styles.price}>{item.price === 0 ? '나눔 🧡' : formatWon(item.price)}</Text>
        </View>
        {item.chat_count > 0 ? (
          <View style={styles.counts}>
            <Ionicons name="chatbubbles-outline" size={15} color={colors.textMuted} />
            <Text style={styles.countText}>{item.chat_count}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  pressed: {
    backgroundColor: '#FBF5F0',
  },
  thumb: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: '#F3ECE6',
  },
  soldThumb: {
    opacity: 0.5,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 23,
  },
  meta: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  status: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: '#3C9D6E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusSold: {
    backgroundColor: colors.textMuted,
  },
  price: {
    fontSize: fontSize.button,
    fontWeight: '800',
    color: colors.text,
  },
  counts: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 'auto',
  },
  countText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
