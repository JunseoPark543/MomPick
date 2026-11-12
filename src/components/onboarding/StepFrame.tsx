import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize } from '@/constants/theme';

type Props = PropsWithChildren<{
  title: string;
  description?: string;
  // 아래에 고정되는 버튼 영역
  footer: ReactNode;
  // 목록(FlatList)처럼 스스로 스크롤하는 내용이면 false
  scroll?: boolean;
}>;

// 시작하기 각 단계의 공통 틀: 제목 + 내용 + 아래 고정 버튼
export default function StepFrame({ title, description, footer, scroll = true, children }: Props) {
  const heading = (
    <View style={styles.heading}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {scroll ? (
        <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {heading}
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.content]}>
          {heading}
          {children}
        </View>
      )}
      <View style={styles.footer}>{footer}</View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 20,
  },
  heading: {
    gap: 8,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 34,
  },
  description: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 8,
  },
});
