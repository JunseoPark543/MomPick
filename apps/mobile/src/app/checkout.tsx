import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AddressForm, { EMPTY_ADDRESS, isAddressFilled, type Address } from '@/components/AddressForm';
import AppButton from '@/components/AppButton';
import AppTextInput from '@/components/AppTextInput';
import CouponPicker from '@/components/CouponPicker';
import FormScreen from '@/components/FormScreen';
import PriceRows from '@/components/PriceRows';
import { colors, fontSize } from '@/constants/theme';
import type { UserCoupon } from '@/lib/coupons';
import { formatNumber } from '@/lib/format';
import { shippingFee, type Product } from '@/lib/market';
import { rpcErrorMessage } from '@/lib/rpcError';
import { DEFAULT_SETTINGS, fetchSettings, type AppSettings } from '@/lib/settings';
import { supabase } from '@/lib/supabase';
import { useLevelCheck } from '@/lib/useLevelCheck';

// 주문하기 (데모: 실제 결제 없이 주문만 저장)
export default function CheckoutScreen() {
  const { productId, quantity: quantityParam } = useLocalSearchParams<{ productId: string; quantity?: string }>();
  const quantity = Math.max(1, Number(quantityParam) || 1);
  const levelCheck = useLevelCheck();

  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [memo, setMemo] = useState('');
  const [coupon, setCoupon] = useState<UserCoupon | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    supabase.from('products').select('*').eq('id', productId).maybeSingle<Product>().then(({ data }) => setProduct(data));
    fetchSettings().then(setSettings);
  }, [productId]);

  if (!product) return null;

  // 화면 표시용 계산 (실제 금액은 서버가 다시 계산한다)
  const itemsTotal = product.price * quantity;
  const shipping = shippingFee(itemsTotal, settings);
  const t = coupon?.template;
  const couponDiscount = !t
    ? 0
    : t.kind === 'market_free_shipping'
      ? shipping
      : itemsTotal >= t.min_order
        ? Math.min(t.value, itemsTotal)
        : 0;
  const total = itemsTotal + shipping - couponDiscount;

  async function handlePay() {
    if (!product) return;
    if (!isAddressFilled(address)) {
      setErrorMessage('받는 분, 연락처, 주소를 입력해 주세요.');
      return;
    }
    setPaying(true);
    setErrorMessage('');
    const { data, error } = await supabase.rpc('place_order', {
      p_items: [{ product_id: product.id, quantity }],
      p_coupon_id: coupon?.id ?? null,
      p_recipient_name: address.name,
      p_recipient_phone: address.phone,
      p_address: address.address,
      p_address_detail: address.detail,
      p_memo: memo,
    });
    setPaying(false);
    if (error || !data) {
      setErrorMessage(rpcErrorMessage(error));
      return;
    }
    router.replace({ pathname: '/orders', params: { done: 'order' } });
    levelCheck();
  }

  return (
    <FormScreen>
      <View style={styles.item}>
        <Text style={styles.itemName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.itemQty}>수량 {quantity}개</Text>
      </View>

      <Text style={styles.section}>배송지</Text>
      <AddressForm value={address} onChange={setAddress} />
      <AppTextInput label="배송 메모 (선택)" value={memo} onChangeText={setMemo} placeholder="문 앞에 놓아 주세요" maxLength={100} />

      <Text style={styles.section}>쿠폰</Text>
      <CouponPicker kinds={['market_amount', 'market_free_shipping']} value={coupon} onChange={setCoupon} />
      {t && t.kind === 'market_amount' && itemsTotal < t.min_order ? (
        <Text style={styles.error}>이 쿠폰은 {formatNumber(t.min_order)}원 이상 주문할 때 쓸 수 있어요.</Text>
      ) : null}

      <PriceRows
        rows={[
          { label: '상품 금액', amount: itemsTotal },
          { label: '배송비', amount: shipping },
          { label: '쿠폰 할인', amount: couponDiscount, minus: true },
        ]}
        total={total}
      />
      <Text style={styles.demo}>데모 버전이라 실제로 결제되지 않아요.</Text>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <AppButton title={`${formatNumber(total)}원 결제하기`} onPress={handlePay} loading={paying} />
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
  itemQty: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  section: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
  },
  demo: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  error: {
    fontSize: fontSize.body,
    color: colors.error,
  },
});
