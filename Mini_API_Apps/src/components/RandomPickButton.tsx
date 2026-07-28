// ==========================================
// WatchWise — Surprise Me (signature element)
// ==========================================
// The app's thesis made tappable: one card, one question,
// one answer. This is where the amber accent is spent —
// everything else on Home stays quiet by comparison.

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getRandomMovie } from '@/services/tmdb';
import { useThemeContext } from '@/context/ThemeContext';

export default function RandomPickButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { colors } = useThemeContext();

  const handlePress = async () => {
    try {
      setLoading(true);
      const movie = await getRandomMovie();
      if (movie?.id) router.push(`/movie/${movie.id}`);
    } catch (error) {
      console.error('Random pick error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Pick a movie for me"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.primary,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
      onPress={handlePress}
      disabled={loading}
    >
      <View style={styles.copy}>
        <Text style={[styles.eyebrow, { color: colors.background }]}>
          {'CAN’T DECIDE'}
        </Text>
        <Text style={[styles.headline, { color: colors.background }]}>
          Pick one for me
        </Text>
      </View>

      <View style={[styles.dial, { borderColor: colors.background }]}>
        {loading ? (
          <ActivityIndicator color={colors.background} size="small" />
        ) : (
          <Ionicons name="shuffle" size={20} color={colors.background} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
    paddingLeft: 18,
    paddingRight: 14,
    paddingVertical: 14,
    borderRadius: 16,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    opacity: 0.72,
  },
  headline: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  dial: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
});
