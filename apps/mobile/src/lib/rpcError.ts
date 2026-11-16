import type { PostgrestError } from '@supabase/supabase-js';

// 서버 함수가 보낸 한국어 안내(raise exception)는 그대로, 그 밖의 오류는 일반 문구로
export function rpcErrorMessage(error: PostgrestError | null): string {
  if (!error) return '';
  if (error.code === 'P0001' && error.message) return error.message;
  return '처리하지 못했어요. 잠시 후 다시 시도해 주세요.';
}
