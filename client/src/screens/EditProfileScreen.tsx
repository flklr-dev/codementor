import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, Platform, Alert } from 'react-native';
import {
  Text,
  Button,
  TextInput,
  useTheme,
  IconButton,
  Avatar,
  HelperText,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateUserData } from '../store/slices/authSlice';
import api from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Account: undefined;
};

export default function EditProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  
  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [canChangeName, setCanChangeName] = useState(true);
  const [nameChangeCountdown, setNameChangeCountdown] = useState('');
  
  // Load existing profile picture if available
  useEffect(() => {
    if (user?.profilePicture) {
      // If the profilePicture starts with http, it's already a full URL
      if (user.profilePicture.startsWith('http')) {
        setProfileImage(user.profilePicture);
      } else {
        // Otherwise, prepend the server URL
        const serverUrl = api.defaults.baseURL || '';
        setProfileImage(`${serverUrl}${user.profilePicture}`);
      }
    }
    
    // Check if name can be changed (7-day restriction)
    checkNameChangeEligibility();
  }, [user]);

  // Check if user can change their name (7-day restriction)
  const checkNameChangeEligibility = () => {
    if (!user || !user.lastNameChange) {
      setCanChangeName(true);
      return;
    }
    
    const lastChangeDate = new Date(user.lastNameChange);
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - lastChangeDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      setCanChangeName(false);
      
      // Calculate remaining days
      const remainingDays = 7 - diffDays;
      setNameChangeCountdown(`You can change your name again in ${remainingDays} day${remainingDays > 1 ? 's' : ''}`);
    } else {
      setCanChangeName(true);
      setNameChangeCountdown('');
    }
  };

  // Request permission to access photo library
  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to select a profile picture.');
        return false;
      }
      return true;
    }
    return true;
  };

  // Handle selecting an image from the gallery
  const handleSelectImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0].uri;
        setProfileImage(selectedImage);
        setHasChanges(true);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'There was an error selecting the image.');
    }
  };

  // Update hasChanges when name or profile image changes
  useEffect(() => {
    // Name has changed and name change is allowed
    const nameChanged = canChangeName && user?.name !== name && name.trim() !== '';
    
    // Profile image has changed
    const imageChanged = !!profileImage && (!user?.profilePicture || !profileImage.includes(user.profilePicture));
    
    setHasChanges(nameChanged || imageChanged);
  }, [name, profileImage, user, canChangeName]);

  // Function to handle profile update
  const handleUpdateProfile = async () => {
    // Validate form
    if (name.trim() === '') {
      setNameError('Name is required');
      return;
    } else {
      setNameError('');
    }
    
    // Check if we have actual changes
    if (!hasChanges) {
      Alert.alert(
        'No Changes',
        'No changes were made to your profile.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Proceed with update
    setIsLoading(true);
    
    try {
      // Create form data for multipart/form-data request (necessary for file upload)
      const formData = new FormData();
      
      // Only append name if changed and allowed
      if (canChangeName && user?.name !== name && name.trim() !== '') {
        formData.append('name', name);
      }
      
      // Append profile picture if changed
      if (profileImage && (!user?.profilePicture || !profileImage.includes(user.profilePicture))) {
        const uriParts = profileImage.split('.');
        const fileType = uriParts.length > 1 ? uriParts[uriParts.length - 1].toLowerCase() : 'jpg';
        
        const fileName = `profile-${Date.now()}.${fileType}`;
        
        const fileObj = {
          uri: profileImage,
          name: fileName,
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`
        };
        
        formData.append('profilePicture', fileObj as any);
      }
      
      // Send update request
      const response = await api.put('/auth/profile/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data) {
        // Get the base URL for image paths
        const baseUrl = api.defaults.baseURL || '';
        
        // If we have a profile picture from the server response
        if (response.data.profilePicture) {
          // Construct the full URL if it's a relative path
          const fullImageUrl = response.data.profilePicture.startsWith('http') 
            ? response.data.profilePicture 
            : `${baseUrl}${response.data.profilePicture}`;
          
          // Store the full image URL directly
          response.data.fullProfilePictureUrl = fullImageUrl;
        }
        
        // Update lastNameChange date if name was changed
        if (canChangeName && user?.name !== name && name.trim() !== '') {
          response.data.lastNameChange = new Date().toISOString();
        }
        
        // Update Redux state with the response data
        dispatch(updateUserData(response.data));
        
        // Success message and navigate back
        Alert.alert(
          'Success',
          'Your profile has been updated successfully.',
          [{ text: 'OK', onPress: () => navigation.navigate('Account') }]
        );
      }
    } catch (error: any) {
      console.error('Error updating profile:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || 'Failed to update profile. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <IconButton
          icon="arrow-left"
          iconColor="#FFFFFF"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Avatar.Text
                size={120}
                label={name.charAt(0) || user?.name?.charAt(0) || 'U'}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
            )}
            
            <View style={styles.photoButtonContainer}>
              <Button
                mode="contained"
                onPress={handleSelectImage}
                style={styles.photoButton}
                icon="camera"
                labelStyle={styles.photoButtonLabel}
              >
                Change Photo
              </Button>
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Name</Text>
              {!canChangeName && (
                <Text style={styles.restrictionText}>🔒 {nameChangeCountdown}</Text>
              )}
            </View>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={text => {
                if (canChangeName) {
                  setName(text);
                  if (text.trim() === '') {
                    setNameError('Name is required');
                  } else {
                    setNameError('');
                  }
                }
              }}
              placeholder="Your name"
              mode="outlined"
              error={!!nameError}
              disabled={!canChangeName}
            />
            {nameError ? (
              <HelperText type="error" visible={!!nameError}>
                {nameError}
              </HelperText>
            ) : null}
          </View>
          
          <Surface style={styles.warningCard}>
            <View style={styles.warningContent}>
              <Ionicons name="warning" size={24} color="#F59E0B" />
              <Text style={styles.warningText}>
                Name changes are limited to once every 7 days for security reasons.
              </Text>
            </View>
          </Surface>
        </View>

        <Button
          mode="contained"
          onPress={handleUpdateProfile}
          style={[
            styles.saveButton,
            !hasChanges && styles.disabledButton
          ]}
          disabled={isLoading || !hasChanges || !!nameError}
          icon="content-save"
          loading={isLoading}
          labelStyle={styles.saveButtonLabel}
        >
          {isLoading ? 'Updating...' : 'Save Changes'}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#6366F1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#EEF2FF',
  },
  avatar: {
    backgroundColor: '#6366F1',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#EEF2FF',
  },
  avatarLabel: {
    fontSize: 48,
  },
  photoButtonContainer: {
    width: '70%',
    borderRadius: 12,
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  photoButton: {
    borderRadius: 12,
    backgroundColor: '#6366F1',
    paddingVertical: 2,
  },
  photoButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  formGroup: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
  },
  restrictionText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  warningCard: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    elevation: 0,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 18,
  },
  saveButton: {
    borderRadius: 12,
    backgroundColor: '#6366F1',
    marginTop: 16,
    paddingVertical: 4,
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#A5A6F6',
    opacity: 0.7,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
}); 