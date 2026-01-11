import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiClient } from './api';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token - permission not granted');
    return null;
  }

  // Get the Expo push token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  // Configure Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token.data;
}

export async function registerTokenWithBackend(token: string): Promise<void> {
  try {
    await apiClient.post('/notifications/register-token', {
      token,
      platform: Platform.OS,
    });
    console.log('Push token registered with backend');
  } catch (error) {
    console.error('Failed to register push token:', error);
  }
}

export async function unregisterTokenFromBackend(token: string): Promise<void> {
  try {
    await apiClient.delete('/notifications/unregister-token', {
      data: { token },
    });
    console.log('Push token unregistered from backend');
  } catch (error) {
    console.error('Failed to unregister push token:', error);
  }
}

export interface NotificationData {
  type: string;
  athleteId?: string;
  [key: string]: unknown;
}

export function parseNotificationData(
  notification: Notifications.Notification
): NotificationData | null {
  const data = notification.request.content.data;
  if (data && typeof data === 'object') {
    return data as NotificationData;
  }
  return null;
}
