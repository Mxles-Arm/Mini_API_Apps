import ErrorState from '@/components/ErrorState';
import MovieRow from '@/components/MovieRow';
import { useThemeContext } from '@/context/ThemeContext';
import {
  addSearchHistoryTerm,
  clearSearchHistory,
  getSearchHistory,
  removeSearchHistoryTerm,
} from '@/services/preferences';
import { Movie, searchMovies } from '@/services/tmdb';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 500;

export default function SearchScreen() {
  const { colors } = useThemeContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  // Guards against a slow earlier request overwriting a newer one.
  const requestIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    getSearchHistory().then((h) => mountedRef.current && setHistory(h));
    return () => {
      mountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const runSearch = useCallback((trimmed: string) => {
    setLoading(true);
    setError(false);
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      try {
        const data = await searchMovies(trimmed);
        if (!mountedRef.current || requestId !== requestIdRef.current) return;
        setResults(data.results);
        setSearched(true);
        // Only remember searches that actually found something.
        if (data.results.length > 0) {
          addSearchHistoryTerm(trimmed).then((h) => mountedRef.current && setHistory(h));
        }
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
        setResults([]);
        setSearched(false);
        setLoading(false);
        setError(false);
        return;
      }

      runSearch(trimmed);
    },
    [runSearch]
  );

  const handleSelectHistoryTerm = useCallback(
    (term: string) => {
      setQuery(term);
      runSearch(term);
    },
    [runSearch]
  );

  const handleRemoveHistoryTerm = useCallback((term: string) => {
    removeSearchHistoryTerm(term).then((h) => mountedRef.current && setHistory(h));
  }, []);

  const handleClearHistory = useCallback(() => {
    clearSearchHistory();
    setHistory([]);
  }, []);

  const retry = useCallback(() => {
    const trimmed = query.trim();
    if (trimmed.length >= MIN_QUERY_LENGTH) runSearch(trimmed);
  }, [query, runSearch]);

  const showingHistory = query.trim().length < MIN_QUERY_LENGTH && history.length > 0;

  const renderEmpty = () => {
    if (loading) return null;
    if (showingHistory) return null;
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

        {showingHistory ? (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={[styles.historyTitle, { color: colors.textSecondary }]}>Recent searches</Text>
              <Pressable
                onPress={handleClearHistory}
                accessibilityRole="button"
                accessibilityLabel="Clear all recent searches"
                hitSlop={8}
              >
                <Text style={[styles.historyClear, { color: colors.primary }]}>Clear</Text>
              </Pressable>
            </View>
            <View style={styles.historyChips}>
              {history.map((term) => (
                <View
                  key={term}
                  style={[styles.historyChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Pressable
                    onPress={() => handleSelectHistoryTerm(term)}
                    accessibilityRole="button"
                    accessibilityLabel={`Search again for ${term}`}
                    style={styles.historyChipLabel}
                  >
                    <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                    <Text style={[styles.historyChipText, { color: colors.text }]} numberOfLines={1}>
                      {term}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleRemoveHistoryTerm(term)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${term} from recent searches`}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={13} color={colors.textMuted} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ) : loading ? (
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
  historySection: {
    paddingHorizontal: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  historyClear: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    paddingRight: 10,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: '100%',
  },
  historyChipLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 180,
  },
  historyChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
