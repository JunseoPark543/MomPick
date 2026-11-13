import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import AppButton from '@/components/AppButton';
import TopBar from '@/components/TopBar';
import { colors, fontSize } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { fromBirthMonthDate, monthsOld } from '@/lib/childAge';
import { confirm } from '@/lib/confirm';
import { useProfile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

type IconName = ComponentProps<typeof Ionicons>['name'];

const MENU: { icon: IconName; label: string }[] = [
  { icon: 'ticket-outline', label: '쿠폰함' },
  { icon: 'receipt-outline', label: '주문 내역' },
  { icon: 'swap-horizontal-outline', label: '중고 거래 내역' },
  { icon: 'shield-checkmark-outline', label: '살균 서비스 신청 내역' },
  { icon: 'happy-outline', label: '아이 정보 수정' },
  { icon: 'settings-outline', label: '설정 (차단 목록, 회원 탈퇴)' },
];

export default function MyScreen() {
  const { session } = useAuth();

  return (
    <View style={styles.container}>
      <TopBar>
        <Text style={styles.heading}>마이</Text>
      </TopBar>
      <ScrollView contentContainerStyle={styles.content}>{session ? <MemberView /> : <GuestView />}</ScrollView>
    </View>
  );
}

function GuestView() {
  return (
    <View style={styles.card}>
      <Text style={styles.guestTitle}>맘픽에 오신 걸 환영해요</Text>
      <Text style={styles.guestText}>
        로그인하면 동네 엄마들과 글·댓글을 나누고{'\n'}특가와 등급 혜택을 받을 수 있어요.
      </Text>
      <AppButton title="로그인" onPress={() => router.push('/login')} />
      <AppButton title="처음이신가요? 회원가입" variant="text" onPress={() => router.push('/signup')} />
    </View>
  );
}

function MemberView() {
  const { profile, childBirthMonth } = useProfile();
  const months = childBirthMonth ? monthsOld(fromBirthMonthDate(childBirthMonth)) : null;

  return (
    <>
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.profileText}>
            <Text style={styles.nickname}>{profile?.nickname}</Text>
            <Text style={styles.profileMeta}>
              {profile?.neighborhood?.sigungu} {profile?.neighborhood?.dong}
              {months !== null ? ` · 아이 ${months}개월` : ''}
            </Text>
          </View>
        </View>

        {/* 등급은 7단계에서 실제 계산으로 교체 */}
        <View style={styles.grade}>
          <Text style={styles.gradeLabel}>Lv.1 씨앗 맘 🌱</Text>
          <Text style={styles.gradeHint}>이유식 첫 구매 또는 중고거래 1회로 싹트 맘이 돼요</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {MENU.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => confirm('준비 중', '곧 만들어질 기능이에요.')}
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}>
            <Ionicons name={item.icon} size={24} color={colors.text} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <AppButton title="로그아웃" variant="text" onPress={() => supabase.auth.signOut()} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  guestText: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    lineHeight: 26,
    marginBottom: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  nickname: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  profileMeta: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  grade: {
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  gradeLabel: {
    fontSize: fontSize.body,
    fontWeight: '800',
    color: colors.primary,
  },
  gradeHint: {
    fontSize: 13,
    color: colors.text,
  },
  menu: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 60,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3ECE6',
  },
  menuPressed: {
    backgroundColor: '#FBF5F0',
  },
  menuLabel: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.text,
  },
});
