import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { SettingsStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type SettingsNavProp = NativeStackNavigationProp<SettingsStackParamList>;

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}

function SettingsItem({ icon, label, value, onPress, danger }: SettingsItemProps) {
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <Ionicons
          name={icon}
          size={22}
          color={danger ? '#ef4444' : '#9ca3af'}
          style={styles.settingsIcon}
        />
        <Text style={[styles.settingsLabel, danger && styles.dangerText]}>
          {label}
        </Text>
      </View>
      <View style={styles.settingsItemRight}>
        {value && <Text style={styles.settingsValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsNavProp>();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Coming Soon', 'Account deletion will be available soon.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionContent}>
          <View style={styles.accountInfo}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={32} color="#6b7280" />
            </View>
            <View style={styles.accountDetails}>
              <Text style={styles.accountEmail}>{user?.email}</Text>
              <Text style={styles.accountRole}>{user?.role || 'Athlete'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.sectionContent}>
          <SettingsItem
            icon="notifications-outline"
            label="Notifications"
            onPress={() => navigation.navigate('NotificationSettings')}
          />
          <SettingsItem
            icon="moon-outline"
            label="Appearance"
            value="System"
            onPress={() => {
              Alert.alert('Coming Soon', 'Theme settings coming soon.');
            }}
          />
          <SettingsItem
            icon="language-outline"
            label="Language"
            value="English"
            onPress={() => {
              Alert.alert('Coming Soon', 'Language settings coming soon.');
            }}
          />
        </View>
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <View style={styles.sectionContent}>
          <SettingsItem
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => {
              Alert.alert('Coming Soon', 'Password change coming soon.');
            }}
          />
          <SettingsItem
            icon="shield-checkmark-outline"
            label="Privacy Settings"
            onPress={() => {
              Alert.alert('Coming Soon', 'Privacy settings coming soon.');
            }}
          />
          <SettingsItem
            icon="download-outline"
            label="Download My Data"
            onPress={() => {
              Alert.alert('Coming Soon', 'Data export coming soon.');
            }}
          />
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.sectionContent}>
          <SettingsItem
            icon="help-circle-outline"
            label="Help Center"
            onPress={() => {
              Alert.alert('Coming Soon', 'Help center coming soon.');
            }}
          />
          <SettingsItem
            icon="chatbubble-outline"
            label="Contact Support"
            onPress={() => {
              Alert.alert('Coming Soon', 'Contact support coming soon.');
            }}
          />
          <SettingsItem
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => {
              Alert.alert('Coming Soon', 'Terms of service coming soon.');
            }}
          />
          <SettingsItem
            icon="shield-outline"
            label="Privacy Policy"
            onPress={() => {
              Alert.alert('Coming Soon', 'Privacy policy coming soon.');
            }}
          />
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        <View style={styles.sectionContent}>
          <SettingsItem
            icon="log-out-outline"
            label="Log Out"
            onPress={handleLogout}
            danger
          />
          <SettingsItem
            icon="trash-outline"
            label="Delete Account"
            onPress={handleDeleteAccount}
            danger
          />
        </View>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>Athlete Recruiting v1.0.0</Text>
        <Text style={styles.appCopyright}>Made with care for athletes</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
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
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3d3d5c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountDetails: {
    marginLeft: 12,
  },
  accountEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  accountRole: {
    fontSize: 14,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d5c',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    marginRight: 12,
  },
  settingsLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsValue: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  dangerText: {
    color: '#ef4444',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appVersion: {
    fontSize: 14,
    color: '#6b7280',
  },
  appCopyright: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
  },
});
