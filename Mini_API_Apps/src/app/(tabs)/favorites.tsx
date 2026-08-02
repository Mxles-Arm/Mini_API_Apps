import MovieRow from '@/components/MovieRow';
import { useThemeContext } from '@/context/ThemeContext';
import { getFavorites, removeFavorite } from '@/services/favorites';
import { Movie } from '@/services/tmdb';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FavoritesScreen() {
  const { colors } = useThemeContext();
  const [favorites, setFavorites] = useState<Movie[]>([]);

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {favorites.length === 0
            ? 'Nothing saved yet'
            : `${favorites.length} ${favorites.length === 1 ? 'movie' : 'movies'} saved`}
        </Text>

        <FlatList
          data={favorites}
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
          contentContainerStyle={favorites.length === 0 ? styles.emptyList : styles.list}
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
  title: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.7,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  subtitle: {
    fontSize: 12,
    letterSpacing: 0.3,
    paddingHorizontal: 16,
    marginTop: 3,
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 16,
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
