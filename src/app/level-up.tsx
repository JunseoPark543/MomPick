import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AppButton from '@/components/AppButton';
import FormScreen from '@/components/FormScreen';
import { colors, fontSize } from '@/constants/theme';
import { fetchGradeLevels, type GradeLevel } from '@/lib/grades';
import { supabase } from '@/lib/supabase';

type Template = { name: string };

// 등급이 올랐을 때 축하 화면: 새 등급, 받은 쿠폰, 다음 등급 조건
export default function LevelUpScreen() {
  const { level: levelParam } = useLocalSearchParams<{ level: string }>();
  const level = Number(levelParam);
  const [levels, setLevels] = useState<GradeLevel[]>([]);
  const [coupons, setCoupons] = useState<Template[]>([]);

  useEffect(() => {
    fetchGradeLevels().then(setLevels);
    supabase
      .from('coupon_templates')
      .select('name')
      .eq('grant_level', level)
      .eq('is_active', true)
      .returns<Template[]>()
      .then(({ data }) => setCoupons(data ?? []));
  }, [level]);

  const current = levels.find((l) => l.level === level);
  const next = levels.find((l) => l.level === level + 1);

  return (
    <FormScreen>
      <View style={styles.hero}>
        <Text style={styles.emoji}>{current?.emoji ?? '🎉'}</Text>
        <Text style={styles.small}>축하해요!</Text>
        <Text style={styles.title}>
          Lv.{level} {current?.name}이 되었어요
        </Text>
      </View>

      {coupons.length > 0 ? (
        <View style={styles.box}>
          <Text style={styles.boxTitle}>🎁 등급 쿠폰이 지급됐어요</Text>
          {coupons.map((c) => (
            <Text key={c.name} style={styles.boxItem}>
              · {c.name}
            </Text>
          ))}
        </View>
      ) : null}

      {next ? (
        <View style={styles.box}>
          <Text style={styles.boxTitle}>
            다음 등급: {next.name} {next.emoji}
          </Text>
          <Text style={styles.boxItem}>{next.description}</Text>
        </View>
      ) : null}

      <AppButton title="쿠폰함 보기" onPress={() => router.replace('/coupons')} />
      <AppButton title="닫기" variant="text" onPress={() => router.back()} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 32,
  },
  emoji: {
    fontSize: 72,
  },
  small: {
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  box: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  boxTitle: {
    fontSize: fontSize.body,
    fontWeight: '800',
    color: colors.text,
  },
  boxItem: {
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 24,
  },
});
