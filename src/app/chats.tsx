import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { CHAT_ROOM_COLUMNS, type ChatRoom } from '@/lib/chat';
import { supabase } from '@/lib/supabase';
import { timeAgo } from '@/lib/time';
import { usedImageUrl } from '@/lib/used';

// 내가 사거나 파는 모든 중고 채팅방
export default function ChatsScreen() {
  const { session } = useAuth();
  const myId = session?.user.id;
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      supabase
        .from('chat_rooms')
        .select(CHAT_ROOM_COLUMNS)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .returns<ChatRoom[]>()
        .then(({ data }) => {
          setRooms(data ?? []);
          setLoading(false);
        });
    }, []),
  );

  if (loading) return <ActivityIndicator color={colors.primary} style={styles.loading} />;

  return (
    <FlatList
      style={styles.container}
      data={rooms}
      keyExtractor={(room) => room.id}
      ListEmptyComponent={<Text style={styles.empty}>아직 채팅이 없어요.{'\n'}마음에 드는 매물에서 채팅을 시작해 보세요.</Text>}
      renderItem={({ item: room }) => {
        const iAmSeller = room.seller_id === myId;
        const other = iAmSeller ? room.buyer?.nickname : room.seller?.nickname;
        return (
          <Pressable
            onPress={() => router.push({ pathname: '/chat/[roomId]', params: { roomId: room.id } })}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <View style={styles.text}>
              <Text style={styles.name} numberOfLines={1}>
                {other ?? '알 수 없음'} <Text style={styles.role}>{iAmSeller ? '· 구매 희망' : '· 판매자'}</Text>
              </Text>
              <Text style={styles.last} numberOfLines={1}>
                {room.last_message ?? '아직 메시지가 없어요'}
              </Text>
              <Text style={styles.time}>{timeAgo(room.last_message_at ?? room.created_at)}</Text>
            </View>
            {room.item ? <Image source={{ uri: usedImageUrl(room.item.image_paths[0]) }} style={styles.thumb} /> : null}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  empty: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 26,
    marginTop: 64,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3ECE6',
  },
  pressed: {
    backgroundColor: '#FBF5F0',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
  },
  role: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textMuted,
  },
  last: {
    fontSize: 15,
    color: colors.text,
  },
  time: {
    fontSize: 13,
    color: colors.textMuted,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#F3ECE6',
  },
});
