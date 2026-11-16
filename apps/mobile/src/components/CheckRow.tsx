import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSize } from '@/constants/theme';

type Props = {
  label: string;
  checked: boolean;
  onToggle: () => void;
};

// 누르면 체크되는 한 줄 (약관 동의 등)
export default function CheckRow({ label, checked, onToggle }: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      style={styles.row}>
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={28}
        color={checked ? colors.primary : colors.textMuted}
      />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
  },
  label: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.text,
  },
});
