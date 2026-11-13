import type { UsedStatus } from '@/lib/used';

export type ChatRoom = {
  id: string;
  item_id: string;
  buyer_id: string;
  seller_id: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  item: {
    id: string;
    title: string;
    price: number;
    image_paths: string[];
    status: UsedStatus;
    safe_pay_available: boolean;
  } | null;
  buyer: { nickname: string | null } | null;
  seller: { nickname: string | null } | null;
};

export type ChatMessage = {
  id: number;
  room_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

// 구매자·판매자 연결을 각각 명시한다
export const CHAT_ROOM_COLUMNS =
  'id, item_id, buyer_id, seller_id, last_message, last_message_at, created_at, item:used_items(id, title, price, image_paths, status, safe_pay_available), buyer:profiles!chat_rooms_buyer_id_fkey(nickname), seller:profiles!chat_rooms_seller_id_fkey(nickname)';
