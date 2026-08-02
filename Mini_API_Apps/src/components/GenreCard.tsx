// ==========================================
// WatchWise — Genre Card Component
// ==========================================

import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Genre } from '@/services/tmdb';
import { GenreColors, GenreIcons } from '@/constants/colors';

interface GenreCardProps {
  genre: Genre;
}

export default function GenreCard({ genre }: GenreCardProps) {
  const router = useRouter();
  const bgColor = GenreColors[genre.id] || '#607D8B';
  const iconName = GenreIcons[genre.id] || 'film';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Browse ${genre.name} movies`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: bgColor, opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={() => router.push({ pathname: '/genre/[id]', params: { id: genre.id.toString(), name: genre.name } })}
    >
      <Ionicons name={iconName as any} size={28} color="rgba(255,255,255,0.9)" />
      <Text style={styles.name}>{genre.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    height: 100,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    minWidth: '28%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
