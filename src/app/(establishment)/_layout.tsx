import { Tabs } from 'expo-router/js-tabs';

import { AppTabBar } from '@/components/ui/TabBar';
import { colors } from '@/theme/tokens';

export default function EstablishmentTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AppTabBar role="establishment" {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.fundo } }}>
      <Tabs.Screen name="region-feed" />
      <Tabs.Screen name="recommend-setup" />
      <Tabs.Screen name="place-profile" />
    </Tabs>
  );
}
