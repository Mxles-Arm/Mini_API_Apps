// ==========================================
// WatchWise — Person Screen
// ==========================================
// An actor's profile and filmography, reached by tapping a CastCard.

import ErrorState from '@/components/ErrorState';
import MovieCard from '@/components/MovieCard';
import { IMAGE_SIZES } from '@/constants/config';
import { useThemeContext } from '@/context/ThemeContext';
import { Movie, Person, getPersonDetails, getPersonMovieCredits } from '@/services/tmdb';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const calculateAge = (birthday: string, deathday: string | null): number => {
  const end = deathday ? new Date(deathday) : new Date();
  const start = new Date(birthday);
  let age = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < start.getDate())) {
    age--;
  }
  return age;
};

export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeContext();

  const [person, setPerson] = useState<Person | null>(null);
  const [credits, setCredits] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const personId = parseInt(id);
      if (isNaN(personId)) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(false);
        const [personData, creditsData] = await Promise.all([
          getPersonDetails(personId),
          getPersonMovieCredits(personId),
        ]);
        if (cancelled) return;
        setPerson(personData);
        setCredits(creditsData);
      } catch (err) {
        console.error('Error loading person:', err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const screenOptions = {
    title: person?.name || 'Person',
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700' as const },
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={screenOptions} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !person) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={screenOptions} />
        <ErrorState onRetry={retry} />
      </View>
    );
  }

  const profileUri = person.profile_path
    ? `${IMAGE_SIZES.profile.large}${person.profile_path}`
    : null;

  const age = person.birthday ? calculateAge(person.birthday, person.deathday) : null;
  const ageLabel = person.deathday
    ? `${person.birthday} – ${person.deathday} (aged ${age})`
    : person.birthday
      ? `Born ${person.birthday}${age !== null ? ` (age ${age})` : ''}`
      : null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={screenOptions} />

      <View style={styles.header}>
        <View style={[styles.photoContainer, { backgroundColor: colors.surfaceLight }]}>
          {profileUri ? (
            <Image source={{ uri: profileUri }} style={styles.photo} contentFit="cover" transition={300} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person" size={40} color={colors.textMuted} />
            </View>
          )}
        </View>

        <View style={styles.headerInfo}>
          <Text style={[styles.name, { color: colors.text }]}>{person.name}</Text>
          {person.known_for_department ? (
            <Text style={[styles.department, { color: colors.primary }]}>
              {person.known_for_department}
            </Text>
          ) : null}
          {ageLabel && (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>{ageLabel}</Text>
          )}
          {person.place_of_birth && (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={13} color={colors.textMuted} />
              <Text style={[styles.meta, { color: colors.textSecondary }]}>
                {person.place_of_birth}
              </Text>
            </View>
          )}
        </View>
      </View>

      {person.biography ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Biography</Text>
          <Text style={[styles.biography, { color: colors.textSecondary }]}>
            {person.biography}
          </Text>
        </View>
      ) : null}

      {credits.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Known For</Text>
          <FlatList
            data={credits}
            renderItem={({ item }) => <MovieCard movie={item} />}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.creditsList}
          />
        </View>
      )}

      <View style={{ height: 40 }} />
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
    gap: 16,
    padding: 16,
  },
  photoContainer: {
    width: 110,
    height: 165,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
    paddingTop: 4,
  },
  name: {
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 25,
  },
  department: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  biography: {
    fontSize: 14,
    lineHeight: 21,
  },
  creditsList: {
    paddingRight: 4,
  },
});
