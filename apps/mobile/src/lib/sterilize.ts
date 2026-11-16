import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type SterilizeItem = 'stroller' | 'carseat' | 'carrier' | 'toy' | 'bouncer' | 'highchair' | 'etc';

export const STERILIZE_ITEMS: { value: SterilizeItem; label: string; icon: IconName }[] = [
  { value: 'stroller', label: '유모차', icon: 'cart-outline' },
  { value: 'carseat', label: '카시트', icon: 'car-outline' },
  { value: 'carrier', label: '아기띠', icon: 'body-outline' },
  { value: 'toy', label: '장난감', icon: 'cube-outline' },
  { value: 'bouncer', label: '바운서', icon: 'bed-outline' },
  { value: 'highchair', label: '하이체어', icon: 'restaurant-outline' },
  { value: 'etc', label: '기타', icon: 'ellipsis-horizontal' },
];

export const STERILIZE_ITEM_LABELS = Object.fromEntries(STERILIZE_ITEMS.map((i) => [i.value, i.label])) as Record<
  SterilizeItem,
  string
>;

export const STERILIZE_STATUS_LABELS = {
  requested: '신청됨',
  scheduled: '수거 예정',
  done: '살균 완료',
  cancelled: '취소됨',
} as const;
