import { router } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import AppButton from '@/components/AppButton';
import AppTextInput from '@/components/AppTextInput';
import FormScreen from '@/components/FormScreen';
import { colors, fontSize } from '@/constants/theme';
import { authErrorMessage } from '@/lib/authErrors';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setErrorMessage('이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);

    // 성공하면 로그인 상태가 바뀌면서 자동으로 홈 화면으로 넘어간다
    if (error) {
      setErrorMessage(authErrorMessage(error));
    }
  }

  return (
    <FormScreen>
      <View style={styles.hero}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="맘픽"
        />
        <Text style={styles.tagline}>우리 동네 엄마들과 함께하는 육아</Text>
      </View>

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
        placeholder="비밀번호"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={handleLogin}
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <AppButton title="로그인" onPress={handleLogin} loading={loading} />
      <AppButton title="처음이신가요? 회원가입" variant="text" onPress={() => router.push('/signup')} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
    gap: 16,
  },
  logo: {
    width: 180,
    height: 101,
  },
  tagline: {
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  error: {
    fontSize: fontSize.body,
    color: colors.error,
  },
});
