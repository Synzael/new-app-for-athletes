import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useNotifications } from '../../hooks/usePushNotifications';

interface NotificationToggleProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function NotificationToggle({
  label,
  description,
  value,
  onValueChange,
}: NotificationToggleProps) {
  return (
    <View style={styles.toggleItem}>
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#3d3d5c', true: '#4f46e5' }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const { expoPushToken } = useNotifications();

  // Local state for notification preferences
  // In a real app, these would be persisted to the backend
  const [profileViews, setProfileViews] = useState(true);
  const [coachInterest, setCoachInterest] = useState(true);
  const [brandDeals, setBrandDeals] = useState(true);
  const [messages, setMessages] = useState(true);
  const [updates, setUpdates] = useState(false);
  const [marketing, setMarketing] = useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* Push Notification Status */}
      <View style={styles.statusSection}>
        <View
          style={[
            styles.statusIndicator,
            expoPushToken ? styles.statusEnabled : styles.statusDisabled,
          ]}
        />
        <Text style={styles.statusText}>
          {expoPushToken
            ? 'Push notifications enabled'
            : 'Push notifications disabled'}
        </Text>
      </View>

      {/* Activity Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity</Text>
        <View style={styles.sectionContent}>
          <NotificationToggle
            label="Profile Views"
            description="Get notified when coaches or brands view your profile"
            value={profileViews}
            onValueChange={setProfileViews}
          />
          <NotificationToggle
            label="Coach Interest"
            description="When a coach expresses interest in recruiting you"
            value={coachInterest}
            onValueChange={setCoachInterest}
          />
          <NotificationToggle
            label="Brand Opportunities"
            description="NIL deal opportunities from brands"
            value={brandDeals}
            onValueChange={setBrandDeals}
          />
          <NotificationToggle
            label="Messages"
            description="Direct messages from coaches and brands"
            value={messages}
            onValueChange={setMessages}
          />
        </View>
      </View>

      {/* Other Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other</Text>
        <View style={styles.sectionContent}>
          <NotificationToggle
            label="App Updates"
            description="New features and improvements"
            value={updates}
            onValueChange={setUpdates}
          />
          <NotificationToggle
            label="Marketing"
            description="Tips, promotions, and newsletter"
            value={marketing}
            onValueChange={setMarketing}
          />
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          You can also manage notifications in your device settings. Some
          notifications may be required for core app functionality.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#2d2d44',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusEnabled: {
    backgroundColor: '#22c55e',
  },
  statusDisabled: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d5c',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  infoSection: {
    padding: 16,
    marginTop: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    textAlign: 'center',
  },
});
