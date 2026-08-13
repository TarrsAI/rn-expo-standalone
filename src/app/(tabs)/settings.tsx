import Constants from 'expo-constants';
import { Text, useColorScheme } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';

/**
 * Settings placeholder. Exists to prove the tab bar navigates and that
 * a second route renders. Replace with real settings.
 */
export default function SettingsScreen() {
  const scheme = useColorScheme();

  return (
    <Screen>
      <Text className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Settings</Text>
      <Text className="text-base leading-6 text-zinc-600 dark:text-zinc-400">
        Placeholder screen. Routing, dark mode and the shared components all work —
        build on top.
      </Text>

      <Card title="App">
        <Text className="text-zinc-800 dark:text-zinc-200">
          Name: <Text className="font-semibold">{Constants.expoConfig?.name ?? '—'}</Text>
        </Text>
        <Text className="text-zinc-800 dark:text-zinc-200">
          Version:{' '}
          <Text className="font-semibold">{Constants.expoConfig?.version ?? '—'}</Text>
        </Text>
        <Text className="text-zinc-800 dark:text-zinc-200">
          Color scheme: <Text className="font-semibold">{scheme ?? 'unknown'}</Text>
        </Text>
      </Card>
    </Screen>
  );
}
