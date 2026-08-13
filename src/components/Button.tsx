import { ActivityIndicator, Pressable, Text } from 'react-native';

/**
 * `Pressable` + NativeWind, not `TouchableOpacity` (legacy) and not a
 * UI-kit dependency. Keep the template's component surface tiny — a
 * real app should add its own design system, not inherit ours.
 */
export function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const isOff = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isOff}
      onPress={onPress}
      className={`h-12 flex-row items-center justify-center gap-2 rounded-xl px-5 ${
        isOff ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-brand active:opacity-80'
      }`}>
      {loading ? <ActivityIndicator color="#ffffff" size="small" /> : null}
      <Text className="text-base font-semibold text-brand-fg">{label}</Text>
    </Pressable>
  );
}
