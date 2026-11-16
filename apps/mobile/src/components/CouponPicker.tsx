import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize } from '@/constants/theme';
import { formatNumber } from '@/lib/format';
import { couponBenefit, fetchMyCoupons, type CouponKind, type UserCoupon } from '@/lib/coupons';

type Props = {
  kinds: CouponKind[];
  value: UserCoupon | null;
  onChange: (coupon: UserCoupon | null) => void;
};

// 지금 쓸 수 있는 내 쿠폰 중 하나를 고른다 (다시 누르면 선택 해제)
export default function CouponPicker({ kinds, value, onChange }: Props) {
  const [coupons, setCoupons] = useState<UserCoupon[] | null>(null);
  const kindsKey = kinds.join(',');

  useEffect(() => {
    fetchMyCoupons(kindsKey.split(',') as CouponKind[]).then(setCoupons);
  }, [kindsKey]);

  if (coupons === null) return null;
  if (coupons.length === 0) return <Text style={styles.empty}>쓸 수 있는 쿠폰이 없어요.</Text>;

  return (
    <View style={styles.list}>
      {coupons.map((c) => {
        const selected = value?.id === c.id;
        return (
          <Pressable
            key={c.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(selected ? null : c)}
            style={[styles.item, selected && styles.itemSelected]}>
            <Ionicons
              name={selected ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selected ? colors.primary : colors.textMuted}
            />
            <View style={styles.text}>
              <Text style={styles.name}>{c.template.name}</Text>
              <Text style={styles.meta}>
                {couponBenefit(c)}
                {c.template.min_order > 0 ? ` · ${formatNumber(c.template.min_order)}원 이상` : ''}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  empty: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  itemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  text: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
