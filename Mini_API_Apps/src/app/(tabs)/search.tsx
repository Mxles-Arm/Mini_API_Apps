// ==========================================
// WatchWise — Search Screen
// ==========================================
// Debounced title search. Results render as MovieRow.

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { Movie, searchMovies } from '@/services/tmdb';
import MovieRow from '@/components/MovieRow';
import ErrorState from '@/components/ErrorState';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 500;

export default function SearchScreen() {
  const { colors } = useThemeContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  // Guards against a slow earlier request overwriting a newer one.
  const requestIdRef = useRef(0);
  // The query each page result belongs to, so a stale loadMore can't
  // append page-2 results from a search the user has already replaced.
  const activeQueryRef = useRef('');

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const runSearch = useCallback((trimmed: string) => {
    setLoading(true);
    setError(false);
    activeQueryRef.current = trimmed;
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      try {
        const data = await searchMovies(trimmed, 1);
        if (!mountedRef.current || requestId !== requestIdRef.current) return;
        setResults(data.results);
        setPage(1);
        setTotalPages(data.total_pages);
        setSearched(true);
      } catch (err) {
        console.error('Search error:', err);
        if (mountedRef.current && requestId === requestIdRef.current) {
          setError(true);
        }
      } finally {
        if (mountedRef.current && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);
  }, []);

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      const trimmed = text.trim();
      if (trimmed.length < MIN_QUERY_LENGTH) {
        activeQueryRef.current = '';
        setResults([]);
        setSearched(false);
        setLoading(false);
        setError(false);
        setPage(1);
        setTotalPages(1);
        return;
      }

      runSearch(trimmed);
    },
    [runSearch]
  );

  const retry = useCallback(() => {
    const trimmed = query.trim();
    if (trimmed.length >= MIN_QUERY_LENGTH) runSearch(trimmed);
  }, [query, runSearch]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || error || page >= totalPages) return;
    const trimmed = activeQueryRef.current;
    if (!trimmed) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await searchMovies(trimmed, nextPage);
      // The query may have changed while this request was in flight.
      if (!mountedRef.current || activeQueryRef.current !== trimmed) return;

      setResults((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        return [...prev, ...data.results.filter((m) => !seen.has(m.id))];
      });
      setPage(nextPage);
    } catch (err) {
      console.error('Error loading more search results:', err);
    } finally {
      if (mountedRef.current) setLoadingMore(false);
    }
  }, [loadingMore, loading, error, page, totalPages]);

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.centerContent}>
        <Ionicons
          name={searched ? 'film-outline' : 'search-outline'}
          size={56}
          color={colors.textMuted}
        />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {searched ? `Nothing matches “${query.trim()}”` : 'Search by title'}
        </Text>
        <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
          {searched
            ? 'Check the spelling, or try part of the title.'
            : `Type at least ${MIN_QUERY_LENGTH} letters to start.`}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text style={[styles.title, { color: colors.text }]}>Search</Text>

        <View
          style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search movies..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search movies by title"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => handleSearch('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={16}
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <ErrorState message="Couldn't search right now. Check your connection and try again." onRetry={retry} />
        ) : (
          <FlatList
            data={results}
            renderItem={({ item }) => <MovieRow movie={item} showOverview />}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={
              results.length === 0 ? styles.emptyList : styles.resultList
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={renderEmpty}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator style={styles.footer} color={colors.primary} />
              ) : null
            }
          />
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
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.7,
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
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyHint: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 48,
    marginTop: -4,
  },
  resultList: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  emptyList: {
    flexGrow: 1,
  },
  footer: {
    paddingVertical: 20,
  },
});
