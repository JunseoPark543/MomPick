import { supabase } from '@/lib/supabase';

// app_settings 표의 운영 설정값 (로그인 회원만 읽을 수 있어 비회원은 기본값을 쓴다)
export type AppSettings = {
  early_access_min_level: number;
  early_access_minutes: number;
  used_safe_pay_fee_rate: number;
  used_fee_discount_by_level: Record<string, number>;
  market_shipping_fee: number;
  market_free_shipping_min: number;
  sterilization_price_per_item: number;
  perk_min_level: number;
};

export const DEFAULT_SETTINGS: AppSettings = {
  early_access_min_level: 3,
  early_access_minutes: 30,
  used_safe_pay_fee_rate: 0.035,
  // DB(app_settings)에 넣은 초기값과 같게 맞춰 둔다 (비회원 화면용)
  used_fee_discount_by_level: { '1': 0, '2': 10, '3': 20, '4': 30 },
  market_shipping_fee: 3000,
  market_free_shipping_min: 30000,
  sterilization_price_per_item: 15000,
  perk_min_level: 4,
};

export async function fetchSettings(): Promise<AppSettings> {
  const { data } = await supabase.from('app_settings').select('key, value');
  const loaded = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  return { ...DEFAULT_SETTINGS, ...loaded };
}
