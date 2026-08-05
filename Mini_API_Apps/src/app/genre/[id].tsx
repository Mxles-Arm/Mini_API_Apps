// ==========================================
// WatchWise — Genre Movies Screen
// ==========================================
// Paginated, sortable grid of movies in one genre.

import ErrorState from '@/components/ErrorState';
import MovieCard from '@/components/MovieCard';
import { useThemeContext } from '@/context/ThemeContext';
import { tapFeedback } from '@/services/haptics';
import { Movie, SortOption, getMoviesByGenre } from '@/services/tmdb';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

const GRID_PADDING = 16;
const GRID_GAP = 12;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popularity.desc', label: 'Most popular' },
  { value: 'vote_average.desc', label: 'Highest rated' },
  { value: 'release_date.desc', label: 'Newest' },
  { value: 'revenue.desc', label: 'Highest grossing' },
];

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
  const [sortBy, setSortBy] = useState<SortOption>('popularity.desc');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

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
        const data = await getMoviesByGenre(genreId, 1, sortBy);
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
  }, [id, sortBy, reloadKey]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || page >= totalPages) return;

    const genreId = parseInt(id);
    if (isNaN(genreId)) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await getMoviesByGenre(genreId, nextPage, sortBy);
      setMovies((prev) => {
        // TMDB can repeat titles across pages; keep the list unique.
        const seen = new Set(prev.map((m) => m.id));
        return [...prev, ...data.results.filter((m) => !seen.has(m.id))];
      });
      setPage(nextPage);
    } catch (err) {
      console.error('Error loading more:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [id, page, totalPages, loading, loadingMore, sortBy]);

  const handleSelectSort = useCallback((next: SortOption) => {
    tapFeedback();
    setSortBy(next);
    setSortMenuOpen(false);
  }, []);

  const screenOptions = {
    title: name || 'Genre',
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.text,
  };

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? '';

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

      <View style={styles.sortRow}>
        <Pressable
          onPress={() => setSortMenuOpen((prev) => !prev)}
          style={[styles.sortButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel={`Sort by: ${activeSortLabel}. Tap to change.`}
          hitSlop={8}
        >
          <Ionicons name="swap-vertical" size={15} color={colors.text} />
          <Text style={[styles.sortButtonText, { color: colors.text }]}>{activeSortLabel}</Text>
          <Ionicons
            name={sortMenuOpen ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.textMuted}
          />
        </Pressable>
      </View>

      {sortMenuOpen && (
        <View style={[styles.sortMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {SORT_OPTIONS.map((option) => {
            const active = option.value === sortBy;
            return (
              <Pressable
                key={option.value}
                onPress={() => handleSelectSort(option.value)}
                style={styles.sortOption}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    { color: active ? colors.primary : colors.text },
                    active && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {active && <Ionicons name="checkmark" size={17} color={colors.primary} />}
              </Pressable>
            );
          })}
        </View>
      )}

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
  sortRow: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sortMenu: {
    marginHorizontal: GRID_PADDING,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sortOptionText: {
    fontSize: 14,
  },
  sortOptionTextActive: {
    fontWeight: '700',
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
