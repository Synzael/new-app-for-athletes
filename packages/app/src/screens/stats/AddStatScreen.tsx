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
import { Formik } from 'formik';
import * as yup from 'yup';
import { apiClient } from '../../services/api';
import { useProfile } from '../../hooks/useProfile';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { StatsScreenNavigationProp } from '../../navigation/types';

const statSchema = yup.object().shape({
  statName: yup.string().required('Stat name is required'),
  statValue: yup.string().required('Value is required'),
  unit: yup.string(),
  eventName: yup.string(),
});

const COMMON_STATS = [
  { name: '40-Yard Dash', unit: 'seconds' },
  { name: 'Vertical Jump', unit: 'inches' },
  { name: 'Broad Jump', unit: 'inches' },
  { name: 'Bench Press', unit: 'reps' },
  { name: 'Squat', unit: 'lbs' },
  { name: 'GPA', unit: '' },
  { name: 'Points Per Game', unit: 'ppg' },
  { name: 'Rushing Yards', unit: 'yards' },
  { name: 'Passing Yards', unit: 'yards' },
  { name: 'Tackles', unit: '' },
  { name: 'Rebounds', unit: 'rpg' },
  { name: 'Assists', unit: 'apg' },
  { name: 'ERA', unit: '' },
  { name: 'Batting Average', unit: '' },
];

export default function AddStatScreen() {
  const navigation = useNavigation<StatsScreenNavigationProp>();
  const { profile } = useProfile();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: {
    statName: string;
    statValue: string;
    unit: string;
    eventName: string;
  }) => {
    if (!profile) return;

    setError(null);
    try {
      await apiClient.post(`/stats/${profile.id}`, {
        statName: values.statName,
        statValue: values.statValue,
        unit: values.unit || undefined,
        eventName: values.eventName || undefined,
        recordedDate: new Date().toISOString(),
      });
      navigation.goBack();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || 'Failed to add stat');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Formik
        initialValues={{
          statName: '',
          statValue: '',
          unit: '',
          eventName: '',
        }}
        validationSchema={statSchema}
        onSubmit={handleSubmit}
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

            <Text style={styles.sectionTitle}>Quick Select</Text>
            <View style={styles.quickSelect}>
              {COMMON_STATS.map((stat) => (
                <TouchableOpacity
                  key={stat.name}
                  style={[
                    styles.quickButton,
                    values.statName === stat.name && styles.quickButtonSelected,
                  ]}
                  onPress={() => {
                    setFieldValue('statName', stat.name);
                    setFieldValue('unit', stat.unit);
                  }}
                >
                  <Text
                    style={[
                      styles.quickButtonText,
                      values.statName === stat.name &&
                        styles.quickButtonTextSelected,
                    ]}
                  >
                    {stat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Stat Details</Text>

            <Input
              label="Stat Name"
              placeholder="e.g., 40-Yard Dash"
              value={values.statName}
              onChangeText={handleChange('statName')}
              onBlur={handleBlur('statName')}
              error={touched.statName ? errors.statName : undefined}
            />

            <View style={styles.row}>
              <View style={styles.valueInput}>
                <Input
                  label="Value"
                  placeholder="e.g., 4.5"
                  keyboardType="decimal-pad"
                  value={values.statValue}
                  onChangeText={handleChange('statValue')}
                  onBlur={handleBlur('statValue')}
                  error={touched.statValue ? errors.statValue : undefined}
                />
              </View>
              <View style={styles.unitInput}>
                <Input
                  label="Unit"
                  placeholder="e.g., sec"
                  value={values.unit}
                  onChangeText={handleChange('unit')}
                  onBlur={handleBlur('unit')}
                />
              </View>
            </View>

            <Input
              label="Event Name (Optional)"
              placeholder="e.g., State Championship, Nike Camp"
              value={values.eventName}
              onChangeText={handleChange('eventName')}
              onBlur={handleBlur('eventName')}
            />

            <View style={styles.buttons}>
              <Button
                title="Cancel"
                onPress={() => navigation.goBack()}
                variant="outline"
                style={styles.button}
              />
              <Button
                title="Add Stat"
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    marginTop: 8,
  },
  quickSelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  quickButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#2d2d44',
    borderWidth: 1,
    borderColor: '#3d3d5c',
  },
  quickButtonSelected: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  quickButtonText: {
    fontSize: 12,
    color: '#d1d5db',
  },
  quickButtonTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  valueInput: {
    flex: 2,
  },
  unitInput: {
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});
