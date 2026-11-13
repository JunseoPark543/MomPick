import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize } from '@/constants/theme';
import { conditionsFor, fetchGradeLevels, type GradeLevel } from '@/lib/grades';
import { useProfile } from '@/lib/profile';

type Props = {
  onPress?: () => void;
};

// 내 등급 + 다음 등급까지 남은 조건
export default function GradeCard({ onPress }: Props) {
  const { profile, metrics } = useProfile();
  const [levels, setLevels] = useState<GradeLevel[]>([]);

  useEffect(() => {
    fetchGradeLevels().then(setLevels);
  }, []);

  const level = Math.max(profile?.level ?? 0, 1);
  const current = levels.find((l) => l.level === level);
  const next = levels.find((l) => l.level === level + 1);
  const conditions = next && metrics ? conditionsFor(next.rule, metrics) : null;

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.card}>
      <Text style={styles.small}>{profile?.nickname}님은</Text>
      <Text style={styles.title}>
        Lv.{level} {current?.name ?? ''} {current?.emoji ?? ''}
      </Text>

      {next ? (
        <View style={styles.next}>
          <Text style={styles.nextTitle}>
            다음 등급 {next.name} {next.emoji} — {conditions?.mode === 'any' ? '하나만 하면 돼요' : '모두 해야 해요'}
          </Text>
          {conditions
            ? conditions.items.map((c) => (
                <View key={c.label} style={styles.condition}>
                  <Ionicons
                    name={c.done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={c.done ? '#FFFFFF' : 'rgba(255,255,255,0.7)'}
                  />
                  <Text style={[styles.conditionText, c.done && styles.conditionDone]}>
                    {c.label} ({Math.min(c.current, c.min)}/{c.min})
                  </Text>
                </View>
              ))
            : <Text style={styles.conditionText}>{next.description}</Text>}
        </View>
      ) : (
        <Text style={styles.conditionText}>최고 등급이에요! 숲 맘 특권을 누려 보세요.</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 18,
    backgroundColor: colors.primary,
    gap: 4,
  },
  small: {
    fontSize: fontSize.caption,
    color: 'rgba(255,255,255,0.85)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  next: {
    marginTop: 10,
    gap: 6,
  },
  nextTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  condition: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  conditionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  conditionDone: {
    textDecorationLine: 'line-through',
  },
});
