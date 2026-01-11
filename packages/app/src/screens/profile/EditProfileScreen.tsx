import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useProfile, UpdateAthleteData } from '../../hooks/useProfile';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ProfileScreenNavigationProp } from '../../navigation/types';

const profileSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  primarySport: yup.string(),
  graduationYear: yup.number().min(2020).max(2035),
  heightFeet: yup.string(),
  weight: yup.number().min(50).max(500),
  hometown: yup.string(),
  highSchool: yup.string(),
  college: yup.string(),
  bio: yup.string().max(500),
});

export default function EditProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { profile, isLoading, updateProfile } = useProfile();
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !profile) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

  const handleUpdate = async (values: UpdateAthleteData) => {
    setError(null);
    const result = await updateProfile(values);

    if (result.success) {
      navigation.goBack();
    } else {
      setError(result.error || 'Failed to update profile');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Formik
        initialValues={{
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          primarySport: profile.primarySport || '',
          graduationYear: profile.graduationYear,
          heightFeet: profile.heightFeet || '',
          weight: profile.weight,
          hometown: profile.hometown || '',
          highSchool: profile.highSchool || '',
          college: profile.college || '',
          bio: profile.bio || '',
          isPublic: profile.isPublic,
        }}
        validationSchema={profileSchema}
        onSubmit={handleUpdate}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          values,
          errors,
          touched,
          isSubmitting,
        }) => (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{error}</Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <Input
                label="First Name"
                placeholder="Enter your first name"
                value={values.firstName}
                onChangeText={handleChange('firstName')}
                onBlur={handleBlur('firstName')}
                error={touched.firstName ? errors.firstName : undefined}
              />
              <Input
                label="Last Name"
                placeholder="Enter your last name"
                value={values.lastName}
                onChangeText={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
                error={touched.lastName ? errors.lastName : undefined}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sport</Text>
              <Input
                label="Primary Sport"
                placeholder="e.g., Football, Basketball"
                value={values.primarySport}
                onChangeText={handleChange('primarySport')}
                onBlur={handleBlur('primarySport')}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Physical</Text>
              <Input
                label="Height"
                placeholder="e.g., 6'2\""
                value={values.heightFeet}
                onChangeText={handleChange('heightFeet')}
                onBlur={handleBlur('heightFeet')}
              />
              <Input
                label="Weight (lbs)"
                placeholder="Enter weight"
                keyboardType="numeric"
                value={values.weight?.toString() || ''}
                onChangeText={(text) =>
                  setFieldValue('weight', text ? parseInt(text) : undefined)
                }
                onBlur={handleBlur('weight')}
              />
              <Input
                label="Graduation Year"
                placeholder="e.g., 2025"
                keyboardType="numeric"
                value={values.graduationYear?.toString() || ''}
                onChangeText={(text) =>
                  setFieldValue(
                    'graduationYear',
                    text ? parseInt(text) : undefined
                  )
                }
                onBlur={handleBlur('graduationYear')}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location & Education</Text>
              <Input
                label="Hometown"
                placeholder="Where are you from?"
                value={values.hometown}
                onChangeText={handleChange('hometown')}
                onBlur={handleBlur('hometown')}
              />
              <Input
                label="High School"
                placeholder="Your high school"
                value={values.highSchool}
                onChangeText={handleChange('highSchool')}
                onBlur={handleBlur('highSchool')}
              />
              <Input
                label="College"
                placeholder="Your college (if applicable)"
                value={values.college}
                onChangeText={handleChange('college')}
                onBlur={handleBlur('college')}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Input
                label="Bio"
                placeholder="Share your story..."
                multiline
                numberOfLines={4}
                value={values.bio}
                onChangeText={handleChange('bio')}
                onBlur={handleBlur('bio')}
                error={touched.bio ? errors.bio : undefined}
                style={styles.bioInput}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Privacy</Text>
              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Public Profile</Text>
                  <Text style={styles.switchDescription}>
                    Allow coaches and brands to find your profile
                  </Text>
                </View>
                <Switch
                  value={values.isPublic}
                  onValueChange={(value) => setFieldValue('isPublic', value)}
                  trackColor={{ false: '#2d2d44', true: '#4f46e5' }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>

            <View style={styles.buttons}>
              <Button
                title="Cancel"
                onPress={() => navigation.goBack()}
                variant="outline"
                style={styles.button}
              />
              <Button
                title="Save Changes"
                onPress={() => handleSubmit()}
                loading={isSubmitting}
                style={styles.button}
              />
            </View>
          </ScrollView>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  errorBox: {
    backgroundColor: '#7f1d1d',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorBoxText: {
    color: '#fca5a5',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2d2d44',
    padding: 16,
    borderRadius: 8,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 12,
    color: '#9ca3af',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    flex: 1,
  },
});
