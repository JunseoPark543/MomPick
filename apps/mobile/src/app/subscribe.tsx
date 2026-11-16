import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AddressForm, { EMPTY_ADDRESS, isAddressFilled, type Address } from '@/components/AddressForm';
import AppButton from '@/components/AppButton';
import FormScreen from '@/components/FormScreen';
import SegmentedTabs from '@/components/SegmentedTabs';
import { colors, fontSize } from '@/constants/theme';
import { formatWon } from '@/lib/format';
import type { Product } from '@/lib/market';
import { rpcErrorMessage } from '@/lib/rpcError';
import { supabase } from '@/lib/supabase';
import { useLevelCheck } from '@/lib/useLevelCheck';

type Interval = '1' | '2' | '4';

// 정기 구독 신청 (데모: 실제 정기 결제·배송 없음)
export default function SubscribeScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const levelCheck = useLevelCheck();
  const [product, setProduct] = useState<Product | null>(null);
  const [period, setPeriod] = useState<Interval>('2');
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('products').select('*').eq('id', productId).maybeSingle<Product>().then(({ data }) => setProduct(data));
  }, [productId]);

  if (!product) return null;

  async function handleSubscribe() {
    if (!isAddressFilled(address)) {
      setErrorMessage('받는 분, 연락처, 주소를 입력해 주세요.');
      return;
    }
    setSaving(true);
    setErrorMessage('');
    const { error } = await supabase.rpc('subscribe_product', {
      p_product_id: productId,
      p_interval_weeks: Number(period),
      p_quantity: 1,
      p_recipient_name: address.name,
      p_recipient_phone: address.phone,
      p_address: address.address,
      p_address_detail: address.detail,
    });
    setSaving(false);
    if (error) {
      setErrorMessage(rpcErrorMessage(error));
      return;
    }
    router.replace({ pathname: '/orders', params: { done: 'subscribe' } });
    levelCheck();
  }

  return (
    <FormScreen>
      <View style={styles.item}>
        <Text style={styles.itemName}>{product.name}</Text>
        <Text style={styles.itemPrice}>1회 {formatWon(product.price)}</Text>
      </View>

      <Text style={styles.section}>배송 주기</Text>
      <View style={styles.bleed}>
        <SegmentedTabs<Interval>
          value={period}
          onChange={setPeriod}
          options={[
            { value: '1', label: '매주' },
            { value: '2', label: '2주마다' },
            { value: '4', label: '4주마다' },
          ]}
        />
      </View>

      <Text style={styles.section}>배송지</Text>
      <AddressForm value={address} onChange={setAddress} />

      <Text style={styles.demo}>
        데모 버전이라 실제 정기 결제·배송은 되지 않아요. 언제든 주문 내역에서 해지할 수 있어요.
      </Text>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <AppButton title="정기 구독 시작하기" onPress={handleSubscribe} loading={saving} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  itemName: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
  },
  itemPrice: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  section: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
  },
  bleed: {
    marginHorizontal: -24,
    paddingHorizontal: 8,
  },
  demo: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
  error: {
    fontSize: fontSize.body,
    color: colors.error,
  },
});
