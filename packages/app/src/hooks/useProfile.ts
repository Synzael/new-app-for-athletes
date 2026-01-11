import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';

export interface Athlete {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  bio?: string;
  profilePictureUrl?: string;
  hometown?: string;
  highSchool?: string;
  college?: string;
  graduationYear?: number;
  primarySport?: string;
  positions?: string[];
  heightFeet?: string;
  weight?: number;
  phoneNumber?: string;
  socialMediaLinks?: string[];
  performanceScore?: number;
  physicalScore?: number;
  academicScore?: number;
  socialScore?: number;
  evaluationScore?: number;
  starRating?: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAthleteData {
  firstName: string;
  lastName: string;
  primarySport?: string;
  positions?: string[];
  graduationYear?: number;
  heightFeet?: string;
  weight?: number;
  hometown?: string;
  highSchool?: string;
  bio?: string;
  profilePictureUrl?: string;
  isPublic?: boolean;
}

export interface UpdateAthleteData extends Partial<CreateAthleteData> {}

interface UseProfileReturn {
  profile: Athlete | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  createProfile: (data: CreateAthleteData) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: UpdateAthleteData) => Promise<{ success: boolean; error?: string }>;
  hasProfile: boolean;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<Athlete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/athletes/me');
      setProfile(response.data.athlete);
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { error?: string } } };
      if (axiosError.response?.status === 404) {
        // No profile exists yet
        setProfile(null);
      } else {
        setError(axiosError.response?.data?.error || 'Failed to fetch profile');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProfile = async (data: CreateAthleteData) => {
    try {
      const response = await apiClient.post('/athletes', data);
      setProfile(response.data.athlete);
      return { success: true };
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      return {
        success: false,
        error: axiosError.response?.data?.error || 'Failed to create profile',
      };
    }
  };

  const updateProfile = async (data: UpdateAthleteData) => {
    if (!profile) {
      return { success: false, error: 'No profile to update' };
    }

    try {
      const response = await apiClient.put(`/athletes/${profile.id}`, data);
      setProfile(response.data.athlete);
      return { success: true };
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      return {
        success: false,
        error: axiosError.response?.data?.error || 'Failed to update profile',
      };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    createProfile,
    updateProfile,
    hasProfile: !!profile,
  };
}
