import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useProfile } from '../../hooks/useProfile';
import { StarRating, RatingBadge } from '../../components/common/StarRating';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface ScoreBarProps {
  label: string;
  score: number;
  weight: number;
  color: string;
}

function ScoreBar({ label, score, weight, color }: ScoreBarProps) {
  const percentage = Math.round(score);

  return (
    <View style={styles.scoreBar}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={styles.scoreValue}>{percentage}/100</Text>
      </View>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.weightText}>Weight: {weight}%</Text>
    </View>
  );
}

export default function RatingBreakdownScreen() {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading rating..." />;
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No profile found</Text>
      </View>
    );
  }

  const scores = [
    {
      label: 'Performance',
      score: profile.performanceScore || 0,
      weight: 40,
      color: '#22c55e',
      description: 'Game statistics, achievements, and competitive results',
    },
    {
      label: 'Physical',
      score: profile.physicalScore || 0,
      weight: 20,
      color: '#3b82f6',
      description: 'Athletic measurements, combine results, and fitness metrics',
    },
    {
      label: 'Academic',
      score: profile.academicScore || 0,
      weight: 15,
      color: '#8b5cf6',
      description: 'GPA, test scores, and academic eligibility',
    },
    {
      label: 'Social',
      score: profile.socialScore || 0,
      weight: 15,
      color: '#f59e0b',
      description: 'Social media presence, engagement, and NIL potential',
    },
    {
      label: 'Evaluation',
      score: profile.evaluationScore || 0,
      weight: 10,
      color: '#ec4899',
      description: 'Coach evaluations, camp ratings, and expert assessments',
    },
  ];

  // Calculate weighted composite
  const compositeScore = scores.reduce(
    (sum, s) => sum + (s.score * s.weight) / 100,
    0
  );

  const getStarDescription = (rating: number) => {
    if (rating >= 4.5) return 'You are among the elite prospects with high NIL potential';
    if (rating >= 4) return 'Power 5 conference ready with strong recruiting potential';
    if (rating >= 3.5) return 'D1 level talent with room for growth';
    if (rating >= 3) return 'Solid college athlete prospect';
    if (rating >= 2.5) return 'Developing talent with potential';
    return 'Early stage - keep working to improve your scores';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Overall Rating */}
      <View style={styles.overallSection}>
        <Text style={styles.overallTitle}>Overall Rating</Text>
        <View style={styles.ratingDisplay}>
          <StarRating rating={profile.starRating || 0} size="large" />
        </View>
        <RatingBadge rating={profile.starRating || 0} />
        <Text style={styles.ratingDescription}>
          {getStarDescription(profile.starRating || 0)}
        </Text>
      </View>

      {/* Composite Score */}
      <View style={styles.compositeSection}>
        <Text style={styles.compositeLabel}>Composite Score</Text>
        <Text style={styles.compositeValue}>{compositeScore.toFixed(1)}</Text>
        <Text style={styles.compositeSubtext}>out of 100</Text>
      </View>

      {/* Score Breakdown */}
      <View style={styles.breakdownSection}>
        <Text style={styles.sectionTitle}>Score Breakdown</Text>
        {scores.map((score) => (
          <View key={score.label} style={styles.scoreItem}>
            <ScoreBar
              label={score.label}
              score={score.score}
              weight={score.weight}
              color={score.color}
            />
            <Text style={styles.scoreDescription}>{score.description}</Text>
          </View>
        ))}
      </View>

      {/* Rating Formula */}
      <View style={styles.formulaSection}>
        <Text style={styles.sectionTitle}>How Ratings Work</Text>
        <View style={styles.formulaCard}>
          <Text style={styles.formulaText}>
            Your star rating is calculated using a weighted formula:
          </Text>
          <View style={styles.formulaDetails}>
            <Text style={styles.formulaLine}>Performance x 40%</Text>
            <Text style={styles.formulaLine}>Physical x 20%</Text>
            <Text style={styles.formulaLine}>Academic x 15%</Text>
            <Text style={styles.formulaLine}>Social x 15%</Text>
            <Text style={styles.formulaLine}>Evaluation x 10%</Text>
          </View>
          <Text style={styles.formulaNote}>
            Scores are updated as you add performance stats, videos, and receive
            evaluations.
          </Text>
        </View>
      </View>

      {/* Star Rating Scale */}
      <View style={styles.scaleSection}>
        <Text style={styles.sectionTitle}>Star Rating Scale</Text>
        <View style={styles.scaleItem}>
          <StarRating rating={5} size="small" showNumber={false} />
          <Text style={styles.scaleText}>90-100: Elite NIL Prospect</Text>
        </View>
        <View style={styles.scaleItem}>
          <StarRating rating={4.5} size="small" showNumber={false} />
          <Text style={styles.scaleText}>80-89: Power 5 Ready</Text>
        </View>
        <View style={styles.scaleItem}>
          <StarRating rating={4} size="small" showNumber={false} />
          <Text style={styles.scaleText}>70-79: D1 Potential</Text>
        </View>
        <View style={styles.scaleItem}>
          <StarRating rating={3} size="small" showNumber={false} />
          <Text style={styles.scaleText}>50-59: Solid College Athlete</Text>
        </View>
        <View style={styles.scaleItem}>
          <StarRating rating={2} size="small" showNumber={false} />
          <Text style={styles.scaleText}>30-39: Developmental</Text>
        </View>
        <View style={styles.scaleItem}>
          <StarRating rating={1} size="small" showNumber={false} />
          <Text style={styles.scaleText}>0-19: Early Stage</Text>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  overallSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#2d2d44',
  },
  overallTitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ratingDisplay: {
    marginBottom: 16,
  },
  ratingDescription: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  compositeSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: '#2d2d44',
  },
  compositeLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  compositeValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  compositeSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  breakdownSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#2d2d44',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  scoreItem: {
    marginBottom: 20,
  },
  scoreBar: {
    marginBottom: 4,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  scoreValue: {
    fontSize: 14,
    color: '#9ca3af',
  },
  barBackground: {
    height: 8,
    backgroundColor: '#2d2d44',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  weightText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  scoreDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  formulaSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#2d2d44',
  },
  formulaCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 8,
    padding: 16,
  },
  formulaText: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 12,
  },
  formulaDetails: {
    marginBottom: 12,
  },
  formulaLine: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  formulaNote: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  scaleSection: {
    padding: 16,
  },
  scaleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  scaleText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  bottomPadding: {
    height: 24,
  },
});
