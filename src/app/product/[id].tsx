import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import DealTimer from '@/components/market/DealTimer';
import { ProductImage } from '@/components/market/ProductCard';
import { colors, fontSize } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { formatCountdown, formatNumber, formatWon } from '@/lib/format';
import { dealState, discountRate, type Product } from '@/lib/market';
import { useProfile } from '@/lib/profile';
import { useRequireLogin } from '@/lib/requireLogin';
import { DEFAULT_SETTINGS, fetchSettings, type AppSettings } from '@/lib/settings';
import { supabase } from '@/lib/supabase';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { profile } = useProfile();
  const requireLogin = useRequireLogin();

  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle<Product>()
      .then(({ data }) => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (session) fetchSettings().then(setSettings);
  }, [session]);

  // 오픈 전 상품은 1초마다 남은 시간을 갱신
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  if (!product) return <Text style={styles.missing}>판매가 끝난 상품이에요.</Text>;

  const level = profile?.level ?? 0;
  const deal = dealState(product, level, settings, now);
  const soldOut = product.stock <= 0;
  const canBuy = !soldOut && (deal.kind === 'open' || deal.kind === 'normal');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProductImage product={product} radius={0} />

        <View style={styles.body}>
          <Text style={styles.seller}>{product.seller_name}</Text>
          <Text style={styles.name}>{product.name}</Text>
          {product.review_count > 0 ? (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#F5A623" />
              <Text style={styles.rating}>
                {product.rating} · 후기 {formatNumber(product.review_count)}개
              </Text>
            </View>
          ) : null}

          {product.original_price > product.price ? (
            <Text style={styles.original}>{formatWon(product.original_price)}</Text>
          ) : null}
          <View style={styles.priceRow}>
            {discountRate(product) > 0 ? <Text style={styles.discount}>{discountRate(product)}%</Text> : null}
            <Text style={styles.price}>{formatWon(product.price)}</Text>
          </View>
          <Text style={styles.delivery}>{product.delivery_label}</Text>

          {deal.kind === 'open' && deal.endsAt ? (
            <View style={styles.dealBox}>
              <Text style={styles.dealLabel}>특가 마감까지</Text>
              <DealTimer endsAt={deal.endsAt} />
            </View>
          ) : null}

          {deal.kind === 'upcoming' ? (
            <View style={[styles.dealBox, styles.upcomingBox]}>
              <Text style={styles.dealLabel}>
                {deal.earlyForMe ? '나무 맘 선구매까지' : '특가 오픈까지'} {formatCountdown(deal.myOpensAt - now)}
              </Text>
              {product.early_access && !deal.earlyForMe ? (
                <Text style={styles.earlyHint}>
                  나무 맘부터 {settings.early_access_minutes}분 먼저 살 수 있어요.{'\n'}
                  살균 서비스 이용 + 베스트 글 선정으로 나무 맘이 될 수 있어요.
                </Text>
              ) : null}
            </View>
          ) : null}

          {deal.kind === 'ended' ? <Text style={styles.ended}>특가가 끝났어요.</Text> : null}

          {product.description ? <Text style={styles.description}>{product.description}</Text> : null}

          {canBuy ? (
            <View style={styles.qtyRow}>
              <Text style={styles.qtyLabel}>수량</Text>
              <Pressable
                accessibilityLabel="수량 줄이기"
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={styles.qtyButton}>
                <Ionicons name="remove" size={22} color={colors.text} />
              </Pressable>
              <Text style={styles.qty}>{quantity}</Text>
              <Pressable
                accessibilityLabel="수량 늘리기"
                onPress={() => setQuantity((q) => Math.min(Math.min(product.stock, 99), q + 1))}
                style={styles.qtyButton}>
                <Ionicons name="add" size={22} color={colors.text} />
              </Pressable>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <View style={styles.bottomInner}>
          {product.subscribable ? (
            <View style={styles.bottomButton}>
              <AppButton
                title="정기 구독"
                variant="text"
                onPress={() =>
                  requireLogin(() => router.push({ pathname: '/subscribe', params: { productId: product.id } }))
                }
              />
            </View>
          ) : null}
          <View style={[styles.bottomButton, styles.buyButton]}>
            <AppButton
              title={soldOut ? '품절' : canBuy ? `${formatWon(product.price * quantity)} 구매하기` : '오픈 전이에요'}
              disabled={!canBuy}
              onPress={() =>
                requireLogin(() =>
                  router.push({ pathname: '/checkout', params: { productId: product.id, quantity: String(quantity) } }),
                )
              }
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  missing: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 64,
  },
  content: {
    paddingBottom: 24,
  },
  body: {
    padding: 16,
    gap: 6,
  },
  seller: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  original: {
    fontSize: 15,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  discount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#E5243B',
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  delivery: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    color: '#2A6FDB',
  },
  dealBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF0F1',
  },
  upcomingBox: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: '#E5F4EA',
  },
  dealLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  earlyHint: {
    fontSize: 14,
    color: '#2F7A4F',
    lineHeight: 21,
  },
  ended: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    marginTop: 10,
  },
  description: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 26,
    marginTop: 12,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  qtyLabel: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.text,
  },
  qtyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: fontSize.button,
    fontWeight: '700',
    color: colors.text,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  bottomInner: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bottomButton: {
    flex: 1,
  },
  buyButton: {
    flex: 2,
  },
});
