import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, setSessionToken, clearSessionToken, getSessionToken } from '../services/api';
import { storeUserData, getUserData, clearUserData, StoredUser } from '../services/storage';

interface AuthContextType {
  user: StoredUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check for stored session
      const token = await getSessionToken();
      const storedUser = await getUserData();

      if (token && storedUser) {
        // Verify session is still valid
        try {
          const response = await apiClient.get('/auth/me');
          if (response.data.user) {
            setUser({
              id: response.data.user.id,
              email: response.data.user.email,
              role: response.data.user.role,
            });
          }
        } catch {
          // Session expired, clear stored data
          await clearSessionToken();
          await clearUserData();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });

      if (response.data.user) {
        const userData: StoredUser = {
          id: response.data.user.id,
          email: response.data.user.email,
          role: response.data.user.role,
        };

        // Store session token if provided
        if (response.data.sessionId) {
          await setSessionToken(response.data.sessionId);
        }

        await storeUserData(userData);
        setUser(userData);

        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      return {
        success: false,
        error: axiosError.response?.data?.error || 'Login failed',
      };
    }
  };

  const register = async (email: string, password: string, role: string = 'athlete') => {
    try {
      const response = await apiClient.post('/auth/register', { email, password, role });

      if (response.data.user) {
        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      const errors = axiosError.response?.data?.errors;
      return {
        success: false,
        error: errors?.[0]?.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      await clearSessionToken();
      await clearUserData();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      if (response.data.user) {
        const userData: StoredUser = {
          id: response.data.user.id,
          email: response.data.user.email,
          role: response.data.user.role,
        };
        await storeUserData(userData);
        setUser(userData);
      }
    } catch {
      await logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
