import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ProductThumb from '@/components/ProductThumb';
import { colors } from '@/constants/theme';
import { discountRate, type MarketProduct } from '@/data/sample';
import { formatNumber, formatWon } from '@/lib/format';

type Props = {
  product: MarketProduct;
};

// 마켓 상품 카드: 사진 / 이름 / 할인율+가격 / 원래 가격 / 별점 / 배송
export default function ProductCard({ product }: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View>
        <ProductThumb icon={product.icon} tint={product.tint} size="100%" radius={8} />
        {product.earlyAccess ? (
          <View style={styles.earlyBadge}>
            <Text style={styles.earlyText}>나무 맘 먼저</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.original}>{formatWon(product.originalPrice)}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.discount}>{discountRate(product)}%</Text>
        <Text style={styles.price}>{formatWon(product.price)}</Text>
      </View>
      <Text style={styles.delivery}>{product.delivery}</Text>
      <View style={styles.ratingRow}>
        <Ionicons name="star" size={13} color="#F5A623" />
        <Text style={styles.rating}>
          {product.rating} ({formatNumber(product.reviews)})
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 3,
  },
  pressed: {
    opacity: 0.8,
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
