// ==========================================
// WatchWise — Error State
// ==========================================
// Shown whenever a data load fails, so a network drop or API
// error is never silent — the interface says what happened and
// gives a way to retry, in place of an endless spinner.

import { useThemeContext } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export default function ErrorState({
  message = "Couldn't load this. Check your connection and try again.",
  onRetry,
}: ErrorStateProps) {
  const { colors } = useThemeContext();

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={56} color={colors.textMuted} />
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Try again"
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 40,
  },
  message: {
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 20,
    marginTop: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
