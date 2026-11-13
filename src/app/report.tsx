import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import AppButton from '@/components/AppButton';
import FormScreen from '@/components/FormScreen';
import { colors, fontSize } from '@/constants/theme';
import { REPORT_REASON_LABELS, type ReportReason } from '@/lib/posts';
import { supabase } from '@/lib/supabase';

const REASONS = Object.keys(REPORT_REASON_LABELS) as ReportReason[];

// 글 또는 댓글 신고 (?postId= 또는 ?commentId=)
export default function ReportScreen() {
  const { postId, commentId } = useLocalSearchParams<{ postId?: string; commentId?: string }>();
  const targetName = commentId ? '댓글' : '글';

  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit() {
    if (!reason) {
      setErrorMessage('신고 이유를 골라 주세요.');
      return;
    }

    setSending(true);
    setErrorMessage('');
    const { error } = await supabase.from('reports').insert({
      post_id: commentId ? null : postId,
      comment_id: commentId ?? null,
      reason,
      detail: detail.trim() || null,
    });
    setSending(false);

    if (error) {
      // 23505: 이미 같은 글·댓글을 신고함
      setErrorMessage(
        error.code === '23505' ? `이미 신고한 ${targetName}이에요.` : '신고하지 못했어요. 잠시 후 다시 시도해 주세요.',
      );
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <FormScreen>
        <View style={styles.done}>
          <Ionicons name="checkmark-circle" size={56} color={colors.primary} />
          <Text style={styles.doneTitle}>신고가 접수됐어요</Text>
          <Text style={styles.doneText}>
            맘픽 운영팀이 확인할게요.{'\n'}여러 회원이 신고한 {targetName}은 자동으로 가려져요.
          </Text>
        </View>
        <AppButton title="닫기" onPress={() => router.back()} />
      </FormScreen>
    );
  }

  return (
    <FormScreen>
      <Text style={styles.title}>이 {targetName}을 신고하는 이유를 골라 주세요</Text>

      <View>
        {REASONS.map((r) => {
          const selected = r === reason;
          return (
            <Pressable
              key={r}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setReason(r)}
              style={styles.option}>
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={24}
                color={selected ? colors.primary : colors.textMuted}
              />
              <Text style={styles.optionLabel}>{REPORT_REASON_LABELS[r]}</Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        value={detail}
        onChangeText={setDetail}
        placeholder="자세한 내용 (선택)"
        placeholderTextColor={colors.textMuted}
        multiline
        maxLength={500}
        textAlignVertical="top"
        style={styles.detail}
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <AppButton title="신고하기" onPress={handleSubmit} loading={sending} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 28,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
  },
  optionLabel: {
    fontSize: fontSize.body,
    color: colors.text,
  },
  detail: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    fontSize: fontSize.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  error: {
    fontSize: fontSize.body,
    color: colors.error,
  },
  done: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 48,
  },
  doneTitle: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.text,
  },
  doneText: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 26,
  },
});
