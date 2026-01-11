import * as SecureStore from 'expo-secure-store';

const USER_DATA_KEY = 'user_data';

export interface StoredUser {
  id: string;
  email: string;
  role: string;
}

export const storeUserData = async (user: StoredUser) => {
  await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
};

export const getUserData = async (): Promise<StoredUser | null> => {
  const data = await SecureStore.getItemAsync(USER_DATA_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return null;
};

export const clearUserData = async () => {
  await SecureStore.deleteItemAsync(USER_DATA_KEY);
};
