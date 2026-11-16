import { confirm } from '@/lib/confirm';
import { supabase } from '@/lib/supabase';

// 회원 차단: 차단하면 그 사람의 글·댓글·매물이 안 보이고 서로 채팅할 수 없다.
// 차단했으면 true
export async function blockUser(userId: string, nickname: string | null | undefined): Promise<boolean> {
  const ok = await confirm(
    '차단하기',
    `${nickname ?? '이 회원'}님을 차단할까요?\n이 회원의 글·댓글·매물이 보이지 않고 서로 채팅할 수 없어요. 상대방에게는 알리지 않아요.`,
    '차단',
  );
  if (!ok) return false;
  const { error } = await supabase.from('blocks').insert({ blocked_id: userId });
  // 23505: 이미 차단한 회원
  return !error || error.code === '23505';
}
