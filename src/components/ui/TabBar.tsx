import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { BookmarkSimple, House, Sparkle, Storefront, User, type Icon } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/tokens';

import { Text } from './Text';

export type TabRole = 'user' | 'establishment';

type TabConfig = { route: string; label: string; icon: Icon; highlight?: boolean };

const tabsByRole: Record<TabRole, TabConfig[]> = {
  user: [
    { route: 'feed', label: 'Feed', icon: House },
    { route: 'recommend', label: 'Indicação', icon: Sparkle, highlight: true },
    { route: 'saved', label: 'Salvos', icon: BookmarkSimple },
    { route: 'profile', label: 'Perfil', icon: User },
  ],
  establishment: [
    { route: 'region-feed', label: 'Feed da região', icon: House },
    { route: 'recommend-setup', label: 'Indicação', icon: Sparkle, highlight: true },
    { route: 'place-profile', label: 'Perfil do local', icon: Storefront },
  ],
};

export function AppTabBar({ role, state, navigation }: BottomTabBarProps & { role: TabRole }) {
  const insets = useSafeAreaInsets();
  const tabs = tabsByRole[role];

  return (
    <View
      className="border-t border-linha"
      style={{ backgroundColor: 'rgba(255,255,255,0.94)', paddingBottom: Math.max(insets.bottom, 12) }}>
      <View className="h-16 flex-row" accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const tab = tabs.find((t) => t.route === route.name);
          if (!tab) return null;
          const focused = state.index === index;
          const TabIcon = tab.icon;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: focused }}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              className="flex-1 items-center justify-center gap-1">
              {tab.highlight ? (
                <View className="h-8 w-14 items-center justify-center rounded-pilula bg-acento">
                  <TabIcon size={20} weight="fill" color={colors['sobre-acento']} />
                </View>
              ) : (
                <TabIcon size={24} weight={focused ? 'fill' : 'regular'} color={focused ? colors.texto : colors['texto-secundario']} />
              )}
              <Text variant="aba" tone={tab.highlight || focused ? 'texto' : 'secundario'}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
