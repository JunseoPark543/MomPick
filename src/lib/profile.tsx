import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export type Profile = {
  id: string;
  nickname: string | null;
  neighborhood_code: string | null;
  neighborhood: { sigungu: string; dong: string } | null;
};

type ProfileState = {
  profile: Profile | null;
  // 첫째 아이의 출생 연월 ('YYYY-MM-01'), 없으면 null
  childBirthMonth: string | null;
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
  const [childBirthMonth, setChildBirthMonth] = useState<string | null>(null);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setChildBirthMonth(null);
      return;
    }

    const [profileResult, childResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, nickname, neighborhood_code, neighborhood:neighborhoods(sigungu, dong)')
        .eq('id', userId)
        .single<Profile>(),
      supabase.from('children').select('birth_month').order('created_at').limit(1).maybeSingle(),
    ]);
    setProfile(profileResult.data ?? null);
    setChildBirthMonth(childResult.data?.birth_month ?? null);
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

  const hasChild = childBirthMonth !== null;
  const isLoading = userId !== null && loadedUserId !== userId;
  const isOnboarded = !!profile?.nickname && !!profile.neighborhood_code && hasChild;

  return (
    <ProfileContext.Provider value={{ profile, childBirthMonth, hasChild, isOnboarded, isLoading, refresh }}>
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
