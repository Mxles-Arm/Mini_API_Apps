// ==========================================
// WatchWise — Home Screen
// ==========================================
// Trending banner, Now Playing, Top Rated, Upcoming, Popular

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { Movie, getTrending, getNowPlaying, getTopRated, getUpcoming, getPopular } from '@/services/tmdb';
import MovieCard from '@/components/MovieCard';
import Banner from '@/components/Banner';
import RandomPickButton from '@/components/RandomPickButton';

interface MovieSection {
  title: string;
  data: Movie[];
}

export default function HomeScreen() {
  const { colors, toggleTheme, isDark } = useThemeContext();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [sections, setSections] = useState<MovieSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [trendingRes, nowPlayingRes, topRatedRes, upcomingRes, popularRes] = await Promise.all([
        getTrending(),
        getNowPlaying(),
        getTopRated(),
        getUpcoming(),
        getPopular(),
      ]);

      setTrending(trendingRes.results);
      setSections([
        { title: 'Now Playing', data: nowPlayingRes.results },
        { title: 'Top Rated', data: topRatedRes.results },
        { title: 'Upcoming', data: upcomingRes.results },
        { title: 'Popular', data: popularRes.results },
      ]);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.appName, { color: colors.primary }]}>WatchWise</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>What to watch tonight?</Text>
          </View>
          <Pressable onPress={toggleTheme} style={styles.themeButton}>
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
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  themeButton: {
    padding: 8,
    borderRadius: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
  },
});
