import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontSize } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

type Props = {
  visible: boolean;
  // 지금 고른 구 (null 이면 서울 전체)
  value: string | null;
  mySigungu: string | null;
  onSelect: (sigungu: string | null) => void;
  onClose: () => void;
};

let cachedSigungu: string[] | null = null;

// 동네 목록에서 구 이름만 한 번 뽑아 둔다
async function loadSigunguList(): Promise<string[]> {
  if (cachedSigungu) return cachedSigungu;
  const { data } = await supabase.from('neighborhoods').select('sigungu');
  cachedSigungu = [...new Set((data ?? []).map((n) => n.sigungu))].sort((a, b) => a.localeCompare(b, 'ko'));
  return cachedSigungu;
}

// 아래에서 올라오는 지역 고르기 창
export default function RegionPicker({ visible, value, mySigungu, onSelect, onClose }: Props) {
  const [list, setList] = useState<string[]>(cachedSigungu ?? []);

  useEffect(() => {
    if (visible) loadSigunguList().then(setList);
  }, [visible]);

  const options: { key: string; sigungu: string | null; label: string }[] = [
    ...(mySigungu ? [{ key: 'mine', sigungu: mySigungu, label: `내 동네 (${mySigungu})` }] : []),
    { key: 'all', sigungu: null, label: '서울 전체' },
    ...list.filter((s) => s !== mySigungu).map((s) => ({ key: s, sigungu: s, label: s })),
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>지역 선택</Text>
          <Pressable accessibilityLabel="닫기" onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
        </View>
        <FlatList
          data={options}
          keyExtractor={(o) => o.key}
          renderItem={({ item }) => {
            const selected = item.sigungu === value;
            return (
              <Pressable
                onPress={() => {
                  onSelect(item.sigungu);
                  onClose();
                }}
                style={[styles.option, selected && styles.optionSelected]}>
                <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{item.label}</Text>
                {selected ? <Ionicons name="checkmark" size={22} color={colors.primary} /> : null}
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 20,
  },
  optionSelected: {
    backgroundColor: colors.primarySoft,
  },
  optionLabel: {
    fontSize: fontSize.body,
    color: colors.text,
  },
  optionLabelSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
});
