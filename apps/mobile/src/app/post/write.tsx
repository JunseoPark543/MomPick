import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import AppButton from '@/components/AppButton';
import AppTextInput from '@/components/AppTextInput';
import FormScreen from '@/components/FormScreen';
import SegmentedTabs from '@/components/SegmentedTabs';
import { colors, fontSize } from '@/constants/theme';
import { fromBirthMonthDate } from '@/lib/childAge';
import { BOARD_LABELS, CATEGORIES, CATEGORY_LABELS, type Board, type Category } from '@/lib/posts';
import { useProfile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

const MAX_TITLE = 60;
const MAX_BODY = 3000;

// 새 글 쓰기, 또는 ?id= 가 있으면 내 글 고치기
export default function WritePostScreen() {
  const params = useLocalSearchParams<{ id?: string; board?: Board }>();
  const editingId = params.id ?? null;
  const { profile, childBirthMonth } = useProfile();

  const [board, setBoard] = useState<Board>(params.board === 'cohort' ? 'cohort' : 'local');
  const [category, setCategory] = useState<Category>('question');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editingId) return;
    supabase
      .from('posts')
      .select('board, category, title, body')
      .eq('id', editingId)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setBoard(data.board);
        setCategory(data.category);
        setTitle(data.title);
        setBody(data.body);
      });
  }, [editingId]);

  const audience = (() => {
    if (board === 'cohort' && childBirthMonth) {
      const { year, month } = fromBirthMonthDate(childBirthMonth);
      return `${year}년 ${month}월생 아이를 키우는 동기 엄마들에게 보여요.`;
    }
    const n = profile?.neighborhood;
    return n ? `${n.sigungu} 이웃과 전체 게시판에 보여요. (내 동네: ${n.dong})` : '';
  })();

  async function handleSubmit() {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle) {
      setErrorMessage('제목을 입력해 주세요.');
      return;
    }
    if (!trimmedBody) {
      setErrorMessage('내용을 입력해 주세요.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    const { data, error } = editingId
      ? await supabase
          .from('posts')
          .update({ category, title: trimmedTitle, body: trimmedBody })
          .eq('id', editingId)
          .select('id')
          .single()
      : await supabase
          .from('posts')
          .insert({ board, category, title: trimmedTitle, body: trimmedBody })
          .select('id')
          .single();
    setSaving(false);

    if (error || !data) {
      setErrorMessage('글을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    if (editingId) {
      router.back();
    } else {
      // 쓴 글 화면으로 바로 이동 (뒤로 가면 목록)
      router.replace({ pathname: '/post/[id]', params: { id: data.id } });
    }
  }

  return (
    <FormScreen>
      <Stack.Screen options={{ title: editingId ? '글 수정' : '글쓰기' }} />

      {/* 게시판은 처음 쓸 때만 고를 수 있다 */}
      {editingId ? null : (
        <View style={styles.section}>
          <Text style={styles.label}>어디에 올릴까요?</Text>
          <View style={styles.tabsBleed}>
            <SegmentedTabs<Board>
              value={board}
              onChange={setBoard}
              options={[
                { value: 'local', label: BOARD_LABELS.local },
                { value: 'cohort', label: BOARD_LABELS.cohort },
              ]}
            />
          </View>
          <Text style={styles.hint}>{audience}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>말머리</Text>
        <View style={styles.tabsBleed}>
          <SegmentedTabs<Category>
            value={category}
            onChange={setCategory}
            options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
          />
        </View>
      </View>

      <AppTextInput label="제목" value={title} onChangeText={setTitle} placeholder="제목" maxLength={MAX_TITLE} />

      <View style={styles.section}>
        <Text style={styles.label}>내용</Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder={'궁금한 점이나 나누고 싶은 이야기를 적어 주세요.\n아이 실명·얼굴 사진·병원 기록 같은 개인정보는 적지 말아 주세요.'}
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          maxLength={MAX_BODY}
          style={styles.bodyInput}
        />
        <Text style={styles.counter}>
          {body.length} / {MAX_BODY}
        </Text>
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <AppButton title={editingId ? '수정 완료' : '올리기'} onPress={handleSubmit} loading={saving} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.text,
  },
  tabsBleed: {
    marginHorizontal: -24,
    paddingHorizontal: 8,
  },
  hint: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  bodyInput: {
    minHeight: 200,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    fontSize: fontSize.body,
    lineHeight: 26,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  counter: {
    alignSelf: 'flex-end',
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  error: {
    fontSize: fontSize.body,
    color: colors.error,
  },
});
