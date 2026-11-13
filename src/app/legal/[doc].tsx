import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { LEGAL_DOCS, type LegalDoc } from '@/constants/legal';
import { colors, fontSize } from '@/constants/theme';

// 이용약관 / 개인정보처리방침 / 오픈소스 안내 (로그인 없이도 볼 수 있음)
export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: LegalDoc }>();
  const content = LEGAL_DOCS[doc] ?? LEGAL_DOCS.terms;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: content.title }} />
      <Text style={styles.body} selectable>
        {content.body}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: 20,
  },
  body: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 28,
  },
});
