import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import { colors, fontSize } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { CHAT_ROOM_COLUMNS, type ChatMessage, type ChatRoom } from '@/lib/chat';
import { confirm } from '@/lib/confirm';
import { formatWon } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { STATUS_LABELS, usedImageUrl } from '@/lib/used';

export default function ChatRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { session } = useAuth();
  const myId = session?.user.id;
  const headerHeight = useHeaderHeight();

  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [feeRate, setFeeRate] = useState(0);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('chat_rooms').select(CHAT_ROOM_COLUMNS).eq('id', roomId).maybeSingle<ChatRoom>(),
      supabase.from('chat_messages').select('*').eq('room_id', roomId).order('id').returns<ChatMessage[]>(),
      supabase.from('app_settings').select('value').eq('key', 'used_safe_pay_fee_rate').maybeSingle(),
    ]).then(([roomResult, messageResult, feeResult]) => {
      setRoom(roomResult.data);
      setMessages(messageResult.data ?? []);
      setFeeRate(Number(feeResult.data?.value ?? 0));
      setLoading(false);
    });

    // 상대가 보낸 메시지를 실시간으로 받는다
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const message = payload.new as ChatMessage;
          setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  async function send() {
    const body = text.trim();
    if (!body) return;
    setSending(true);
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ room_id: roomId, body })
      .select('*')
      .single<ChatMessage>();
    setSending(false);
    if (error || !data) return;
    setText('');
    setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
  }

  async function completeTrade(method: 'direct' | 'safe') {
    if (!room?.item) return;
    const label = method === 'direct' ? '직거래' : '안전결제';
    const ok = await confirm(
      '거래 완료',
      `${room.buyer?.nickname ?? '구매자'}님과 ${label}로 거래를 완료할까요? 완료 후에는 되돌릴 수 없어요.`,
      '완료',
    );
    if (!ok) return;
    const { error } = await supabase.rpc('complete_used_trade', { p_room_id: room.id, p_method: method });
    if (error) {
      await confirm('완료하지 못했어요', error.message);
      return;
    }
    setShowComplete(false);
    setRoom({ ...room, item: { ...room.item, status: 'sold' } });
  }

  if (loading) return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  if (!room) {
    return <Text style={styles.missing}>채팅방을 찾을 수 없어요.</Text>;
  }

  const iAmSeller = room.seller_id === myId;
  const other = iAmSeller ? room.buyer?.nickname : room.seller?.nickname;
  const item = room.item;
  const isSold = item?.status === 'sold';
  const fee = item ? Math.round(item.price * feeRate) : 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}>
      <Stack.Screen options={{ title: other ?? '채팅' }} />

      {item ? (
        <View style={styles.itemBar}>
          <Pressable
            style={styles.itemInfo}
            onPress={() => router.push({ pathname: '/used/[id]', params: { id: item.id } })}>
            <Image source={{ uri: usedImageUrl(item.image_paths[0]) }} style={styles.itemThumb} />
            <View style={styles.itemText}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                <Text style={styles.itemStatus}>{STATUS_LABELS[item.status]} </Text>
                {item.title}
              </Text>
              <Text style={styles.itemPrice}>{item.price === 0 ? '나눔' : formatWon(item.price)}</Text>
            </View>
          </Pressable>
          {iAmSeller && !isSold ? (
            <Pressable onPress={() => setShowComplete((v) => !v)} style={styles.completeToggle}>
              <Text style={styles.completeToggleText}>거래 완료</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {showComplete && item ? (
        <View style={styles.completePanel}>
          <Text style={styles.completeTitle}>{room.buyer?.nickname}님과 어떻게 거래했나요?</Text>
          <AppButton title="만나서 직거래 (수수료 없음)" onPress={() => completeTrade('direct')} />
          {item.safe_pay_available ? (
            <>
              <AppButton title="앱 안 안전결제" variant="text" onPress={() => completeTrade('safe')} />
              <Text style={styles.feeHint}>
                안전결제 수수료 {(feeRate * 100).toFixed(1)}% ({formatWon(fee)}) · 데모라 실제 결제는 되지 않아요
              </Text>
            </>
          ) : null}
        </View>
      ) : null}

      {isSold ? (
        <Text style={styles.soldNotice}>거래가 완료된 매물이에요. 좋은 거래 되셨길 바라요 🧡</Text>
      ) : null}

      <FlatList
        style={styles.list}
        data={[...messages].reverse()}
        inverted
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: message }) => {
          const mine = message.sender_id === myId;
          return (
            <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
              <Text style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>{message.body}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyChat}>
            {iAmSeller ? '구매 희망자의 메시지를 기다리고 있어요.' : '판매자에게 첫 메시지를 보내 보세요.'}
            {'\n'}개인 연락처나 계좌번호 공유는 조심해 주세요.
          </Text>
        }
      />

      <SafeAreaView edges={['bottom']} style={styles.inputBar}>
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="메시지 보내기"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={1000}
            style={styles.input}
          />
          <Pressable
            accessibilityLabel="보내기"
            onPress={send}
            disabled={sending || !text.trim()}
            style={[styles.send, (sending || !text.trim()) && styles.sendDisabled]}>
            <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  itemBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F3ECE6',
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    color: colors.text,
  },
  itemStatus: {
    fontWeight: '700',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  completeToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  completeToggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  completePanel: {
    padding: 16,
    gap: 6,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  completeTitle: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  feeHint: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  soldNotice: {
    fontSize: fontSize.caption,
    color: colors.text,
    textAlign: 'center',
    backgroundColor: colors.primarySoft,
    paddingVertical: 10,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 8,
  },
  bubbleRow: {
    flexDirection: 'row',
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    fontSize: fontSize.body,
    lineHeight: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    overflow: 'hidden',
  },
  bubbleMine: {
    color: '#FFFFFF',
    backgroundColor: colors.primary,
  },
  bubbleOther: {
    color: colors.text,
    backgroundColor: colors.surface,
  },
  emptyChat: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    // inverted 목록 안이라 위아래가 뒤집혀 보이지 않게 되돌린다
    transform: [{ scaleY: -1 }],
  },
  inputBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: fontSize.body,
    color: colors.text,
    backgroundColor: colors.background,
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.4,
  },
});
