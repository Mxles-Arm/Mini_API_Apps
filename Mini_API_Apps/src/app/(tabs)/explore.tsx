// ==========================================
// WatchWise — Explore Screen
// ==========================================
// Genre grid with color-coded cards

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '@/context/ThemeContext';
import { Genre, getGenres } from '@/services/tmdb';
import GenreCard from '@/components/GenreCard';

export default function ExploreScreen() {
  const { colors } = useThemeContext();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadGenres = async () => {
      try {
        const data = await getGenres();
        if (!cancelled) setGenres(data);
      } catch (error) {
        console.error('Error loading genres:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadGenres();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text style={[styles.title, { color: colors.text }]}>Explore</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Browse movies by genre
        </Text>

        <FlatList
          data={genres}
          renderItem={({ item }) => <GenreCard genre={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
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
  grid: {
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
});
