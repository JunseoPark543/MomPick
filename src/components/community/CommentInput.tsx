import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fontSize } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

type Props = {
  postId: string;
  onPosted: () => void;
};

// 글 상세 아래에 붙는 댓글 입력칸. '팩트 체크'를 켜면 출처를 함께 받는다.
export default function CommentInput({ postId, onPosted }: Props) {
  const [body, setBody] = useState('');
  const [isFactCheck, setIsFactCheck] = useState(false);
  const [source, setSource] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const trimmedBody = body.trim();
    const trimmedSource = source.trim();
    if (!trimmedBody) return;
    if (isFactCheck && trimmedSource.length < 2) {
      setErrorMessage('팩트 체크 댓글은 출처(링크, 기관·책 이름 등)를 꼭 적어 주세요.');
      return;
    }

    setSending(true);
    setErrorMessage('');
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      body: trimmedBody,
      is_fact_check: isFactCheck,
      source: isFactCheck ? trimmedSource : null,
    });
    setSending(false);

    if (error) {
      setErrorMessage('댓글을 남기지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    setBody('');
    setSource('');
    setIsFactCheck(false);
    onPosted();
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: isFactCheck }}
        onPress={() => setIsFactCheck((v) => !v)}
        style={styles.toggle}
        hitSlop={6}>
        <Ionicons
          name={isFactCheck ? 'checkbox' : 'square-outline'}
          size={22}
          color={isFactCheck ? '#2F7A4F' : colors.textMuted}
        />
        <Text style={[styles.toggleLabel, isFactCheck && styles.toggleLabelOn]}>팩트 체크로 남기기 (출처 필요)</Text>
      </Pressable>

      {isFactCheck ? (
        <TextInput
          value={source}
          onChangeText={setSource}
          placeholder="출처 (예: 질병관리청 예방접종 안내 페이지)"
          placeholderTextColor={colors.textMuted}
          maxLength={300}
          autoCapitalize="none"
          style={[styles.input, styles.sourceInput]}
        />
      ) : null}

      <View style={styles.row}>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder={isFactCheck ? '확인한 내용을 적어 주세요' : '댓글을 남겨 주세요'}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={1000}
          style={[styles.input, styles.bodyInput]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="댓글 보내기"
          onPress={handleSend}
          disabled={sending || !body.trim()}
          style={[styles.send, (sending || !body.trim()) && styles.sendDisabled]}>
          {sending ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="arrow-up" size={24} color="#FFFFFF" />}
        </Pressable>
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 8,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  toggleLabel: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  toggleLabelOn: {
    color: '#2F7A4F',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: fontSize.body,
    color: colors.text,
    backgroundColor: colors.background,
  },
  sourceInput: {
    minHeight: 48,
  },
  bodyInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
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
  error: {
    fontSize: fontSize.caption,
    color: colors.error,
  },
});
