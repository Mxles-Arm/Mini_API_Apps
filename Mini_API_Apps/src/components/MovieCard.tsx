// ==========================================
// WatchWise — Movie Card Component
// ==========================================

import React from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Movie } from '@/services/tmdb';
import { IMAGE_SIZES } from '@/constants/config';
import { useThemeContext } from '@/context/ThemeContext';
import RatingBadge from './RatingBadge';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const router = useRouter();
  const { colors } = useThemeContext();
  const { width } = useWindowDimensions();
  const CARD_WIDTH = width * 0.36;
  const CARD_HEIGHT = CARD_WIDTH * 1.5;

  const posterUri = movie.poster_path
    ? `${IMAGE_SIZES.poster.medium}${movie.poster_path}`
    : null;

  const year = movie.release_date ? movie.release_date.split('-')[0] : '';

  return (
    <Pressable
      style={({ pressed }) => [styles.container, { width: CARD_WIDTH }, pressed && styles.pressed]}
      onPress={() => router.push(`/movie/${movie.id}`)}
    >
      <View style={[styles.imageContainer, { width: CARD_WIDTH, height: CARD_HEIGHT, backgroundColor: colors.surfaceLight }]}>
        {posterUri ? (
          <Image source={{ uri: posterUri }} style={styles.poster} contentFit="cover" transition={300} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={[styles.placeholderText, { color: colors.textMuted }]}>No Image</Text>
          </View>
        )}
        <View style={styles.ratingContainer}>
          <RatingBadge rating={movie.vote_average} size="small" />
        </View>
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {movie.title}
      </Text>
      <Text style={[styles.year, { color: colors.textSecondary }]}>{year}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
  },
  ratingContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  year: {
    fontSize: 11,
  },
});
