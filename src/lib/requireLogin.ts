import { router } from 'expo-router';
import { useCallback } from 'react';

import { useAuth } from '@/lib/auth';
import { confirm } from '@/lib/confirm';

// 로그인해야 할 수 있는 행동(글쓰기, 좋아요, 댓글, 신고 등)을 감싼다.
// 비회원이면 안내 후 로그인 화면으로 보낸다.
export function useRequireLogin() {
  const { session } = useAuth();

  return useCallback(
    async (action: () => void) => {
      if (session) {
        action();
        return;
      }
      const ok = await confirm('로그인이 필요해요', '맘픽 회원만 할 수 있어요. 로그인할까요?', '로그인');
      if (ok) router.push('/login');
    },
    [session],
  );
}
