import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AppButton from '@/components/AppButton';
import { colors, fontSize } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { COUPON_KIND_LABELS, type CouponKind } from '@/lib/coupons';
import { fetchGradeLevels, type GradeLevel } from '@/lib/grades';
import { useProfile } from '@/lib/profile';
import { DEFAULT_SETTINGS, fetchSettings, type AppSettings } from '@/lib/settings';
import { supabase } from '@/lib/supabase';

type CouponTemplate = {
  name: string;
  kind: CouponKind;
  grant_level: number;
  funded_by: 'platform' | 'seller' | 'shared';
};

// 등급 안내: 등급별 달성 조건과 혜택 (조건·쿠폰·설정값 모두 DB에서 읽는다)
export default function GradesScreen() {
  const { session } = useAuth();
  const { profile } = useProfile();
  const myLevel = session ? Math.max(profile?.level ?? 0, 1) : 0;

  const [levels, setLevels] = useState<GradeLevel[]>([]);
  const [coupons, setCoupons] = useState<CouponTemplate[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetchGradeLevels().then(setLevels);
    supabase
      .from('coupon_templates')
      .select('name, kind, grant_level, funded_by')
      .eq('is_active', true)
      .not('grant_level', 'is', null)
      .returns<CouponTemplate[]>()
      .then(({ data }) => setCoupons(data ?? []));
    // 설정값은 회원만 읽을 수 있어 비회원은 기본값으로 보여준다
    if (session) fetchSettings().then(setSettings);
  }, [session]);

  // 쿠폰 말고 등급에 따라 생기는 혜택
  function specialBenefits(level: number): string[] {
    const list: string[] = [];
    const feeDiscount = settings.used_fee_discount_by_level[String(level)] ?? 0;
    if (feeDiscount > 0) list.push(`중고 안전결제 수수료 ${feeDiscount}% 할인 (항상 적용)`);
    if (level >= settings.early_access_min_level) {
      list.push(`특가 선구매: 오픈 ${settings.early_access_minutes}분 전부터 먼저 구매`);
    }
    if (level >= settings.perk_min_level) {
      list.push('키즈카페 이용권 추첨 응모 (매달)');
      list.push('프라이빗 샘플박스 신청 (매달)');
    }
    return list;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>
        맘픽에서 활동할수록 등급이 올라가요.{'\n'}등급이 오르면 쿠폰이 바로 지급되고, 한 번 오른 등급은 내려가지 않아요.
      </Text>

      {levels.map((g) => {
        const isMine = g.level === myLevel;
        const levelCoupons = coupons.filter((c) => c.grant_level === g.level);
        const specials = specialBenefits(g.level);
        return (
          <View key={g.level} style={[styles.card, isMine && styles.cardMine]}>
            <View style={styles.header}>
              <Text style={styles.emoji}>{g.emoji}</Text>
              <View style={styles.headerText}>
                <Text style={styles.levelLabel}>Lv.{g.level}</Text>
                <Text style={styles.name}>{g.name}</Text>
              </View>
              {isMine ? <Text style={styles.mineBadge}>내 등급</Text> : null}
              {!isMine && g.level < myLevel ? <Text style={styles.doneBadge}>달성</Text> : null}
            </View>

            <Text style={styles.sectionLabel}>달성 조건</Text>
            <Text style={styles.condition}>{g.description}</Text>

            <Text style={styles.sectionLabel}>혜택</Text>
            {levelCoupons.map((c) => (
              <Text key={c.name} style={styles.benefit}>
                🎟️ {c.name} <Text style={styles.kind}>({COUPON_KIND_LABELS[c.kind]})</Text>
              </Text>
            ))}
            {specials.map((s) => (
              <Text key={s} style={styles.benefit}>
                ✨ {s}
              </Text>
            ))}
            {levelCoupons.length === 0 && specials.length === 0 ? (
              <Text style={styles.benefit}>기본 회원 기능</Text>
            ) : null}
          </View>
        );
      })}

      {session ? null : (
        <AppButton title="로그인하고 씨앗 맘 시작하기" onPress={() => router.push('/login')} />
      )}

      <Text style={styles.footnote}>
        혜택 내용은 운영 상황에 따라 바뀔 수 있으며, 바뀔 때는 앱에서 미리 알려드려요.
      </Text>
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
    gap: 12,
  },
  intro: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 26,
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardMine: {
    borderColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  emoji: {
    fontSize: 36,
  },
  headerText: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  mineBadge: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  doneBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2F7A4F',
    backgroundColor: '#E5F4EA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 6,
  },
  condition: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 24,
  },
  benefit: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 26,
  },
  kind: {
    fontSize: 13,
    color: colors.textMuted,
  },
  footnote: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
