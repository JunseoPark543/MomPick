import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';

type Props = {
  icon: ComponentProps<typeof Ionicons>['name'];
  tint: string;
  size?: DimensionValue;
  radius?: number;
};

// 상품 사진 자리 (실제 사진 업로드 전까지 아이콘으로 대신)
export default function ProductThumb({ icon, tint, size = 110, radius = 12 }: Props) {
  return (
    <View style={[styles.box, { width: size, aspectRatio: 1, borderRadius: radius, backgroundColor: tint }]}>
      <Ionicons name={icon} size={40} color="rgba(43,37,35,0.45)" />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
