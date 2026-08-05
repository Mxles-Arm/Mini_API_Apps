// ==========================================
// WatchWise — Home Screen
// ==========================================
// Trending banner, Now Playing, Top Rated, Upcoming, Popular

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { tapFeedback } from '@/services/haptics';
import { Movie, getTrending, getNowPlaying, getTopRated, getUpcoming, getPopular } from '@/services/tmdb';
import MovieCard from '@/components/MovieCard';
import Banner from '@/components/Banner';
import RandomPickButton from '@/components/RandomPickButton';
import ErrorState from '@/components/ErrorState';

interface MovieSection {
  title: string;
  data: Movie[];
}

export default function HomeScreen() {
  const { colors, toggleTheme, isDark } = useThemeContext();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [sections, setSections] = useState<MovieSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // Distinguishes a pull-to-refresh (keep content, show inline spinner)
  // from the initial/retry load (show the full-screen spinner).
  const isRefreshRef = useRef(false);

  const retry = useCallback(() => {
    isRefreshRef.current = false;
    setReloadKey((k) => k + 1);
  }, []);

  const onRefresh = useCallback(() => {
    isRefreshRef.current = true;
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (isRefreshRef.current) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(false);
      try {
        const [trendingRes, nowPlayingRes, topRatedRes, upcomingRes, popularRes] =
          await Promise.all([
            getTrending(),
            getNowPlaying(),
            getTopRated(),
            getUpcoming(),
            getPopular(),
          ]);
        if (cancelled) return;

        setTrending(trendingRes.results);
        setSections([
          { title: 'Now Playing', data: nowPlayingRes.results },
          { title: 'Top Rated', data: topRatedRes.results },
          { title: 'Upcoming', data: upcomingRes.results },
          { title: 'Popular', data: popularRes.results },
        ]);
      } catch (err) {
        console.error('Error loading home data:', err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ErrorState onRetry={retry} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.appName, { color: colors.primary }]}>WatchWise</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{'Tonight’s shortlist'}</Text>
          </View>
          <Pressable
            onPress={() => {
              tapFeedback();
              toggleTheme();
            }}
            style={styles.themeButton}
            accessibilityRole="button"
            accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            hitSlop={8}
          >
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} color={colors.text} />
          </Pressable>
        </View>

        {/* Trending Banner */}
        <Banner movies={trending} />

        {/* Random Pick */}
        <RandomPickButton />

        {/* Movie Sections */}
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <FlatList
              data={section.data}
              renderItem={({ item }) => <MovieCard movie={item} />}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          </View>
        ))}

        <View style={{ height: 30 }} />
      </SafeAreaView>
    </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  appName: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 3,
    letterSpacing: 0.3,
  },
  themeButton: {
    padding: 8,
    borderRadius: 20,
  },
  section: {
    marginTop: 26,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
  },
});
