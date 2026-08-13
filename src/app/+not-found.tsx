import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-white p-6 dark:bg-zinc-950">
      <Text className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        This screen doesn&apos;t exist.
      </Text>
      <Link href="/" className="text-base font-medium text-brand">
        Go to home
      </Link>
    </View>
  );
}
