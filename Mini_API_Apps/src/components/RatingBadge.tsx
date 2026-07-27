// ==========================================
// WatchWise — Rating Badge Component
// ==========================================
// Color-coded: Green 7+, Yellow 5-7, Red <5

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RatingColors } from '@/constants/colors';

interface RatingBadgeProps {
  rating: number;
  size?: 'small' | 'medium' | 'large';
}

export default function RatingBadge({ rating, size = 'medium' }: RatingBadgeProps) {
  const getColor = () => {
    if (rating >= 7) return RatingColors.high;
    if (rating >= 5) return RatingColors.medium;
    return RatingColors.low;
  };

  const sizeStyles = {
    small: { width: 32, height: 32, fontSize: 11, borderWidth: 1.5 },
    medium: { width: 40, height: 40, fontSize: 13, borderWidth: 2 },
    large: { width: 52, height: 52, fontSize: 16, borderWidth: 2.5 },
  };

  const s = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          width: s.width,
          height: s.height,
          borderColor: getColor(),
          borderWidth: s.borderWidth,
          backgroundColor: `${getColor()}20`,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: s.fontSize, color: getColor() }]}>
        {rating > 0 ? rating.toFixed(1) : 'N/A'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '800',
  },
});
