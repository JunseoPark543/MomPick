// ⚠️ 화면 모양을 잡기 위한 임시 예시 데이터.
// 중고는 4단계, 마켓은 5단계에서 Supabase 테이블로 바꾸고 이 파일은 지운다.
import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type UsedItem = {
  id: string;
  title: string;
  price: number; // 0 이면 나눔
  dong: string;
  minutesAgo: number;
  status: 'selling' | 'reserved' | 'sold';
  likes: number;
  chats: number;
  icon: IconName;
  tint: string;
};

export const USED_CATEGORIES = ['전체', '유모차', '카시트', '아기띠', '장난감', '의류', '수유용품', '책·교구'];

export const SAMPLE_USED_ITEMS: UsedItem[] = [
  { id: 'u1', title: '절충형 유모차 (사용 6개월, 상태 좋아요)', price: 180000, dong: '역삼1동', minutesAgo: 3, status: 'selling', likes: 12, chats: 3, icon: 'cart-outline', tint: '#FDE7E8' },
  { id: 'u2', title: '회전형 카시트 신생아~4세', price: 95000, dong: '대치2동', minutesAgo: 25, status: 'reserved', likes: 8, chats: 5, icon: 'car-outline', tint: '#E6F0FB' },
  { id: 'u3', title: '힙시트 아기띠 그레이', price: 30000, dong: '도곡1동', minutesAgo: 60, status: 'selling', likes: 4, chats: 1, icon: 'body-outline', tint: '#EEF6E8' },
  { id: 'u4', title: '원목 블록 장난감 세트 나눔해요', price: 0, dong: '역삼2동', minutesAgo: 120, status: 'selling', likes: 21, chats: 9, icon: 'cube-outline', tint: '#FFF3DB' },
  { id: 'u5', title: '아기 내복 80사이즈 5벌 일괄', price: 15000, dong: '개포1동', minutesAgo: 240, status: 'sold', likes: 2, chats: 2, icon: 'shirt-outline', tint: '#F1EAFB' },
  { id: 'u6', title: '젖병 소독기 + 건조기', price: 40000, dong: '삼성1동', minutesAgo: 600, status: 'selling', likes: 6, chats: 0, icon: 'flask-outline', tint: '#E3F5F5' },
  { id: 'u7', title: '전집 그림책 60권', price: 70000, dong: '역삼1동', minutesAgo: 1440, status: 'selling', likes: 15, chats: 4, icon: 'book-outline', tint: '#FDECE2' },
];

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
