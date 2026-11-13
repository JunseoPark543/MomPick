import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize } from '@/constants/theme';
import { formatWon } from '@/lib/format';

type Row = {
  label: string;
  amount: number;
  // 할인처럼 빼는 금액이면 true
  minus?: boolean;
};

type Props = {
  rows: Row[];
  totalLabel?: string;
  total: number;
};

// 결제 금액 요약표
export default function PriceRows({ rows, totalLabel = '결제 금액', total }: Props) {
  return (
    <View style={styles.box}>
      {rows.map((r) => (
        <View key={r.label} style={styles.row}>
          <Text style={styles.label}>{r.label}</Text>
          <Text style={[styles.amount, r.minus && styles.minus]}>
            {r.minus && r.amount > 0 ? '-' : ''}
            {formatWon(r.amount)}
          </Text>
        </View>
      ))}
      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>{totalLabel}</Text>
        <Text style={styles.total}>{formatWon(total)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  amount: {
    fontSize: fontSize.body,
    color: colors.text,
  },
  minus: {
    color: '#E5243B',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: fontSize.button,
    fontWeight: '700',
    color: colors.text,
  },
  total: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
});
