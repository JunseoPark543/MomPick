import { formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';

export type CouponKind = 'market_amount' | 'market_free_shipping' | 'sterilization_percent' | 'used_fee_percent';

export type UserCoupon = {
  id: string;
  issued_at: string;
  expires_at: string;
  used_at: string | null;
  template: {
    name: string;
    kind: CouponKind;
    value: number;
    min_order: number;
    funded_by: 'platform' | 'seller' | 'shared';
  };
};

export const COUPON_KIND_LABELS: Record<CouponKind, string> = {
  market_amount: '마켓 할인',
  market_free_shipping: '무료배송',
  sterilization_percent: '살균 할인',
  used_fee_percent: '안전결제 수수료 할인',
};

const COLUMNS = 'id, issued_at, expires_at, used_at, template:coupon_templates(name, kind, value, min_order, funded_by)';

// 내 쿠폰 (kinds 를 주면 그 종류 중 지금 쓸 수 있는 것만)
export async function fetchMyCoupons(kinds?: CouponKind[]): Promise<UserCoupon[]> {
  let query = supabase.from('user_coupons').select(COLUMNS).order('expires_at');
  if (kinds) query = query.is('used_at', null).gt('expires_at', new Date().toISOString());
  const { data } = await query.returns<UserCoupon[]>();
  const list = data ?? [];
  return kinds ? list.filter((c) => kinds.includes(c.template.kind)) : list;
}

export function couponBenefit(c: UserCoupon): string {
  const t = c.template;
  if (t.kind === 'market_free_shipping') return '배송비 무료';
  if (t.kind === 'market_amount') return `${formatNumber(t.value)}원 할인`;
  return `${t.value}% 할인`;
}
