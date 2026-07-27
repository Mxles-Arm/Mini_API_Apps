// ==========================================
// WatchWise — Genre Movies Screen
// ==========================================
// Movies filtered by genre

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { Movie, getMoviesByGenre } from '@/services/tmdb';
import { IMAGE_SIZES } from '@/constants/config';
import RatingBadge from '@/components/RatingBadge';

export default function GenreMoviesScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const router = useRouter();
  const { colors } = useThemeContext();
  const { width } = useWindowDimensions();
  const CARD_WIDTH = (width - 48) / 2;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setPage(1);
    loadMovies();
  }, [id]);

  const loadMovies = async () => {
    const genreId = parseInt(id);
    if (isNaN(genreId)) return;
    try {
      setLoading(true);
      const data = await getMoviesByGenre(genreId, 1);
      setMovies(data.results);
    } catch (error) {
      console.error('Error loading genre movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore) return;
    const genreId = parseInt(id);
    if (isNaN(genreId)) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await getMoviesByGenre(genreId, nextPage);
      setMovies((prev) => [...prev, ...data.results]);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const renderMovie = ({ item }: { item: Movie }) => {
    const posterUri = item.poster_path
      ? `${IMAGE_SIZES.poster.medium}${item.poster_path}`
      : null;
    const year = item.release_date ? item.release_date.split('-')[0] : '';

    return (
      <Pressable
        style={({ pressed }) => [styles.card, { width: CARD_WIDTH }, pressed && { opacity: 0.8 }]}
        onPress={() => router.push(`/movie/${item.id}`)}
      >
        <View style={[styles.posterContainer, { height: CARD_WIDTH * 1.5, backgroundColor: colors.surfaceLight }]}>
          {posterUri ? (
            <Image source={{ uri: posterUri }} style={styles.poster} contentFit="cover" transition={300} />
          ) : (
            <View style={styles.noPoster}>
              <Ionicons name="film-outline" size={30} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.ratingContainer}>
            <RatingBadge rating={item.vote_average} size="small" />
          </View>
        </View>
        <Text style={[styles.movieTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.year, { color: colors.textSecondary }]}>{year}</Text>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: name || 'Genre' }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: name || 'Genre',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />
      <FlatList
        data={movies}
        renderItem={renderMovie}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={styles.footer} color={colors.primary} />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    marginHorizontal: 4,
  },
  posterContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
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
  ratingContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  movieTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  year: {
    fontSize: 11,
    marginTop: 2,
  },
  footer: {
    paddingVertical: 20,
  },
});
