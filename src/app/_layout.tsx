import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PaintSpillOverlay } from '@/features/checkin/PaintSpill';
import { Chrome } from '@/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Chrome.background }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Chrome.background },
          }}
        />
        <PaintSpillOverlay />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
