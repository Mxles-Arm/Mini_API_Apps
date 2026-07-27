// ==========================================
// WatchWise — Random Pick Button
// ==========================================

import React, { useState } from 'react';
import { Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
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
      router.push(`/movie/${movie.id}`);
    } catch (error) {
      console.error('Random pick error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#0D1B2A" size="small" />
      ) : (
        <>
          <Ionicons name="dice" size={18} color="#0D1B2A" />
          <Text style={styles.text}>Random Pick</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    alignSelf: 'center',
    marginVertical: 8,
  },
  text: {
    color: '#0D1B2A',
    fontSize: 14,
    fontWeight: '700',
  },
});
