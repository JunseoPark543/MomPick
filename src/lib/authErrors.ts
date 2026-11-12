import type { AuthError } from '@supabase/supabase-js';

// Supabase 로그인 오류를 사용자에게 보여줄 한국어 문장으로 바꾼다
export function authErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'invalid_credentials':
      return '이메일 또는 비밀번호가 맞지 않아요.';
    case 'user_already_exists':
    case 'email_exists':
      return '이미 가입된 이메일이에요. 로그인해 주세요.';
    case 'weak_password':
      return '비밀번호가 너무 단순해요. 다른 비밀번호를 써 주세요.';
    case 'email_address_invalid':
      return '이메일 주소를 다시 확인해 주세요.';
    case 'email_not_confirmed':
      return '이메일 확인이 아직 안 됐어요. 메일함을 확인해 주세요.';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return '요청이 많아요. 잠시 후 다시 시도해 주세요.';
    default:
      if (error.name === 'AuthRetryableFetchError') {
        return '인터넷 연결을 확인해 주세요.';
      }
      return '문제가 생겼어요. 잠시 후 다시 시도해 주세요.';
  }
}
