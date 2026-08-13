import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Root layout. Three things happen here and nowhere else:
 *   1. `import '../global.css'` — boots NativeWind. Without it every
 *      className is a no-op.
 *   2. Providers that must wrap the whole tree.
 *   3. The root Stack; `(tabs)` is the one and only initial route.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" options={{ headerShown: true, title: 'Not found' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
