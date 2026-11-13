import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import ProductThumb from '@/components/ProductThumb';
import { colors } from '@/constants/theme';
import { formatNumber, formatWon } from '@/lib/format';
import { discountRate, type Product } from '@/lib/market';

type Props = {
  product: Product;
  width?: number;
};

// 마켓 상품 카드: 사진 / 이름 / 원래 가격 / 할인율+가격 / 배송 / 별점
export default function ProductCard({ product, width }: Props) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      style={({ pressed }) => [styles.card, width ? { width, flex: 0 } : null, pressed && styles.pressed]}>
      <View>
        <ProductImage product={product} />
        {product.early_access ? (
          <View style={styles.earlyBadge}>
            <Text style={styles.earlyText}>나무 맘 먼저</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      {product.original_price > product.price ? (
        <Text style={styles.original}>{formatWon(product.original_price)}</Text>
      ) : null}
      <View style={styles.priceRow}>
        {discountRate(product) > 0 ? <Text style={styles.discount}>{discountRate(product)}%</Text> : null}
        <Text style={styles.price}>{formatWon(product.price)}</Text>
      </View>
      <Text style={styles.delivery}>{product.delivery_label}</Text>
      {product.review_count > 0 ? (
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={13} color="#F5A623" />
          <Text style={styles.rating}>
            {product.rating} ({formatNumber(product.review_count)})
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function ProductImage({ product, radius = 8 }: { product: Product; radius?: number }) {
  if (product.image_url) {
    return <Image source={{ uri: product.image_url }} style={[styles.image, { borderRadius: radius }]} />;
  }
  return <ProductThumb icon={product.icon} tint={product.tint} size="100%" radius={radius} />;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 3,
  },
  pressed: {
    opacity: 0.8,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F3ECE6',
  },
  earlyBadge: {
    position: 'absolute',
    left: 6,
    top: 6,
    backgroundColor: '#2F7A4F',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  earlyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
    marginTop: 6,
  },
  original: {
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  discount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#E5243B',
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  delivery: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2A6FDB',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
