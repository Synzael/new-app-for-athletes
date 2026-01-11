import * as ImagePicker from 'expo-image-picker';
import { apiClient } from './api';

export interface MediaResult {
  uri: string;
  width: number;
  height: number;
  type: 'image' | 'video';
  duration?: number;
}

export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

export async function requestMediaLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

export async function takePhoto(): Promise<MediaResult | null> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    type: 'image',
  };
}

export async function recordVideo(): Promise<MediaResult | null> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['videos'],
    allowsEditing: true,
    videoMaxDuration: 60, // 60 second limit
    quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    type: 'video',
    duration: asset.duration,
  };
}

export async function pickImage(): Promise<MediaResult | null> {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    type: 'image',
  };
}

export async function pickVideo(): Promise<MediaResult | null> {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    allowsEditing: true,
    videoMaxDuration: 60,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    type: 'video',
    duration: asset.duration,
  };
}

export async function uploadProfilePicture(
  uri: string,
  athleteId: string
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as unknown as Blob);

    const response = await apiClient.post(
      `/athletes/${athleteId}/profile-picture`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.url;
  } catch (error) {
    console.error('Failed to upload profile picture:', error);
    return null;
  }
}

export async function uploadVideo(
  uri: string,
  athleteId: string,
  title: string,
  description: string
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'video/mp4',
      name: 'highlight.mp4',
    } as unknown as Blob);
    formData.append('title', title);
    formData.append('description', description);

    const response = await apiClient.post(
      `/videos/${athleteId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.video?.id;
  } catch (error) {
    console.error('Failed to upload video:', error);
    return null;
  }
}
