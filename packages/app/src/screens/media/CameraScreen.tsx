import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { ProfileScreenNavigationProp, CameraScreenRouteProp } from '../../navigation/types';
import { uploadProfilePicture, uploadVideo } from '../../services/media';
import { useProfile } from '../../hooks/useProfile';

export default function CameraScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute<CameraScreenRouteProp>();
  const { mode } = route.params;
  const { profile, fetchProfile } = useProfile();

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="#6b7280" />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          We need camera access to take photos and videos for your profile.
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.backButton}
        />
      </View>
    );
  }

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        if (photo) {
          setCapturedMedia(photo.uri);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          maxDuration: 60,
        });
        if (video) {
          setCapturedMedia(video.uri);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to record video');
      } finally {
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const retake = () => {
    setCapturedMedia(null);
  };

  const handleUpload = async () => {
    if (!capturedMedia || !profile) return;

    setIsUploading(true);
    try {
      if (mode === 'photo') {
        const url = await uploadProfilePicture(capturedMedia, profile.id);
        if (url) {
          await fetchProfile();
          Alert.alert('Success', 'Profile picture updated!');
          navigation.goBack();
        } else {
          Alert.alert('Error', 'Failed to upload photo');
        }
      } else {
        const id = await uploadVideo(
          capturedMedia,
          profile.id,
          'Highlight Video',
          ''
        );
        if (id) {
          Alert.alert('Success', 'Video uploaded!');
          navigation.goBack();
        } else {
          Alert.alert('Error', 'Failed to upload video');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Preview captured media
  if (capturedMedia) {
    return (
      <View style={styles.previewContainer}>
        {mode === 'photo' ? (
          <Image source={{ uri: capturedMedia }} style={styles.preview} />
        ) : (
          <Video
            source={{ uri: capturedMedia }}
            style={styles.preview}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
          />
        )}
        <View style={styles.previewActions}>
          <Button
            title="Retake"
            onPress={retake}
            variant="outline"
            style={styles.previewButton}
            disabled={isUploading}
          />
          <Button
            title={mode === 'photo' ? 'Use Photo' : 'Upload Video'}
            onPress={handleUpload}
            loading={isUploading}
            style={styles.previewButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode={mode === 'photo' ? 'picture' : 'video'}
      >
        {/* Top controls */}
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={toggleFacing}>
            <Ionicons name="camera-reverse" size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Mode indicator */}
        <View style={styles.modeIndicator}>
          <Text style={styles.modeText}>
            {mode === 'photo' ? 'PHOTO' : 'VIDEO'}
          </Text>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          {mode === 'photo' ? (
            <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.captureButton,
                isRecording && styles.recordingButton,
              ]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <View
                style={[
                  styles.captureButtonInner,
                  isRecording && styles.recordingButtonInner,
                ]}
              />
            </TouchableOpacity>
          )}
          {isRecording && (
            <Text style={styles.recordingText}>Recording...</Text>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  backButton: {
    marginTop: 12,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
  },
  controlButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeIndicator: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  modeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
  },
  recordingButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  recordingButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  recordingText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  preview: {
    flex: 1,
  },
  previewActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#1a1a2e',
  },
  previewButton: {
    flex: 1,
  },
});
