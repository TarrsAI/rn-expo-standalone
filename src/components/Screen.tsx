import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Every screen's outer shell: safe-area padding + a scroll container +
 * a max width so the web build (the Tarrs preview pane, and any
 * tablet) doesn't stretch text across 1400px.
 *
 * Use `<Screen>` instead of hand-rolling SafeAreaView per screen —
 * notch/home-indicator insets are easy to get wrong one screen at a
 * time.
 */
export function Screen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32 }}
        className="flex-1">
        <View className="mx-auto w-full max-w-2xl gap-4 px-5">{children}</View>
      </ScrollView>
    </View>
  );
}
