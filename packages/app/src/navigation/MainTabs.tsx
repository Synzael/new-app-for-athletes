import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, ProfileStackParamList, StatsStackParamList, SettingsStackParamList } from './types';
import { Ionicons } from '@expo/vector-icons';

// Profile screens
import MyProfileScreen from '../screens/profile/MyProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import RatingBreakdownScreen from '../screens/profile/RatingBreakdownScreen';
import CreateProfileScreen from '../screens/profile/CreateProfileScreen';
import CameraScreen from '../screens/media/CameraScreen';

// Stats screens
import StatsListScreen from '../screens/stats/StatsListScreen';
import AddStatScreen from '../screens/stats/AddStatScreen';

// Settings screens
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const StatsStack = createNativeStackNavigator<StatsStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
      }}
    >
      <ProfileStack.Screen
        name="MyProfile"
        component={MyProfileScreen}
        options={{ title: 'My Profile' }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <ProfileStack.Screen
        name="RatingBreakdown"
        component={RatingBreakdownScreen}
        options={{ title: 'Rating Details' }}
      />
      <ProfileStack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ headerShown: false }}
      />
    </ProfileStack.Navigator>
  );
}

function StatsStackScreen() {
  return (
    <StatsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
      }}
    >
      <StatsStack.Screen
        name="StatsList"
        component={StatsListScreen}
        options={{ title: 'Performance Stats' }}
      />
      <StatsStack.Screen
        name="AddStat"
        component={AddStatScreen}
        options={{ title: 'Add Stat' }}
      />
    </StatsStack.Navigator>
  );
}

function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
      }}
    >
      <SettingsStack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <SettingsStack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ title: 'Notifications' }}
      />
    </SettingsStack.Navigator>
  );
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IconName;

          switch (route.name) {
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'CreateProfile':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Stats':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#2d2d44',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
      <Tab.Screen
        name="CreateProfile"
        component={CreateProfileScreen}
        options={{
          tabBarLabel: 'Create',
          headerShown: true,
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#fff',
          headerTitle: 'Create Profile',
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsStackScreen}
        options={{ tabBarLabel: 'Stats' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}
