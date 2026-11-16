import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize } from '@/constants/theme';
import { COUPON_KIND_LABELS, couponBenefit, fetchMyCoupons, type UserCoupon } from '@/lib/coupons';
import { formatNumber } from '@/lib/format';

// 쿠폰함: 쓸 수 있는 쿠폰과 사용·만료된 쿠폰
export default function CouponsScreen() {
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchMyCoupons().then(setCoupons);
    }, []),
  );

  const now = Date.now();
  const usable = coupons.filter((c) => !c.used_at && new Date(c.expires_at).getTime() > now);
  const past = coupons.filter((c) => !usable.includes(c));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.section}>쓸 수 있는 쿠폰 {usable.length}장</Text>
      {usable.length === 0 ? <Text style={styles.empty}>등급이 오르면 쿠폰이 지급돼요.</Text> : null}
      {usable.map((c) => (
        <CouponCard key={c.id} coupon={c} />
      ))}

      {past.length > 0 ? <Text style={styles.section}>사용·만료</Text> : null}
      {past.map((c) => (
        <CouponCard key={c.id} coupon={c} faded />
      ))}
    </ScrollView>
  );
}

function CouponCard({ coupon, faded = false }: { coupon: UserCoupon; faded?: boolean }) {
  const t = coupon.template;
  const expires = new Date(coupon.expires_at);
  return (
    <View style={[styles.card, faded && styles.faded]}>
      <View style={styles.benefitBox}>
        <Text style={styles.benefit}>{couponBenefit(coupon)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.kind}>{COUPON_KIND_LABELS[t.kind]}</Text>
        <Text style={styles.name}>{t.name}</Text>
        <Text style={styles.meta}>
          {t.min_order > 0 ? `${formatNumber(t.min_order)}원 이상 · ` : ''}
          {coupon.used_at ? '사용함' : `${expires.getMonth() + 1}월 ${expires.getDate()}일까지`}
        </Text>
      </View>
    </View>
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
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
  },
  empty: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
  },
  faded: {
    opacity: 0.45,
  },
  benefitBox: {
    width: 110,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  benefit: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
  },
  info: {
    flex: 1,
    padding: 14,
    gap: 2,
  },
  kind: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  name: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
