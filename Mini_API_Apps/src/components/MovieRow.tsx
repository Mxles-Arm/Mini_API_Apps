// ==========================================
// WatchWise — Movie Row (horizontal list card)
// ==========================================
// Shared by Search and Favorites. Both show the same
// poster + title + year unit; they differ only in whether
// the overview shows and what sits in the trailing slot.

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Movie } from '@/services/tmdb';
import { IMAGE_SIZES } from '@/constants/config';
import { useThemeContext } from '@/context/ThemeContext';
import RatingBadge from './RatingBadge';

interface MovieRowProps {
  movie: Movie;
  /** Show the two-line synopsis under the year. */
  showOverview?: boolean;
  /** Rendered at the trailing edge. Defaults to the rating badge. */
  trailing?: React.ReactNode;
  /** Show the rating inline under the year instead of trailing. */
  inlineRating?: boolean;
}

export default function MovieRow({
  movie,
  showOverview = false,
  trailing,
  inlineRating = false,
}: MovieRowProps) {
  const router = useRouter();
  const { colors } = useThemeContext();

  const posterUri = movie.poster_path
    ? `${IMAGE_SIZES.poster.small}${movie.poster_path}`
    : null;
  const year = movie.release_date ? movie.release_date.split('-')[0] : '';

  // The trailing slot sits outside the Pressable: nesting an
  // interactive control inside another produces invalid markup
  // on web and an ambiguous tap target on native.
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={movie.title}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
        onPress={() => router.push(`/movie/${movie.id}`)}
      >
        <View style={[styles.posterContainer, { backgroundColor: colors.surfaceLight }]}>
          {posterUri ? (
            <Image
              source={{ uri: posterUri }}
              style={styles.poster}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={styles.noPoster}>
              <Ionicons name="film-outline" size={24} color={colors.textMuted} />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {movie.title}
          </Text>
          <Text style={[styles.year, { color: colors.textSecondary }]}>{year}</Text>

          {showOverview && (
            <Text style={[styles.overview, { color: colors.textMuted }]} numberOfLines={2}>
              {movie.overview}
            </Text>
          )}

          {inlineRating && <RatingBadge rating={movie.vote_average} size="small" />}
        </View>
      </Pressable>

      {trailing ?? (!inlineRating && <RatingBadge rating={movie.vote_average} size="small" />)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressed: {
    opacity: 0.8,
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
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  year: {
    fontSize: 12,
  },
  overview: {
    fontSize: 11,
    lineHeight: 15,
  },
});
