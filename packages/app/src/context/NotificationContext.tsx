import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotificationsAsync,
  registerTokenWithBackend,
  parseNotificationData,
  NotificationData,
} from '../services/notifications';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  notificationData: NotificationData | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [notificationData, setNotificationData] = useState<NotificationData | null>(null);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Register for push notifications
    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        setExpoPushToken(token);
        await registerTokenWithBackend(token);
      }
    });

    // Listen for incoming notifications while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (receivedNotification) => {
        setNotification(receivedNotification);
        const data = parseNotificationData(receivedNotification);
        if (data) {
          setNotificationData(data);
        }
      }
    );

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = parseNotificationData(response.notification);
        if (data) {
          handleNotificationNavigation(data);
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [isAuthenticated]);

  const handleNotificationNavigation = (data: NotificationData) => {
    // Handle navigation based on notification type
    // This would typically use the navigation ref to navigate
    switch (data.type) {
      case 'profile_view':
        // Navigate to analytics or profile
        console.log('Navigate to profile analytics for:', data.athleteId);
        break;
      case 'coach_interest':
        // Navigate to messages or interest details
        console.log('Navigate to coach interest');
        break;
      default:
        console.log('Unknown notification type:', data.type);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        notificationData,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
