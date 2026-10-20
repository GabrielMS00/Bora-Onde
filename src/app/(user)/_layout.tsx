import { Tabs } from 'expo-router/js-tabs';

import { AppTabBar } from '@/components/ui/TabBar';
import { colors } from '@/theme/tokens';

export default function UserTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AppTabBar role="user" {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.fundo } }}>
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="recommend" />
      <Tabs.Screen name="saved" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
