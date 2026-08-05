// ==========================================
// WatchWise — Movie Detail Screen
// ==========================================
// Backdrop, info, overview, cast, recommendations, favorite button.

import CastCard from '@/components/CastCard';
import ErrorState from '@/components/ErrorState';
import MovieCard from '@/components/MovieCard';
import RatingBadge from '@/components/RatingBadge';
import WatchProviders from '@/components/WatchProviders';
import { IMAGE_SIZES } from '@/constants/config';
import { useThemeContext } from '@/context/ThemeContext';
import { isFavorite, toggleFavorite } from '@/services/favorites';
import { successFeedback, tapFeedback } from '@/services/haptics';
import {
  CastMember,
  Movie,
  Video,
  getMovieCredits,
  getMovieDetails,
  getMovieVideos,
  getRecommendedMovies,
  pickTrailer,
} from '@/services/tmdb';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BACKDROP_HEIGHT = 300;

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useThemeContext();
  const { width } = useWindowDimensions();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [recommended, setRecommended] = useState<Movie[]>([]);
  const [trailer, setTrailer] = useState<Video | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openingTrailer, setOpeningTrailer] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    const loadMovieData = async () => {
      const movieId = parseInt(id);
      if (isNaN(movieId)) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(false);
        const [movieData, creditsData, recommendedData, isFav, videos] = await Promise.all([
          getMovieDetails(movieId),
          getMovieCredits(movieId),
          getRecommendedMovies(movieId),
          isFavorite(movieId),
          getMovieVideos(movieId).catch(() => []),
        ]);
        if (cancelled) return;

        setMovie(movieData);
        setCast(creditsData.slice(0, 15));
        setRecommended(recommendedData.results);
        setFavorite(isFav);
        setTrailer(pickTrailer(videos));
      } catch (err) {
        console.error('Error loading movie details:', err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMovieData();
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const handleToggleFavorite = async () => {
    if (!movie) return;
    const result = await toggleFavorite(movie);
    setFavorite(result);
    if (result) {
      successFeedback();
    } else {
      tapFeedback();
    }
  };

  const handleWatchTrailer = async () => {
    if (!trailer || openingTrailer) return;
    tapFeedback();
    try {
      setOpeningTrailer(true);
      await WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${trailer.key}`);
    } finally {
      setOpeningTrailer(false);
    }
  };

  const handleShare = useCallback(async () => {
    if (!movie) return;
    tapFeedback();
    try {
      await Share.share({
        message: `${movie.title} — https://www.themoviedb.org/movie/${movie.id}`,
      });
    } catch (err) {
      console.error('Error sharing movie:', err);
    }
  }, [movie]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ErrorState onRetry={retry} />
      </View>
    );
  }

  const backdropUri = movie.backdrop_path
    ? `${IMAGE_SIZES.backdrop.large}${movie.backdrop_path}`
    : null;
  const posterUri = movie.poster_path
    ? `${IMAGE_SIZES.poster.medium}${movie.poster_path}`
    : null;
  const year = movie.release_date ? movie.release_date.split('-')[0] : '';
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : '';
  const genres = movie.genres?.map((g) => g.name).join(' • ') || '';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Backdrop */}
      <View style={[styles.backdropContainer, { width }]}>
        {backdropUri && (
          <Image source={{ uri: backdropUri }} style={styles.backdrop} contentFit="cover" transition={300} />
        )}
        <LinearGradient
          colors={['transparent', colors.background]}
          style={styles.backdropGradient}
        />
        {/* Back + share buttons */}
        <SafeAreaView edges={['top']} style={styles.topBarContainer}>
          <Pressable
            style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </Pressable>
          <Pressable
            style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel={`Share ${movie.title}`}
            hitSlop={8}
          >
            <Ionicons name="share-outline" size={20} color="#FFF" />
          </Pressable>
        </SafeAreaView>
      </View>

      {/* Movie Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          {/* Poster */}
          <View style={[styles.posterContainer, { backgroundColor: colors.surfaceLight }]}>
            {posterUri && (
              <Image source={{ uri: posterUri }} style={styles.poster} contentFit="cover" transition={300} />
            )}
          </View>

          {/* Details */}
          <View style={styles.details}>
            <Text style={[styles.movieTitle, { color: colors.text }]}>{movie.title}</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {[year, runtime].filter(Boolean).join(' • ')}
            </Text>
            <Text style={[styles.genres, { color: colors.textMuted }]}>{genres}</Text>
            <View style={styles.ratingRow}>
              <RatingBadge rating={movie.vote_average} size="large" />
              <Text style={[styles.voteCount, { color: colors.textMuted }]}>
                {movie.vote_count?.toLocaleString()} votes
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          {trailer && (
            <Pressable
              style={({ pressed }) => [
                styles.trailerButton,
                { backgroundColor: colors.primary, opacity: pressed || openingTrailer ? 0.85 : 1 },
              ]}
              onPress={handleWatchTrailer}
              disabled={openingTrailer}
              accessibilityRole="button"
              accessibilityLabel={`Watch trailer for ${movie.title}`}
            >
              <Ionicons name="play" size={18} color={colors.background} />
              <Text style={[styles.trailerText, { color: colors.background }]}>Trailer</Text>
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.favoriteButton,
              {
                backgroundColor: favorite ? colors.accent : colors.surface,
                borderColor: favorite ? colors.accent : colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={handleToggleFavorite}
            accessibilityRole="button"
            accessibilityState={{ selected: favorite }}
            accessibilityLabel={
              favorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`
            }
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={20}
              color={favorite ? '#FFF' : colors.accent}
            />
            <Text style={[styles.favoriteText, { color: favorite ? '#FFF' : colors.text }]}>
              {favorite ? 'In your favorites' : 'Add to favorites'}
            </Text>
          </Pressable>
        </View>

        {/* Overview */}
        {movie.overview ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
            <Text style={[styles.overview, { color: colors.textSecondary }]}>{movie.overview}</Text>
          </View>
        ) : null}

        {/* Cast */}
        {cast.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Cast</Text>
            <FlatList
              data={cast}
              renderItem={({ item }) => <CastCard cast={item} />}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {/* Where to Watch */}
        <WatchProviders movieId={movie.id} />

        {/* Recommendations */}
        {recommended.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended</Text>
            <FlatList
              data={recommended}
              renderItem={({ item }) => <MovieCard movie={item} />}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        <View style={{ height: 40 }} />
      </View>
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
  backdropContainer: {
    height: BACKDROP_HEIGHT,
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  backdropGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BACKDROP_HEIGHT * 0.6,
  },
  topBarContainer: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  infoSection: {
    paddingHorizontal: 16,
    marginTop: -60,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  posterContainer: {
    width: 120,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  details: {
    flex: 1,
    paddingTop: 65,
    gap: 4,
  },
  movieTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  meta: {
    fontSize: 13,
    marginTop: 2,
  },
  genres: {
    fontSize: 12,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  voteCount: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  trailerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  trailerText: {
    fontSize: 15,
    fontWeight: '700',
  },
  favoriteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  favoriteText: {
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  overview: {
    fontSize: 14,
    lineHeight: 22,
  },
});
