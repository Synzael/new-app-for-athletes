import { useState, useCallback } from 'react';
import { takePhoto, recordVideo, pickImage, pickVideo, MediaResult } from '../services/media';

interface UseCameraReturn {
  media: MediaResult | null;
  isCapturing: boolean;
  error: string | null;
  capturePhoto: () => Promise<void>;
  captureVideo: () => Promise<void>;
  selectImage: () => Promise<void>;
  selectVideo: () => Promise<void>;
  clearMedia: () => void;
}

export function useCamera(): UseCameraReturn {
  const [media, setMedia] = useState<MediaResult | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capturePhoto = useCallback(async () => {
    setIsCapturing(true);
    setError(null);

    try {
      const result = await takePhoto();
      if (result) {
        setMedia(result);
      } else {
        setError('Photo capture cancelled or permission denied');
      }
    } catch (err) {
      setError('Failed to capture photo');
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const captureVideo = useCallback(async () => {
    setIsCapturing(true);
    setError(null);

    try {
      const result = await recordVideo();
      if (result) {
        setMedia(result);
      } else {
        setError('Video capture cancelled or permission denied');
      }
    } catch (err) {
      setError('Failed to capture video');
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const selectImage = useCallback(async () => {
    setIsCapturing(true);
    setError(null);

    try {
      const result = await pickImage();
      if (result) {
        setMedia(result);
      } else {
        setError('Image selection cancelled or permission denied');
      }
    } catch (err) {
      setError('Failed to select image');
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const selectVideo = useCallback(async () => {
    setIsCapturing(true);
    setError(null);

    try {
      const result = await pickVideo();
      if (result) {
        setMedia(result);
      } else {
        setError('Video selection cancelled or permission denied');
      }
    } catch (err) {
      setError('Failed to select video');
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const clearMedia = useCallback(() => {
    setMedia(null);
    setError(null);
  }, []);

  return {
    media,
    isCapturing,
    error,
    capturePhoto,
    captureVideo,
    selectImage,
    selectVideo,
    clearMedia,
  };
}
