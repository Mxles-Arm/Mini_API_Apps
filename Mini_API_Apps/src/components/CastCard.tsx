// ==========================================
// WatchWise — Cast Card Component
// ==========================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { CastMember } from '@/services/tmdb';
import { IMAGE_SIZES } from '@/constants/config';
import { useThemeContext } from '@/context/ThemeContext';

interface CastCardProps {
  cast: CastMember;
}

export default function CastCard({ cast }: CastCardProps) {
  const { colors } = useThemeContext();
  const router = useRouter();

  const profileUri = cast.profile_path
    ? `${IMAGE_SIZES.profile.medium}${cast.profile_path}`
    : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => router.push(`/person/${cast.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${cast.name}, view filmography`}
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.surfaceLight }]}>
        {profileUri ? (
          <Image source={{ uri: profileUri }} style={styles.image} contentFit="cover" transition={300} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={[styles.placeholderText, { color: colors.textMuted }]}>No Photo</Text>
          </View>
        )}
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {cast.name}
      </Text>
      <Text style={[styles.character, { color: colors.textSecondary }]} numberOfLines={1}>
        {cast.character}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    marginRight: 14,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginBottom: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 9,
    textAlign: 'center',
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  character: {
    fontSize: 10,
    textAlign: 'center',
  },
});
