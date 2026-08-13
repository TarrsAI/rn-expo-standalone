import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Tabs } from 'expo-router';

/**
 * Classic JS tabs (`expo-router`'s `Tabs`), NOT
 * `expo-router/unstable-native-tabs`. Deliberate: the Tarrs preview
 * pane renders the WEB build, and the classic tab bar is the one that
 * renders identically on web, iOS and Android with no `.web.tsx` fork.
 *
 * Icons come from @expo/vector-icons, which bundles FontAwesome 6
 * **Free**. Never add FA Pro here — this is a public repo and the
 * `.npmrc` token would leak.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#71717a',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="house" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="gear" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
