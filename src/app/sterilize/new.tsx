import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import AddressForm, { EMPTY_ADDRESS, isAddressFilled, type Address } from '@/components/AddressForm';
import AppButton from '@/components/AppButton';
import AppTextInput from '@/components/AppTextInput';
import CouponPicker from '@/components/CouponPicker';
import FormScreen from '@/components/FormScreen';
import PriceRows from '@/components/PriceRows';
import { colors, fontSize } from '@/constants/theme';
import type { UserCoupon } from '@/lib/coupons';
import { formatNumber } from '@/lib/format';
import { rpcErrorMessage } from '@/lib/rpcError';
import { DEFAULT_SETTINGS, fetchSettings, type AppSettings } from '@/lib/settings';
import { STERILIZE_ITEMS, type SterilizeItem } from '@/lib/sterilize';
import { supabase } from '@/lib/supabase';
import { useLevelCheck } from '@/lib/useLevelCheck';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 내일부터 14일 동안의 날짜
function pickupDays() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
}

function toDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 살균 서비스 신청 (데모: 실제 수거 일정 연동 없음)
export default function SterilizeNewScreen() {
  const levelCheck = useLevelCheck();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [items, setItems] = useState<SterilizeItem[]>([]);
  const [pickupDate, setPickupDate] = useState<string | null>(null);
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [memo, setMemo] = useState('');
  const [coupon, setCoupon] = useState<UserCoupon | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings().then(setSettings);
  }, []);

  const price = items.length * settings.sterilization_price_per_item;
  const discount = coupon ? Math.round((price * coupon.template.value) / 100) : 0;

  function toggleItem(item: SterilizeItem) {
    setItems((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  }

  async function handleSubmit() {
    if (items.length === 0) return setErrorMessage('살균할 품목을 골라 주세요.');
    if (!pickupDate) return setErrorMessage('수거 희망일을 골라 주세요.');
    if (!isAddressFilled(address)) return setErrorMessage('이름, 연락처, 주소를 입력해 주세요.');

    setSaving(true);
    setErrorMessage('');
    const { error } = await supabase.rpc('request_sterilization', {
      p_items: items,
      p_pickup_date: pickupDate,
      p_recipient_name: address.name,
      p_recipient_phone: address.phone,
      p_address: address.address,
      p_address_detail: address.detail,
      p_memo: memo,
      p_coupon_id: coupon?.id ?? null,
    });
    setSaving(false);
    if (error) {
      setErrorMessage(rpcErrorMessage(error));
      return;
    }
    router.replace({ pathname: '/sterilize/history', params: { done: '1' } });
    levelCheck();
  }

  return (
    <FormScreen>
      <Text style={styles.intro}>
        유모차·카시트 등을 집 앞에서 수거해 살균한 뒤 돌려드려요.{'\n'}품목당 {formatNumber(settings.sterilization_price_per_item)}원
      </Text>

      <Text style={styles.section}>살균할 품목</Text>
      <View style={styles.items}>
        {STERILIZE_ITEMS.map((it) => {
          const selected = items.includes(it.value);
          return (
            <Pressable
              key={it.value}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              onPress={() => toggleItem(it.value)}
              style={[styles.itemChip, selected && styles.itemChipSelected]}>
              <Ionicons name={it.icon} size={24} color={selected ? '#FFFFFF' : colors.text} />
              <Text style={[styles.itemLabel, selected && styles.itemLabelSelected]}>{it.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.section}>수거 희망일</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
        {pickupDays().map((d) => {
          const value = toDateString(d);
          const selected = value === pickupDate;
          return (
            <Pressable
              key={value}
              onPress={() => setPickupDate(value)}
              style={[styles.day, selected && styles.daySelected]}>
              <Text style={[styles.dayWeek, selected && styles.dayTextSelected]}>{WEEKDAYS[d.getDay()]}</Text>
              <Text style={[styles.dayNum, selected && styles.dayTextSelected]}>
                {d.getMonth() + 1}/{d.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.section}>수거 주소</Text>
      <AddressForm value={address} onChange={setAddress} />
      <AppTextInput label="요청 사항 (선택)" value={memo} onChangeText={setMemo} placeholder="경비실에 맡겨 둘게요" maxLength={100} />

      <Text style={styles.section}>쿠폰</Text>
      <CouponPicker kinds={['sterilization_percent']} value={coupon} onChange={setCoupon} />

      <PriceRows
        rows={[
          { label: `살균 ${items.length}개 품목`, amount: price },
          { label: '쿠폰 할인', amount: discount, minus: true },
        ]}
        total={price - discount}
      />
      <Text style={styles.demo}>데모 버전이라 실제 결제·수거는 되지 않아요.</Text>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <AppButton title="살균 신청하기" onPress={handleSubmit} loading={saving} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 26,
    backgroundColor: '#E5F4EA',
    borderRadius: 12,
    padding: 16,
  },
  section: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
  },
  items: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  itemChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  itemLabel: {
    fontSize: fontSize.body,
    color: colors.text,
  },
  itemLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  days: {
    gap: 8,
  },
  day: {
    width: 60,
    height: 68,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  daySelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayWeek: {
    fontSize: 13,
    color: colors.textMuted,
  },
  dayNum: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.text,
  },
  dayTextSelected: {
    color: '#FFFFFF',
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
