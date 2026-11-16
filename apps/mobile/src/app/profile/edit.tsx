import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize } from '@/constants/theme';
import { fromBirthMonthDate, monthsOld } from '@/lib/childAge';
import { useProfile } from '@/lib/profile';

// 내 정보 수정: 닉네임 / 아이 출생 연월 / 동네
export default function ProfileEditScreen() {
  const { profile, childBirthMonth } = useProfile();

  const child = childBirthMonth ? fromBirthMonthDate(childBirthMonth) : null;
  const rows = [
    { field: 'nickname', label: '닉네임', value: profile?.nickname ?? '' },
    {
      field: 'child',
      label: '아이 출생 연월',
      value: child ? `${child.year}년 ${child.month}월생 (${monthsOld(child)}개월)` : '',
    },
    {
      field: 'neighborhood',
      label: '우리 동네',
      value: profile?.neighborhood ? `${profile.neighborhood.sigungu} ${profile.neighborhood.dong}` : '',
    },
  ] as const;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        {rows.map((row) => (
          <Pressable
            key={row.field}
            onPress={() => router.push({ pathname: '/profile/[field]', params: { field: row.field } })}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <View style={styles.text}>
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.value}>{row.value}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
      <Text style={styles.hint}>
        동네를 바꾸면 앞으로 쓰는 글과 매물에 새 동네가 표시돼요. 이미 쓴 글은 그대로예요.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 72,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3ECE6',
  },
  pressed: {
    backgroundColor: '#FBF5F0',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  value: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.text,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
});
