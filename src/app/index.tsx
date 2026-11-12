import { Redirect } from 'expo-router';

import { useAuth } from '@/lib/auth';
import { useProfile } from '@/lib/profile';

// 앱의 첫 주소('/'). 화면 없이 상태에 맞는 곳으로 보내준다.
// 로그아웃처럼 지금 화면에 더 이상 있을 수 없을 때도 여기로 돌아온다.
export default function Index() {
  const { session, isLoading: authLoading } = useAuth();
  const { isOnboarded, isLoading: profileLoading } = useProfile();

  if (authLoading || profileLoading) return null;
  if (!session) return <Redirect href="/login" />;
  if (!isOnboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/home" />;
}
