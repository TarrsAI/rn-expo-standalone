import { useState } from 'react';
import { Platform, Text } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { api, API_URL, ApiError } from '@/lib/api';

/**
 * Home. Deliberately does two things only:
 *   1. Proves NativeWind + expo-router + the tab layout render.
 *   2. Proves `lib/api.ts` actually reaches your backend.
 *
 * Delete all of this once you start building. It is a smoke test, not
 * a starting design.
 */
export default function HomeScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ping = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await api<unknown>('/health');
      setResult(`OK — ${JSON.stringify(data).slice(0, 200)}`);
    } catch (err) {
      setResult(
        err instanceof ApiError
          ? `Failed (${err.status || 'network'}) — ${err.message}`
          : String(err),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        rn-expo-standalone
      </Text>
      <Text className="text-base leading-6 text-zinc-600 dark:text-zinc-400">
        Expo Router + TypeScript + NativeWind. This screen is a smoke test —
        edit <Text className="font-mono">src/app/(tabs)/index.tsx</Text> and it
        hot-reloads.
      </Text>

      <Card title="Runtime">
        <Text className="text-zinc-800 dark:text-zinc-200">
          Platform: <Text className="font-semibold">{Platform.OS}</Text>
          {Platform.OS === 'web' ? '  (Tarrs preview = react-native-web)' : ''}
        </Text>
        <Text className="text-zinc-800 dark:text-zinc-200">
          EXPO_PUBLIC_API_URL: <Text className="font-semibold">{API_URL}</Text>
        </Text>
      </Card>

      <Card title="Backend">
        <Text className="text-zinc-600 dark:text-zinc-400">
          Calls <Text className="font-mono">GET {'{API_URL}'}/health</Text> through the
          typed wrapper in <Text className="font-mono">src/lib/api.ts</Text>.
        </Text>
        <Button label="Ping backend" onPress={ping} loading={loading} />
        {result ? (
          <Text className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
            {result}
          </Text>
        ) : null}
      </Card>
    </Screen>
  );
}
