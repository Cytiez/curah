import { Tabs } from 'expo-router';

import { GlassTabBar } from '@/components/GlassTabBar';
import { Chrome } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Chrome.background },
      }}
    >
      <Tabs.Screen name="recap" options={{ title: 'Recap' }} />
      <Tabs.Screen name="index" options={{ title: 'Check-in' }} />
      <Tabs.Screen name="feed" options={{ title: 'Circle' }} />
    </Tabs>
  );
}
