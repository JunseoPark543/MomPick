import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fontSize } from '@/constants/theme';

type Props = TextInputProps & {
  label: string;
};

// 이름표가 붙은 큰 입력칸
export default function AppTextInput({ label, style, ...inputProps }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.textMuted} style={[styles.input, style]} {...inputProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: fontSize.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
});
