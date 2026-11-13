// ⚠️ 화면 모양을 잡기 위한 임시 예시 데이터.
// 마켓은 5단계에서 Supabase 테이블로 바꾸고 이 파일은 지운다.
import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type MarketProduct = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  delivery: string;
  icon: IconName;
  tint: string;
  // 나무 맘 이상 먼저 구매 (오픈런)
  earlyAccess?: boolean;
};

export const MARKET_CATEGORIES: { label: string; icon: IconName }[] = [
  { label: '이유식', icon: 'restaurant-outline' },
  { label: '간식', icon: 'ice-cream-outline' },
  { label: '기저귀', icon: 'layers-outline' },
  { label: '물티슈', icon: 'water-outline' },
  { label: '분유', icon: 'nutrition-outline' },
  { label: '목욕', icon: 'sparkles-outline' },
  { label: '장난감', icon: 'happy-outline' },
  { label: '살균', icon: 'shield-checkmark-outline' },
];

export const SAMPLE_DEALS: MarketProduct[] = [
  { id: 'm1', name: '유기농 한우 진밥 이유식 중기 7팩', price: 25900, originalPrice: 34900, rating: 4.8, reviews: 1284, delivery: '내일 도착', icon: 'restaurant-outline', tint: '#FDE7E8', earlyAccess: true },
  { id: 'm2', name: '프리미엄 밴드형 기저귀 4단계 3팩', price: 39900, originalPrice: 52000, rating: 4.7, reviews: 3921, delivery: '내일 도착', icon: 'layers-outline', tint: '#E6F0FB' },
  { id: 'm3', name: '무향 아기 물티슈 캡형 100매 10팩', price: 12900, originalPrice: 19800, rating: 4.9, reviews: 8710, delivery: '무료배송', icon: 'water-outline', tint: '#E3F5F5' },
  { id: 'm4', name: '쌀떡뻥 아기과자 6종 세트', price: 9900, originalPrice: 13500, rating: 4.6, reviews: 562, delivery: '내일 도착', icon: 'ice-cream-outline', tint: '#FFF3DB', earlyAccess: true },
  { id: 'm5', name: '젖병 세정제 500ml 2개', price: 11800, originalPrice: 15600, rating: 4.7, reviews: 1033, delivery: '무료배송', icon: 'flask-outline', tint: '#EEF6E8' },
  { id: 'm6', name: '아기 바스 & 샴푸 올인원 400ml', price: 14500, originalPrice: 21000, rating: 4.8, reviews: 2210, delivery: '내일 도착', icon: 'sparkles-outline', tint: '#F1EAFB' },
];

// 오늘의 특가 마감 시각 (오늘 밤 12시)
export function todayDealEndsAt(): number {
  const end = new Date();
  end.setHours(24, 0, 0, 0);
  return end.getTime();
}

export function discountRate(p: MarketProduct): number {
  return Math.round((1 - p.price / p.originalPrice) * 100);
}
