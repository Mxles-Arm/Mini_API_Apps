// ==========================================
// WatchWise — Favorites Screen
// ==========================================
// Saved movies with swipe-to-remove

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';
import { Movie } from '@/services/tmdb';
import { getFavorites, removeFavorite } from '@/services/favorites';
import { IMAGE_SIZES } from '@/constants/config';
import RatingBadge from '@/components/RatingBadge';

export default function FavoritesScreen() {
  const { colors } = useThemeContext();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Movie[]>([]);

  // Reload favorites when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    const data = await getFavorites();
    setFavorites(data);
  };

  const handleRemove = (movie: Movie) => {
    Alert.alert(
      'Remove Favorite',
      `Remove "${movie.title}" from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeFavorite(movie.id);
            loadFavorites();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Movie }) => {
    const posterUri = item.poster_path
      ? `${IMAGE_SIZES.poster.small}${item.poster_path}`
      : null;
    const year = item.release_date ? item.release_date.split('-')[0] : '';

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.surface, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => router.push(`/movie/${item.id}`)}
      >
        <View style={[styles.posterContainer, { backgroundColor: colors.surfaceLight }]}>
          {posterUri ? (
            <Image source={{ uri: posterUri }} style={styles.poster} contentFit="cover" transition={300} />
          ) : (
            <View style={styles.noPoster}>
              <Ionicons name="film-outline" size={24} color={colors.textMuted} />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={[styles.movieTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.year, { color: colors.textSecondary }]}>{year}</Text>
          <RatingBadge rating={item.vote_average} size="small" />
        </View>
        <Pressable onPress={() => handleRemove(item)} style={styles.removeButton}>
          <Ionicons name="trash-outline" size={20} color={colors.accent} />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text style={[styles.title, { color: colors.text }]}>My Favorites</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {favorites.length} {favorites.length === 1 ? 'movie' : 'movies'} saved
        </Text>

        {favorites.length > 0 ? (
          <FlatList
            data={favorites}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={70} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              No favorites yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Tap the heart icon on any movie to save it here
            </Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  subtitle: {
    fontSize: 13,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  posterContainer: {
    width: 65,
    height: 95,
    borderRadius: 8,
    overflow: 'hidden',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  noPoster: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  movieTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  year: {
    fontSize: 12,
    marginBottom: 4,
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
