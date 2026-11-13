import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import AppButton from '@/components/AppButton';
import GradeCard from '@/components/GradeCard';
import TopBar from '@/components/TopBar';
import { colors, fontSize } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { fromBirthMonthDate, monthsOld } from '@/lib/childAge';
import { useProfile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import { useLevelCheck } from '@/lib/useLevelCheck';

type IconName = ComponentProps<typeof Ionicons>['name'];

const MENU: { icon: IconName; label: string; href: Href }[] = [
  { icon: 'create-outline', label: '내 정보 수정 (닉네임·아이·동네)', href: '/profile/edit' },
  { icon: 'ticket-outline', label: '쿠폰함', href: '/coupons' },
  { icon: 'receipt-outline', label: '주문·정기 구독 내역', href: '/orders' },
  { icon: 'chatbubbles-outline', label: '중고 채팅·거래', href: '/chats' },
  { icon: 'shield-checkmark-outline', label: '살균 서비스 신청 내역', href: '/sterilize/history' },
  { icon: 'gift-outline', label: '숲 맘 특권 (키즈카페·샘플박스)', href: '/perks' },
  { icon: 'settings-outline', label: '설정 (차단 목록, 약관, 회원 탈퇴)', href: '/settings' },
];

type Badge = { badge: { name: string; emoji: string } | null };

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
    <>
      <View style={styles.card}>
        <Text style={styles.guestTitle}>맘픽에 오신 걸 환영해요</Text>
        <Text style={styles.guestText}>
          로그인하면 동네 엄마들과 글·댓글을 나누고{'\n'}특가와 등급 혜택을 받을 수 있어요.
        </Text>
        <AppButton title="로그인" onPress={() => router.push('/login')} />
        <AppButton title="처음이신가요? 회원가입" variant="text" onPress={() => router.push('/signup')} />
      </View>
      <AppButton
        title="이용약관 · 개인정보처리방침"
        variant="text"
        onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'privacy' } })}
      />
    </>
  );
}

function MemberView() {
  const { profile, childBirthMonth } = useProfile();
  const levelCheck = useLevelCheck();
  const [badges, setBadges] = useState<Badge[]>([]);
  const months = childBirthMonth ? monthsOld(fromBirthMonthDate(childBirthMonth)) : null;

  // 마이 탭에 올 때마다 등급·배지를 다시 계산한다
  useFocusEffect(
    useCallback(() => {
      levelCheck().then(() =>
        supabase
          .from('user_badges')
          .select('badge:badges(name, emoji)')
          .returns<Badge[]>()
          .then(({ data }) => setBadges(data ?? [])),
      );
    }, [levelCheck]),
  );

  return (
    <>
      <Pressable style={styles.card} onPress={() => router.push('/profile/edit')}>
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
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
        {badges.length > 0 ? (
          <View style={styles.badges}>
            {badges.map((b) =>
              b.badge ? (
                <Text key={b.badge.name} style={styles.badge}>
                  {b.badge.emoji} {b.badge.name}
                </Text>
              ) : null,
            )}
          </View>
        ) : null}
      </Pressable>

      <GradeCard />

      <View style={styles.menu}>
        {MENU.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.href)}
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
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    overflow: 'hidden',
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
