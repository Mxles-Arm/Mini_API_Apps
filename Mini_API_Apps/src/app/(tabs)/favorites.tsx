import MovieRow from '@/components/MovieRow';
import { useThemeContext } from '@/context/ThemeContext';
import { tapFeedback } from '@/services/haptics';
import { getFavorites, removeFavorite } from '@/services/favorites';
import { FavoritesSort, getSavedFavoritesSort, saveFavoritesSort } from '@/services/preferences';
import { Movie } from '@/services/tmdb';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SORT_OPTIONS: { value: FavoritesSort; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'added', label: 'Recently added', icon: 'time-outline' },
  { value: 'rating', label: 'Highest rated', icon: 'star-outline' },
  { value: 'title', label: 'Title A–Z', icon: 'text-outline' },
  { value: 'year', label: 'Newest release', icon: 'calendar-outline' },
];

const sortMovies = (movies: Movie[], sort: FavoritesSort): Movie[] => {
  const copy = [...movies];
  switch (sort) {
    case 'rating':
      return copy.sort((a, b) => b.vote_average - a.vote_average);
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'year':
      return copy.sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
    case 'added':
    default:
      return copy; // Already newest-first — that's storage order.
  }
};

export default function FavoritesScreen() {
  const { colors } = useThemeContext();
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [sort, setSort] = useState<FavoritesSort>('added');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  useEffect(() => {
    getSavedFavoritesSort().then(setSort);
  }, []);

  const loadFavorites = useCallback(async () => {
    const data = await getFavorites();
    setFavorites(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const handleRemove = useCallback(
    (movie: Movie) => {
      Alert.alert('Remove from favorites?', movie.title, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeFavorite(movie.id);
            loadFavorites();
          },
        },
      ]);
    },
    [loadFavorites]
  );

  const handleSelectSort = useCallback((next: FavoritesSort) => {
    tapFeedback();
    setSort(next);
    setSortMenuOpen(false);
    saveFavoritesSort(next);
  }, []);

  const sorted = useMemo(() => sortMovies(favorites, sort), [favorites, sort]);
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? '';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {favorites.length === 0
                ? 'Nothing saved yet'
                : `${favorites.length} ${favorites.length === 1 ? 'movie' : 'movies'} saved`}
            </Text>
          </View>

          {favorites.length > 1 && (
            <Pressable
              onPress={() => setSortMenuOpen((prev) => !prev)}
              style={[styles.sortButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel={`Sort by: ${activeSortLabel}. Tap to change.`}
              hitSlop={8}
            >
              <Ionicons name="swap-vertical" size={15} color={colors.text} />
              <Text style={[styles.sortButtonText, { color: colors.text }]}>Sort</Text>
            </Pressable>
          )}
        </View>

        {sortMenuOpen && (
          <View style={[styles.sortMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {SORT_OPTIONS.map((option) => {
              const active = option.value === sort;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelectSort(option.value)}
                  style={styles.sortOption}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Ionicons
                    name={option.icon}
                    size={17}
                    color={active ? colors.primary : colors.textSecondary}
                  />
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
          data={sorted}
          renderItem={({ item }) => (
            <MovieRow
              movie={item}
              inlineRating
              trailing={
                <Pressable
                  onPress={() => handleRemove(item)}
                  style={styles.removeButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.title} from favorites`}
                  hitSlop={10}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.accent} />
                </Pressable>
              }
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={sorted.length === 0 ? styles.emptyList : styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={64} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                Your list is empty
              </Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Open any movie and tap Add to favorites to keep it here.
              </Text>
            </View>
          }
        />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 12,
    letterSpacing: 0.3,
    marginTop: 3,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 2,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sortMenu: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sortOptionText: {
    flex: 1,
    fontSize: 14,
  },
  sortOptionTextActive: {
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  emptyList: {
    flexGrow: 1,
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
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
