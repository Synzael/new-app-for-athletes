import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Formik, FormikErrors } from 'formik';
import * as yup from 'yup';
import { useProfile, CreateAthleteData } from '../../hooks/useProfile';
import { useCamera } from '../../hooks/useCamera';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { MainTabNavigationProp } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';

const STEPS = ['Basic Info', 'Sports', 'Physical', 'About'];

const profileSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  primarySport: yup.string().required('Primary sport is required'),
  graduationYear: yup
    .number()
    .min(2020, 'Invalid year')
    .max(2035, 'Invalid year'),
  heightFeet: yup.string(),
  weight: yup.number().min(50).max(500),
  hometown: yup.string(),
  highSchool: yup.string(),
  bio: yup.string().max(500, 'Bio must be under 500 characters'),
});

const SPORTS = [
  'Football',
  'Basketball',
  'Baseball',
  'Soccer',
  'Volleyball',
  'Track & Field',
  'Swimming',
  'Wrestling',
  'Tennis',
  'Golf',
  'Lacrosse',
  'Hockey',
  'Softball',
  'Other',
];

export default function CreateProfileScreen() {
  const navigation = useNavigation<MainTabNavigationProp>();
  const { createProfile, hasProfile } = useProfile();
  const { selectImage, media, clearMedia } = useCamera();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const initialValues: CreateAthleteData = {
    firstName: '',
    lastName: '',
    primarySport: '',
    positions: [],
    graduationYear: new Date().getFullYear() + 1,
    heightFeet: '',
    weight: undefined,
    hometown: '',
    highSchool: '',
    bio: '',
    isPublic: true,
  };

  const handleCreate = async (values: CreateAthleteData) => {
    setError(null);
    const result = await createProfile({
      ...values,
      profilePictureUrl: media?.uri,
    });

    if (result.success) {
      navigation.navigate('Profile');
    } else {
      setError(result.error || 'Failed to create profile');
    }
  };

  const validateStep = (
    values: CreateAthleteData,
    errors: FormikErrors<CreateAthleteData>
  ): boolean => {
    switch (step) {
      case 0:
        return !errors.firstName && !errors.lastName && !!values.firstName && !!values.lastName;
      case 1:
        return !errors.primarySport && !!values.primarySport;
      case 2:
        return true; // Physical info is optional
      case 3:
        return true; // About is optional
      default:
        return true;
    }
  };

  if (hasProfile) {
    return (
      <View style={styles.alreadyHasProfile}>
        <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
        <Text style={styles.alreadyHasProfileTitle}>Profile Exists</Text>
        <Text style={styles.alreadyHasProfileText}>
          You already have an athlete profile. Go to Profile to view or edit
          it.
        </Text>
        <Button
          title="Go to Profile"
          onPress={() => navigation.navigate('Profile')}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={profileSchema}
        onSubmit={handleCreate}
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
          <>
            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
              {STEPS.map((stepName, index) => (
                <View key={stepName} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      index <= step && styles.stepCircleActive,
                    ]}
                  >
                    {index < step ? (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    ) : (
                      <Text
                        style={[
                          styles.stepNumber,
                          index <= step && styles.stepNumberActive,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      index <= step && styles.stepLabelActive,
                    ]}
                  >
                    {stepName}
                  </Text>
                </View>
              ))}
            </View>

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

              {/* Step 0: Basic Info */}
              {step === 0 && (
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Let's start with your name</Text>
                  <Input
                    label="First Name"
                    placeholder="Enter your first name"
                    value={values.firstName}
                    onChangeText={handleChange('firstName')}
                    onBlur={handleBlur('firstName')}
                    error={touched.firstName ? errors.firstName : undefined}
                    leftIcon="person-outline"
                  />
                  <Input
                    label="Last Name"
                    placeholder="Enter your last name"
                    value={values.lastName}
                    onChangeText={handleChange('lastName')}
                    onBlur={handleBlur('lastName')}
                    error={touched.lastName ? errors.lastName : undefined}
                    leftIcon="person-outline"
                  />
                </View>
              )}

              {/* Step 1: Sports */}
              {step === 1 && (
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>What sport do you play?</Text>
                  <View style={styles.sportsGrid}>
                    {SPORTS.map((sport) => (
                      <TouchableOpacity
                        key={sport}
                        style={[
                          styles.sportButton,
                          values.primarySport === sport &&
                            styles.sportButtonSelected,
                        ]}
                        onPress={() => setFieldValue('primarySport', sport)}
                      >
                        <Text
                          style={[
                            styles.sportButtonText,
                            values.primarySport === sport &&
                              styles.sportButtonTextSelected,
                          ]}
                        >
                          {sport}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {touched.primarySport && errors.primarySport && (
                    <Text style={styles.errorText}>{errors.primarySport}</Text>
                  )}
                </View>
              )}

              {/* Step 2: Physical */}
              {step === 2 && (
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Physical Attributes</Text>
                  <Text style={styles.stepSubtitle}>
                    Help coaches find you (optional)
                  </Text>
                  <Input
                    label="Height"
                    placeholder="e.g., 6'2\""
                    value={values.heightFeet}
                    onChangeText={handleChange('heightFeet')}
                    onBlur={handleBlur('heightFeet')}
                    error={touched.heightFeet ? errors.heightFeet : undefined}
                    leftIcon="resize-outline"
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
                    error={touched.weight ? errors.weight : undefined}
                    leftIcon="fitness-outline"
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
                    error={
                      touched.graduationYear ? errors.graduationYear : undefined
                    }
                    leftIcon="calendar-outline"
                  />
                </View>
              )}

              {/* Step 3: About */}
              {step === 3 && (
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Tell us about yourself</Text>
                  <Input
                    label="Hometown"
                    placeholder="Where are you from?"
                    value={values.hometown}
                    onChangeText={handleChange('hometown')}
                    onBlur={handleBlur('hometown')}
                    leftIcon="location-outline"
                  />
                  <Input
                    label="High School"
                    placeholder="Your high school name"
                    value={values.highSchool}
                    onChangeText={handleChange('highSchool')}
                    onBlur={handleBlur('highSchool')}
                    leftIcon="school-outline"
                  />
                  <Input
                    label="Bio"
                    placeholder="Share your story..."
                    multiline
                    numberOfLines={4}
                    value={values.bio}
                    onChangeText={handleChange('bio')}
                    onBlur={handleBlur('bio')}
                    error={touched.bio ? errors.bio : undefined}
                    leftIcon="document-text-outline"
                    style={styles.bioInput}
                  />
                </View>
              )}
            </ScrollView>

            {/* Navigation Buttons */}
            <View style={styles.navigation}>
              {step > 0 && (
                <Button
                  title="Back"
                  onPress={() => setStep(step - 1)}
                  variant="outline"
                  style={styles.navButton}
                />
              )}
              {step < STEPS.length - 1 ? (
                <Button
                  title="Next"
                  onPress={() => setStep(step + 1)}
                  disabled={!validateStep(values, errors)}
                  style={[styles.navButton, step === 0 && styles.fullWidthButton]}
                />
              ) : (
                <Button
                  title="Create Profile"
                  onPress={() => handleSubmit()}
                  loading={isSubmitting}
                  style={styles.navButton}
                />
              )}
            </View>
          </>
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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 8,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2d2d44',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: '#4f46e5',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  stepNumberActive: {
    color: '#ffffff',
  },
  stepLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  stepLabelActive: {
    color: '#d1d5db',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
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
  stepContent: {},
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 24,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  sportButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#2d2d44',
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  sportButtonSelected: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  sportButtonText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  sportButtonTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 8,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  navigation: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderColor: '#2d2d44',
  },
  navButton: {
    flex: 1,
  },
  fullWidthButton: {
    flex: 1,
  },
  alreadyHasProfile: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alreadyHasProfileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  alreadyHasProfileText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
});
