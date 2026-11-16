import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

// 탭 화면 맨 위에 직접 그리는 제목줄 (상태바 높이만큼 띄운다)
export default function TopBar({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>{children}</View>;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: colors.surface,
  },
});
