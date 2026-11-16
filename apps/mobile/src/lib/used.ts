import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { supabase } from '@/lib/supabase';

export type UsedCategory = 'stroller' | 'carseat' | 'carrier' | 'toy' | 'clothes' | 'feeding' | 'book' | 'etc';
export type UsedCondition = 'new' | 'like_new' | 'good' | 'used';
export type UsedStatus = 'selling' | 'reserved' | 'sold';

export const USED_CATEGORY_LABELS: Record<UsedCategory, string> = {
  stroller: '유모차',
  carseat: '카시트',
  carrier: '아기띠',
  toy: '장난감',
  clothes: '의류',
  feeding: '수유용품',
  book: '책·교구',
  etc: '기타',
};
export const USED_CATEGORIES = Object.keys(USED_CATEGORY_LABELS) as UsedCategory[];

export const CONDITION_LABELS: Record<UsedCondition, string> = {
  new: '새 상품',
  like_new: '거의 새것',
  good: '사용감 적음',
  used: '사용감 있음',
};
export const CONDITIONS = Object.keys(CONDITION_LABELS) as UsedCondition[];

export const STATUS_LABELS: Record<UsedStatus, string> = {
  selling: '판매중',
  reserved: '예약중',
  sold: '거래완료',
};

export type UsedItem = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: UsedCategory;
  price: number;
  condition: UsedCondition;
  size: string | null;
  usage_period: string | null;
  safe_pay_available: boolean;
  image_paths: string[];
  status: UsedStatus;
  chat_count: number;
  created_at: string;
  seller: { nickname: string | null } | null;
  neighborhood: { sigungu: string; dong: string };
};

// 판매자 연결을 명시한다 (구매자 연결과 헷갈리지 않게)
export const USED_COLUMNS =
  'id, seller_id, title, description, category, price, condition, size, usage_period, safe_pay_available, image_paths, status, chat_count, created_at, seller:profiles!used_items_seller_id_fkey(nickname), neighborhood:neighborhoods!inner(sigungu, dong)';

const BUCKET = 'used-images';
export const MAX_IMAGES = 10;

export function usedImageUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// 사진을 1280px로 줄이고 JPEG로 다시 저장해 올린다.
// 다시 저장하면서 사진 속 촬영 위치(GPS) 같은 정보가 빠진다.
export async function uploadUsedImage(userId: string, uri: string): Promise<string> {
  const rendered = await ImageManipulator.manipulate(uri).resize({ width: 1280 }).renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.7 });
  const body = await (await fetch(saved.uri)).arrayBuffer();

  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, { contentType: 'image/jpeg' });
  if (error) throw error;
  return path;
}

export async function deleteUsedImages(paths: string[]) {
  if (paths.length > 0) await supabase.storage.from(BUCKET).remove(paths);
}
