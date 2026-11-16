import { StyleSheet, View } from 'react-native';

import AppTextInput from '@/components/AppTextInput';

export type Address = {
  name: string;
  phone: string;
  address: string;
  detail: string;
};

export const EMPTY_ADDRESS: Address = { name: '', phone: '', address: '', detail: '' };

export function isAddressFilled(a: Address) {
  return !!a.name.trim() && !!a.phone.trim() && !!a.address.trim();
}

type Props = {
  value: Address;
  onChange: (value: Address) => void;
};

// 주문·구독·살균 신청 때만 받는 받는 분/연락처/주소
export default function AddressForm({ value, onChange }: Props) {
  const set = (key: keyof Address) => (text: string) => onChange({ ...value, [key]: text });

  return (
    <View style={styles.container}>
      <AppTextInput label="받는 분" value={value.name} onChangeText={set('name')} placeholder="이름" maxLength={20} />
      <AppTextInput
        label="연락처"
        value={value.phone}
        onChangeText={set('phone')}
        placeholder="010-0000-0000"
        keyboardType="phone-pad"
        maxLength={20}
      />
      <AppTextInput
        label="주소"
        value={value.address}
        onChangeText={set('address')}
        placeholder="도로명 주소"
        maxLength={100}
      />
      <AppTextInput label="상세 주소" value={value.detail} onChangeText={set('detail')} placeholder="동·호수" maxLength={50} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
});
