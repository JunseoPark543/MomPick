import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

// 입력 양식 화면의 공통 틀: 키보드가 올라와도 입력칸이 가려지지 않게 한다
type Props = PropsWithChildren<{
  // 위쪽 제목줄(헤더)이 없는 화면이면 false 로 두어 상태바 아래부터 그린다
  hasHeader?: boolean;
}>;

export default function FormScreen({ children, hasHeader = true }: Props) {
  return (
    <SafeAreaView
      style={styles.safe}
      edges={hasHeader ? ['bottom', 'left', 'right'] : ['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    gap: 20,
  },
});
