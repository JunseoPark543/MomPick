import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import AppButton from '@/components/AppButton';
import StepFrame from '@/components/onboarding/StepFrame';
import { colors, fontSize } from '@/constants/theme';
import { useProfile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

type Neighborhood = {
  code: string;
  sigungu: string;
  dong: string;
};

export default function NeighborhoodStep() {
  const { profile, refresh } = useProfile();
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[] | null>(null);
  const [query, setQuery] = useState('');
  const [selectedCode, setSelectedCode] = useState<string | null>(profile?.neighborhood_code ?? null);
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('neighborhoods')
      .select('code, sigungu, dong')
      .order('sigungu')
      .order('dong')
      .then(({ data, error }) => {
        if (error) {
          setErrorMessage('동네 목록을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.');
          setNeighborhoods([]);
          return;
        }
        setNeighborhoods(data);
      });
  }, []);

  // "역삼", "강남구 역삼" 처럼 띄어 써도 찾을 수 있게 한다
  const filtered = useMemo(() => {
    const words = query.trim().split(/\s+/).filter(Boolean);
    if (!neighborhoods || words.length === 0) return neighborhoods ?? [];
    return neighborhoods.filter((n) => words.every((w) => `${n.sigungu} ${n.dong}`.includes(w)));
  }, [neighborhoods, query]);

  const selected = neighborhoods?.find((n) => n.code === selectedCode);

  async function handleDone() {
    if (!selectedCode || !profile) {
      setErrorMessage('동네를 하나 골라 주세요.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    const { error } = await supabase.from('profiles').update({ neighborhood_code: selectedCode }).eq('id', profile.id);
    if (error) {
      setSaving(false);
      setErrorMessage('저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    // 프로필을 다시 불러오면 시작하기가 완료되어 자동으로 홈 화면으로 넘어간다
    await refresh();
    setSaving(false);
  }

  return (
    <StepFrame
      scroll={false}
      title="우리 동네를 골라 주세요"
      description="동 이름까지만 저장해요. 지금은 서울만 있어요."
      footer={
        <>
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          <AppButton
            title={selected ? `${selected.dong}에서 시작하기` : '동네를 골라 주세요'}
            onPress={handleDone}
            loading={saving}
            disabled={!selected}
          />
        </>
      }>
      <View style={styles.search}>
        <Ionicons name="search" size={22} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="동 이름 검색 (예: 역삼, 강남구)"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCorrect={false}
        />
      </View>

      {neighborhoods === null ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : (
        <FlatList
          style={styles.list}
          data={filtered}
          keyExtractor={(item) => item.code}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={styles.empty}>찾는 동네가 없어요.</Text>}
          renderItem={({ item }) => {
            const isSelected = item.code === selectedCode;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelectedCode(item.code)}
                style={[styles.item, isSelected && styles.itemSelected]}>
                <Text style={styles.itemGu}>{item.sigungu}</Text>
                <Text style={[styles.itemDong, isSelected && styles.itemDongSelected]}>{item.dong}</Text>
                {isSelected ? <Ionicons name="checkmark-circle" size={24} color={colors.primary} /> : null}
              </Pressable>
            );
          }}
        />
      )}
    </StepFrame>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.text,
    paddingVertical: 12,
  },
  loading: {
    marginTop: 24,
  },
  list: {
    flex: 1,
    marginHorizontal: -8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  itemSelected: {
    backgroundColor: colors.primarySoft,
  },
  itemGu: {
    width: 72,
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  itemDong: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.text,
  },
  itemDongSelected: {
    fontWeight: '700',
  },
  empty: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
  error: {
    fontSize: fontSize.body,
    color: colors.error,
  },
});
