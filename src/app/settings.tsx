import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import AppButton from '@/components/AppButton';
import { colors, fontSize } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { confirm } from '@/lib/confirm';
import { supabase } from '@/lib/supabase';

type Blocked = {
  blocked_id: string;
  blocked: { nickname: string | null } | null;
};

const LEGAL = [
  { doc: 'terms', label: '이용약관' },
  { doc: 'privacy', label: '개인정보처리방침' },
  { doc: 'opensource', label: '오픈소스·데이터 출처' },
] as const;

// 설정: 차단 목록, 약관, 회원 탈퇴
export default function SettingsScreen() {
  const { session } = useAuth();
  const [blocked, setBlocked] = useState<Blocked[]>([]);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('blocks')
      .select('blocked_id, blocked:profiles!blocks_blocked_id_fkey(nickname)')
      .order('created_at', { ascending: false })
      .returns<Blocked[]>();
    setBlocked(data ?? []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function unblock(id: string) {
    await supabase.from('blocks').delete().eq('blocked_id', id);
    load();
  }

  async function deleteAccount() {
    if (!session) return;
    const first = await confirm(
      '회원 탈퇴',
      '탈퇴하면 프로필, 아이 정보, 글·댓글, 매물, 채팅, 주문·신청 내역, 쿠폰이 모두 지워지고 되돌릴 수 없어요.',
      '계속',
    );
    if (!first) return;
    const second = await confirm('정말 탈퇴할까요?', '마지막 확인이에요.', '탈퇴하기');
    if (!second) return;

    setDeleting(true);
    // 내가 올린 매물 사진을 먼저 지운다
    const folder = session.user.id;
    const { data: files } = await supabase.storage.from('used-images').list(folder, { limit: 1000 });
    if (files && files.length > 0) {
      await supabase.storage.from('used-images').remove(files.map((f) => `${folder}/${f.name}`));
    }
    const { error } = await supabase.rpc('delete_my_account');
    setDeleting(false);
    if (error) {
      await confirm('탈퇴하지 못했어요', '잠시 후 다시 시도해 주세요.');
      return;
    }
    await supabase.auth.signOut();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.section}>차단한 회원</Text>
      <View style={styles.card}>
        {blocked.length === 0 ? <Text style={styles.empty}>차단한 회원이 없어요.</Text> : null}
        {blocked.map((b) => (
          <View key={b.blocked_id} style={styles.row}>
            <Text style={styles.rowLabel}>{b.blocked?.nickname ?? '알 수 없음'}</Text>
            <Pressable onPress={() => unblock(b.blocked_id)} hitSlop={8}>
              <Text style={styles.unblock}>차단 해제</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Text style={styles.section}>약관 및 정책</Text>
      <View style={styles.card}>
        {LEGAL.map((l) => (
          <Pressable
            key={l.doc}
            onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: l.doc } })}
            style={styles.row}>
            <Text style={styles.rowLabel}>{l.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <View style={styles.danger}>
        <AppButton title="회원 탈퇴" variant="text" onPress={deleteAccount} loading={deleting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 10,
  },
  section: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMuted,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  empty: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F3ECE6',
  },
  rowLabel: {
    fontSize: fontSize.body,
    color: colors.text,
  },
  unblock: {
    fontSize: fontSize.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  danger: {
    marginTop: 32,
  },
});
