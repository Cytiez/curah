import { Tabs } from 'expo-router';

import { Chrome } from '@/theme';

/**
 * Tab layout. This uses the default Tabs bar for now; it is replaced by the
 * custom liquid-glass tab bar (mood-tinted) in a later step.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Chrome.background },
        tabBarStyle: {
          backgroundColor: Chrome.surface,
          borderTopColor: Chrome.border,
        },
        tabBarActiveTintColor: Chrome.text,
        tabBarInactiveTintColor: Chrome.textMuted,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Check-in' }} />
      <Tabs.Screen name="feed" options={{ title: 'Circle' }} />
      <Tabs.Screen name="recap" options={{ title: 'Recap' }} />
    </Tabs>
  );
}
