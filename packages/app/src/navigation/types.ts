import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Profile: undefined;
  CreateProfile: undefined;
  Stats: undefined;
  Settings: undefined;
};

// Profile Stack (nested in tab)
export type ProfileStackParamList = {
  MyProfile: undefined;
  EditProfile: undefined;
  RatingBreakdown: undefined;
  Camera: { mode: 'photo' | 'video' };
  VideoRecorder: undefined;
};

// Stats Stack
export type StatsStackParamList = {
  StatsList: undefined;
  AddStat: undefined;
  EditStat: { statId: string };
};

// Settings Stack
export type SettingsStackParamList = {
  SettingsMain: undefined;
  NotificationSettings: undefined;
};

// Navigation prop types
export type AuthScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;

export type ProfileScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

export type StatsScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<StatsStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

// Route prop types
export type CameraScreenRouteProp = RouteProp<ProfileStackParamList, 'Camera'>;
export type EditStatScreenRouteProp = RouteProp<StatsStackParamList, 'EditStat'>;
