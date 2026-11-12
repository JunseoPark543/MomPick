import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AppButton from '@/components/AppButton';
import AppTextInput from '@/components/AppTextInput';
import CheckRow from '@/components/CheckRow';
import FormScreen from '@/components/FormScreen';
import { colors, fontSize } from '@/constants/theme';
import { authErrorMessage } from '@/lib/authErrors';
import { supabase } from '@/lib/supabase';

const MIN_PASSWORD_LENGTH = 8;

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (!email.trim()) return '이메일을 입력해 주세요.';
    if (password.length < MIN_PASSWORD_LENGTH) return `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상으로 만들어 주세요.`;
    if (password !== passwordConfirm) return '비밀번호가 서로 달라요. 다시 확인해 주세요.';
    if (!adultConfirmed) return '맘픽은 만 19세 이상 보호자만 가입할 수 있어요.';
    if (!termsAgreed) return '이용약관과 개인정보 처리에 동의해 주세요.';
    return null;
  }

  async function handleSignup() {
    const problem = validate();
    if (problem) {
      setErrorMessage(problem);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setInfoMessage('');
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      // 서버에서 이 두 값이 true 여야 가입이 완료된다
      options: { data: { adult_confirmed: true, terms_agreed: true } },
    });
    setLoading(false);

    if (error) {
      setErrorMessage(authErrorMessage(error));
      return;
    }
    // 이메일 확인이 켜져 있으면 바로 로그인되지 않는다
    if (!data.session) {
      setInfoMessage('가입 확인 메일을 보냈어요. 메일의 링크를 누른 뒤 로그인해 주세요.');
    }
    // 바로 로그인되면 자동으로 홈 화면으로 넘어간다
  }

  return (
    <FormScreen>
      <AppTextInput
        label="이메일"
        value={email}
        onChangeText={setEmail}
        placeholder="example@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <AppTextInput
        label="비밀번호"
        value={password}
        onChangeText={setPassword}
        placeholder={`${MIN_PASSWORD_LENGTH}자 이상`}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <AppTextInput
        label="비밀번호 확인"
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        placeholder="한 번 더 입력"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />

      <View style={styles.checks}>
        <CheckRow
          label="만 19세 이상 보호자입니다"
          checked={adultConfirmed}
          onToggle={() => setAdultConfirmed((v) => !v)}
        />
        <CheckRow
          label="이용약관 및 개인정보 처리에 동의합니다"
          checked={termsAgreed}
          onToggle={() => setTermsAgreed((v) => !v)}
        />
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {infoMessage ? <Text style={styles.info}>{infoMessage}</Text> : null}

      <AppButton title="가입하기" onPress={handleSignup} loading={loading} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  checks: {
    gap: 4,
    paddingVertical: 4,
  },
  error: {
    fontSize: fontSize.body,
    color: colors.error,
  },
  info: {
    fontSize: fontSize.body,
    color: colors.text,
  },
});
