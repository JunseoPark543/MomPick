import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export type Profile = {
  id: string;
  nickname: string | null;
  neighborhood_code: string | null;
};

type ProfileState = {
  profile: Profile | null;
  hasChild: boolean;
  // 닉네임·아이 출생 연월·동네를 모두 입력했는지
  isOnboarded: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const ProfileContext = createContext<ProfileState | null>(null);

// 로그인한 회원의 프로필과 시작하기(온보딩) 진행 상태를 앱 전체에 알려준다
export function ProfileProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasChild, setHasChild] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setHasChild(false);
      return;
    }

    const [profileResult, childResult] = await Promise.all([
      supabase.from('profiles').select('id, nickname, neighborhood_code').eq('id', userId).single(),
      supabase.from('children').select('id', { count: 'exact', head: true }),
    ]);
    setProfile(profileResult.data ?? null);
    setHasChild((childResult.count ?? 0) > 0);
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    refresh().then(() => {
      if (!cancelled) setLoadedUserId(userId);
    });
    return () => {
      cancelled = true;
    };
  }, [refresh, userId]);

  const isLoading = userId !== null && loadedUserId !== userId;
  const isOnboarded = !!profile?.nickname && !!profile.neighborhood_code && hasChild;

  return (
    <ProfileContext.Provider value={{ profile, hasChild, isOnboarded, isLoading, refresh }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const value = useContext(ProfileContext);
  if (!value) {
    throw new Error('useProfile 은 ProfileProvider 안에서만 쓸 수 있어요.');
  }
  return value;
}
