import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { formatCountdown } from '@/lib/format';

type Props = {
  endsAt: number;
};

// '02:15:09 남음' 처럼 1초마다 줄어드는 시계
export default function DealTimer({ endsAt }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return <Text style={styles.timer}>{formatCountdown(endsAt - now)} 남음</Text>;
}

const styles = StyleSheet.create({
  timer: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E5243B',
    fontVariant: ['tabular-nums'],
  },
});
