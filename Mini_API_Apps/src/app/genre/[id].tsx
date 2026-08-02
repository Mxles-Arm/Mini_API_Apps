// ==========================================
// WatchWise — Genre Movies Screen
// ==========================================
// Paginated grid of movies in one genre.

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';
import { Movie, getMoviesByGenre } from '@/services/tmdb';
import MovieCard from '@/components/MovieCard';
import ErrorState from '@/components/ErrorState';

const GRID_PADDING = 16;
const GRID_GAP = 12;

export default function GenreMoviesScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { colors } = useThemeContext();
  const { width } = useWindowDimensions();

  const cardWidth = (width - GRID_PADDING * 2 - GRID_GAP) / 2;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    const loadMovies = async () => {
      const genreId = parseInt(id);
      if (isNaN(genreId)) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(false);
        const data = await getMoviesByGenre(genreId, 1);
        if (cancelled) return;
        setMovies(data.results);
        setTotalPages(data.total_pages);
        setPage(1);
      } catch (err) {
        console.error('Error loading genre movies:', err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMovies();
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || page >= totalPages) return;

    const genreId = parseInt(id);
    if (isNaN(genreId)) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await getMoviesByGenre(genreId, nextPage);
      setMovies((prev) => {
        // TMDB can repeat titles across pages; keep the list unique.
        const seen = new Set(prev.map((m) => m.id));
        return [...prev, ...data.results.filter((m) => !seen.has(m.id))];
      });
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [id, page, totalPages, loading, loadingMore]);

  const screenOptions = {
    title: name || 'Genre',
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.text,
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={screenOptions} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={screenOptions} />
        <ErrorState onRetry={retry} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={screenOptions} />
      <FlatList
        data={movies}
        renderItem={({ item }) => <MovieCard movie={item} width={cardWidth} spacing={false} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
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
    padding: GRID_PADDING,
    paddingBottom: 30,
  },
  row: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  footer: {
    paddingVertical: 20,
  },
});
