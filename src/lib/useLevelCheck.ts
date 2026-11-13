import { router } from 'expo-router';
import { useCallback } from 'react';

import { useProfile } from '@/lib/profile';

// 활동 후(주문, 살균 신청, 거래 완료 등) 등급을 다시 계산하고, 올랐으면 축하 화면을 띄운다
export function useLevelCheck() {
  const { checkLevel } = useProfile();

  return useCallback(async () => {
    const result = await checkLevel();
    if (result && result.level > result.previous_level && result.level >= 1) {
      router.push({ pathname: '/level-up', params: { level: String(result.level) } });
    }
  }, [checkLevel]);
}
