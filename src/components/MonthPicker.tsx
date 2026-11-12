import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize } from '@/constants/theme';
import { currentYearMonth, isFuture, type YearMonth } from '@/lib/childAge';

const YEARS_BACK = 2; // 올해 포함 3년 (0~24개월 이상을 모두 고를 수 있음)
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

type Props = {
  value: YearMonth | null;
  onChange: (value: YearMonth) => void;
};

// 연도 버튼 + 월 버튼으로 출생 연월을 고른다 (미래의 달은 고를 수 없음)
export default function MonthPicker({ value, onChange }: Props) {
  const today = currentYearMonth();
  const years = Array.from({ length: YEARS_BACK + 1 }, (_, i) => today.year - i);
  const selectedYear = value?.year ?? today.year;

  function selectYear(year: number) {
    const month = value?.month ?? today.month;
    // 올해로 바꿨는데 고른 달이 미래라면 이번 달로 맞춘다
    const next = isFuture({ year, month }, today) ? today.month : month;
    onChange({ year, month: next });
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {years.map((year) => (
          <Chip key={year} label={`${year}년`} selected={year === selectedYear} onPress={() => selectYear(year)} />
        ))}
      </View>

      <View style={styles.grid}>
        {MONTHS.map((month) => {
          const disabled = isFuture({ year: selectedYear, month }, today);
          const selected = value?.year === selectedYear && value.month === month;
          return (
            <View key={month} style={styles.gridCell}>
              <Chip
                label={`${month}월`}
                selected={selected}
                disabled={disabled}
                onPress={() => onChange({ year: selectedYear, month })}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

type ChipProps = {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
};

function Chip({ label, selected, disabled = false, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected, disabled && styles.chipDisabled]}>
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridCell: {
    width: '25%',
    padding: 4,
  },
  chip: {
    flexGrow: 1,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipDisabled: {
    opacity: 0.35,
  },
  chipLabel: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.text,
  },
  chipLabelSelected: {
    color: '#FFFFFF',
  },
});
