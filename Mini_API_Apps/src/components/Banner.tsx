// ==========================================
// WatchWise — Banner (Auto-scroll Trending)
// ==========================================

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Movie } from '@/services/tmdb';
import { IMAGE_SIZES } from '@/constants/config';
import { useThemeContext } from '@/context/ThemeContext';
import RatingBadge from './RatingBadge';

const BANNER_HEIGHT = 220;

const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

interface BannerProps {
  movies: Movie[];
}

export default function Banner({ movies }: BannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const { colors } = useThemeContext();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % movies.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [movies.length]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const onScrollToIndexFailed = useCallback((info: { index: number }) => {
    flatListRef.current?.scrollToOffset({ offset: info.index * width, animated: true });
  }, [width]);

  const slideStyle = useMemo(() => [styles.slide, { width }], [width]);

  const renderItem = ({ item }: { item: Movie }) => {
    const backdropUri = item.backdrop_path
      ? `${IMAGE_SIZES.backdrop.medium}${item.backdrop_path}`
      : null;

    return (
      <Pressable
        style={slideStyle}
        onPress={() => router.push(`/movie/${item.id}`)}
      >
        {backdropUri && (
          <Image source={{ uri: backdropUri }} style={styles.backdrop} contentFit="cover" transition={300} />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <RatingBadge rating={item.vote_average} size="small" />
          </View>
          <Text style={styles.overview} numberOfLines={2}>
            {item.overview}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={movies.slice(0, 5)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollToIndexFailed={onScrollToIndexFailed}
      />
      {/* Dot indicators */}
      <View style={styles.dots}>
        {movies.slice(0, 5).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === activeIndex ? colors.primary : 'rgba(255,255,255,0.4)',
                width: index === activeIndex ? 20 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    marginBottom: 20,
  },
  slide: {
    height: BANNER_HEIGHT,
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BANNER_HEIGHT * 0.7,
  },
  info: {
    position: 'absolute',
    bottom: 28,
    left: 16,
    right: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
  },
  overview: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    lineHeight: 17,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    gap: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
