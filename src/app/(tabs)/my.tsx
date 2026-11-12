import { StyleSheet, View } from 'react-native';

import AppButton from '@/components/AppButton';
import PlaceholderScreen from '@/components/PlaceholderScreen';
import { supabase } from '@/lib/supabase';

export default function MyScreen() {
  return (
    <PlaceholderScreen title="마이" description={'등급·쿠폰함·내역·설정이\n여기에 들어갈 예정이에요.'}>
      <View style={styles.actions}>
        <AppButton title="로그아웃" variant="text" onPress={() => supabase.auth.signOut()} />
      </View>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: 24,
    alignSelf: 'stretch',
  },
});
