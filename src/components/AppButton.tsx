import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSize } from '@/constants/theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'text';
  loading?: boolean;
  disabled?: boolean;
};

// 한 손으로도 누르기 쉬운 큰 버튼
export default function AppButton({ title, onPress, variant = 'primary', loading = false, disabled = false }: Props) {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : colors.primary} />
      ) : (
        <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.textLabel]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: fontSize.button,
    fontWeight: '700',
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
  textLabel: {
    color: colors.primary,
  },
});
