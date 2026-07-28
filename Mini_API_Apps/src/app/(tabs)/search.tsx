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

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 500;

export default function SearchScreen() {
  const { colors } = useThemeContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  // Guards against a slow earlier request overwriting a newer one.
  const requestIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = text.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      try {
        const data = await searchMovies(trimmed);
        if (!mountedRef.current || requestId !== requestIdRef.current) return;
        setResults(data.results);
        setSearched(true);
      } catch (error) {
        console.error('Search error:', error);
        if (mountedRef.current && requestId === requestIdRef.current) {
          setResults([]);
          setSearched(true);
        }
      } finally {
        if (mountedRef.current && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);
  }, []);

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
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
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
});
