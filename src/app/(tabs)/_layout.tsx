import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { colors, fontSize } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IconName) {
  return ({ color }: { color: ColorValue }) => <Ionicons name={name} size={26} color={color as string} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: fontSize.tabLabel, fontWeight: '600' },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontSize: 20, fontWeight: '700', color: colors.text },
        headerShadowVisible: false,
      }}>
      <Tabs.Screen name="home" options={{ title: '홈', tabBarIcon: tabIcon('home-outline') }} />
      <Tabs.Screen name="community" options={{ title: '동네', tabBarIcon: tabIcon('people-outline') }} />
      <Tabs.Screen name="used" options={{ title: '중고', tabBarIcon: tabIcon('swap-horizontal-outline') }} />
      <Tabs.Screen name="market" options={{ title: '마켓', tabBarIcon: tabIcon('bag-handle-outline') }} />
      <Tabs.Screen name="my" options={{ title: '마이', tabBarIcon: tabIcon('person-outline') }} />
    </Tabs>
  );
}
