// ==========================================
// WatchWise — Search Screen
// ==========================================
// Search bar with debounce + result cards

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';
import { Movie, searchMovies } from '@/services/tmdb';
import { IMAGE_SIZES } from '@/constants/config';
import RatingBadge from '@/components/RatingBadge';

export default function SearchScreen() {
  const { colors } = useThemeContext();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const debounceRef = React.useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await searchMovies(text.trim());
        setResults(data.results);
        setSearched(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  const renderMovieItem = ({ item }: { item: Movie }) => {
    const posterUri = item.poster_path
      ? `${IMAGE_SIZES.poster.small}${item.poster_path}`
      : null;
    const year = item.release_date ? item.release_date.split('-')[0] : '';

    return (
      <Pressable
        style={({ pressed }) => [
          styles.resultCard,
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
        <View style={styles.resultInfo}>
          <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.resultYear, { color: colors.textSecondary }]}>{year}</Text>
          <Text style={[styles.resultOverview, { color: colors.textMuted }]} numberOfLines={2}>
            {item.overview}
          </Text>
        </View>
        <RatingBadge rating={item.vote_average} size="small" />
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text style={[styles.title, { color: colors.text }]}>Search</Text>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search movies..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Results */}
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderMovieItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.resultList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.centerContent}>
            {searched ? (
              <>
                <Ionicons name="sad-outline" size={60} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No movies found</Text>
              </>
            ) : (
              <>
                <Ionicons name="search-outline" size={60} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Find your next movie
                </Text>
              </>
            )}
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
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  },
  resultList: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  resultCard: {
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
  resultInfo: {
    flex: 1,
    gap: 3,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  resultYear: {
    fontSize: 12,
  },
  resultOverview: {
    fontSize: 11,
    lineHeight: 15,
  },
});
