import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../hooks/useProfile';
import { StarRating, RatingBadge } from '../../components/common/StarRating';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { ProfileScreenNavigationProp } from '../../navigation/types';

export default function MyProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { profile, isLoading, error, hasProfile } = useProfile();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={() => {}} variant="outline" />
      </View>
    );
  }

  if (!hasProfile) {
    return (
      <View style={styles.noProfileContainer}>
        <Ionicons name="person-add-outline" size={64} color="#6b7280" />
        <Text style={styles.noProfileTitle}>No Profile Yet</Text>
        <Text style={styles.noProfileText}>
          Create your athlete profile to showcase your skills to coaches and
          brands.
        </Text>
        <Button
          title="Create Profile"
          onPress={() => navigation.navigate('CreateProfile' as never)}
          size="large"
          style={styles.createButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile!.profilePictureUrl ? (
            <Image
              source={{ uri: profile!.profilePictureUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#6b7280" />
            </View>
          )}
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={() => navigation.navigate('Camera', { mode: 'photo' })}
          >
            <Ionicons name="camera" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>
          {profile!.firstName} {profile!.lastName}
        </Text>
        {profile!.primarySport && (
          <Text style={styles.sport}>{profile!.primarySport}</Text>
        )}

        {/* Star Rating */}
        {profile!.starRating !== undefined && (
          <View style={styles.ratingContainer}>
            <StarRating rating={profile!.starRating} size="large" />
            <RatingBadge rating={profile!.starRating} />
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="create-outline" size={24} color="#4f46e5" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('RatingBreakdown')}
        >
          <Ionicons name="star-outline" size={24} color="#fbbf24" />
          <Text style={styles.actionText}>Rating</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Camera', { mode: 'video' })}
        >
          <Ionicons name="videocam-outline" size={24} color="#22c55e" />
          <Text style={styles.actionText}>Video</Text>
        </TouchableOpacity>
      </View>

      {/* Bio */}
      {profile!.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{profile!.bio}</Text>
        </View>
      )}

      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailsGrid}>
          {profile!.graduationYear && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Graduation</Text>
              <Text style={styles.detailValue}>{profile!.graduationYear}</Text>
            </View>
          )}
          {profile!.heightFeet && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Height</Text>
              <Text style={styles.detailValue}>{profile!.heightFeet}</Text>
            </View>
          )}
          {profile!.weight && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Weight</Text>
              <Text style={styles.detailValue}>{profile!.weight} lbs</Text>
            </View>
          )}
          {profile!.positions && profile!.positions.length > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Position(s)</Text>
              <Text style={styles.detailValue}>
                {profile!.positions.join(', ')}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Location */}
      {(profile!.hometown || profile!.highSchool || profile!.college) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Education</Text>
          {profile!.hometown && (
            <View style={styles.locationItem}>
              <Ionicons name="location-outline" size={20} color="#9ca3af" />
              <Text style={styles.locationText}>{profile!.hometown}</Text>
            </View>
          )}
          {profile!.highSchool && (
            <View style={styles.locationItem}>
              <Ionicons name="school-outline" size={20} color="#9ca3af" />
              <Text style={styles.locationText}>{profile!.highSchool}</Text>
            </View>
          )}
          {profile!.college && (
            <View style={styles.locationItem}>
              <Ionicons name="business-outline" size={20} color="#9ca3af" />
              <Text style={styles.locationText}>{profile!.college}</Text>
            </View>
          )}
        </View>
      )}

      {/* Visibility Status */}
      <View style={styles.section}>
        <View style={styles.visibilityRow}>
          <Ionicons
            name={profile!.isPublic ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color={profile!.isPublic ? '#22c55e' : '#f59e0b'}
          />
          <Text style={styles.visibilityText}>
            {profile!.isPublic
              ? 'Profile is public'
              : 'Profile is private (only you can see it)'}
          </Text>
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
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2d2d44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4f46e5',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1a1a2e',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  sport: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 16,
  },
  ratingContainer: {
    alignItems: 'center',
    gap: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2d2d44',
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#2d2d44',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 22,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    minWidth: '45%',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#ffffff',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visibilityText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  bottomPadding: {
    height: 24,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginVertical: 16,
  },
  noProfileContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noProfileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  noProfileText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createButton: {
    minWidth: 200,
  },
});
