import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import type { AppSettings } from '@/lib/settings';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type ProductCategory = 'babyfood' | 'snack' | 'diaper' | 'wipes' | 'formula' | 'bath' | 'toy' | 'etc';

export type Product = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  seller_name: string;
  price: number;
  original_price: number;
  image_url: string | null;
  icon: IconName;
  tint: string;
  rating: number;
  review_count: number;
  delivery_label: string;
  stock: number;
  is_deal: boolean;
  deal_opens_at: string | null;
  deal_ends_at: string | null;
  early_access: boolean;
  subscribable: boolean;
};

export const MARKET_CATEGORIES: { value: ProductCategory | 'sterilize'; label: string; icon: IconName }[] = [
  { value: 'babyfood', label: '이유식', icon: 'restaurant-outline' },
  { value: 'snack', label: '간식', icon: 'ice-cream-outline' },
  { value: 'diaper', label: '기저귀', icon: 'layers-outline' },
  { value: 'wipes', label: '물티슈', icon: 'water-outline' },
  { value: 'formula', label: '분유', icon: 'nutrition-outline' },
  { value: 'bath', label: '목욕', icon: 'sparkles-outline' },
  { value: 'toy', label: '장난감', icon: 'happy-outline' },
  { value: 'sterilize', label: '살균 신청', icon: 'shield-checkmark-outline' },
];

export function discountRate(p: Pick<Product, 'price' | 'original_price'>): number {
  if (p.original_price <= 0) return 0;
  return Math.round((1 - p.price / p.original_price) * 100);
}

export type DealState =
  | { kind: 'normal' }
  | { kind: 'open'; endsAt: number | null }
  // 아직 오픈 전. myOpensAt: 내가 살 수 있는 시각 (선구매 권한이 있으면 더 빠름)
  | { kind: 'upcoming'; opensAt: number; myOpensAt: number; earlyForMe: boolean }
  | { kind: 'ended' };

// 특가 상품을 지금 살 수 있는지 (서버의 deal_open_for 와 같은 규칙)
export function dealState(p: Product, level: number, settings: AppSettings, now = Date.now()): DealState {
  if (!p.is_deal) return { kind: 'normal' };
  const endsAt = p.deal_ends_at ? new Date(p.deal_ends_at).getTime() : null;
  if (endsAt !== null && now >= endsAt) return { kind: 'ended' };
  if (!p.deal_opens_at) return { kind: 'open', endsAt };

  const opensAt = new Date(p.deal_opens_at).getTime();
  const earlyForMe = p.early_access && level >= settings.early_access_min_level;
  const myOpensAt = earlyForMe ? opensAt - settings.early_access_minutes * 60000 : opensAt;
  if (now >= myOpensAt) return { kind: 'open', endsAt };
  return { kind: 'upcoming', opensAt, myOpensAt, earlyForMe };
}

export function shippingFee(itemsTotal: number, settings: AppSettings): number {
  return itemsTotal >= settings.market_free_shipping_min ? 0 : settings.market_shipping_fee;
}
