import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number; // 1-5
  size?: 'small' | 'medium' | 'large';
  showNumber?: boolean;
  color?: string;
}

export function StarRating({
  rating,
  size = 'medium',
  showNumber = true,
  color = '#fbbf24',
}: StarRatingProps) {
  const starSize = size === 'small' ? 16 : size === 'medium' ? 24 : 32;
  const fontSize = size === 'small' ? 12 : size === 'medium' ? 16 : 20;

  // Round to nearest 0.5
  const roundedRating = Math.round(rating * 2) / 2;
  const fullStars = Math.floor(roundedRating);
  const hasHalfStar = roundedRating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, index) => (
          <Ionicons
            key={`full-${index}`}
            name="star"
            size={starSize}
            color={color}
          />
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <Ionicons name="star-half" size={starSize} color={color} />
        )}
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <Ionicons
            key={`empty-${index}`}
            name="star-outline"
            size={starSize}
            color={color}
          />
        ))}
      </View>
      {showNumber && (
        <Text style={[styles.ratingText, { fontSize, color }]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

interface RatingBadgeProps {
  rating: number;
}

export function RatingBadge({ rating }: RatingBadgeProps) {
  const getLabel = () => {
    if (rating >= 4.5) return 'Elite NIL Prospect';
    if (rating >= 4) return 'Power 5 Ready';
    if (rating >= 3.5) return 'D1 Potential';
    if (rating >= 3) return 'Solid Athlete';
    if (rating >= 2.5) return 'Developmental';
    return 'Rising';
  };

  const getColor = () => {
    if (rating >= 4.5) return '#22c55e';
    if (rating >= 4) return '#3b82f6';
    if (rating >= 3.5) return '#8b5cf6';
    if (rating >= 3) return '#f59e0b';
    return '#6b7280';
  };

  return (
    <View style={[styles.badge, { backgroundColor: getColor() }]}>
      <Text style={styles.badgeText}>{getLabel()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
