import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Switch, TouchableOpacity, Image, KeyboardAvoidingView, Platform, RefreshControl, Alert } from 'react-native';
import {
  Text,
  Avatar,
  useTheme,
  Surface,
  IconButton,
  Button,
  Divider,
  ActivityIndicator,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, updateUserData } from '../store/slices/authSlice';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import api from '../services/api';
import { StatusBar } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import API_URL from '../services/api';
import cacheService from '../services/cacheService';

// Define Asset type from ImagePicker
type Asset = ImagePicker.ImagePickerAsset;

type IconName = 'moon' | 'notifications' | 'globe' | 'shield-checkmark' | 'chevron-forward' | 'save' | 'document-text';

interface SettingItem {
  icon: IconName;
  label: string;
  type: 'switch' | 'link';
  value?: boolean | string;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

type RootStackParamList = {
  EditProfile: undefined;
  CacheSettings: undefined;
};

interface UserProfile {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  streak: number;
  profilePicture?: string;
  lastFetched?: number;
}

interface ProfileRestrictions {
  emailChangeAllowed: boolean;
  nameChangeAllowed: boolean;
  lastEmailChange: string;
  lastNameChange: string;
  emailNextChangeDate: string;
  nameNextChangeDate: string;
}

export default function AccountScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<Asset | null>(null);
  const [restrictions, setRestrictions] = useState<ProfileRestrictions | null>(null);
  const [error, setError] = useState('');
  
  // Get user data from Redux store
  const { user: reduxUser } = useAppSelector(state => state.auth);
  
  // Memoize the profile image URL to prevent repeated URL construction
  const profileImageUrl = React.useMemo(() => {
    if (!user?.profilePicture) return undefined;
    return user.profilePicture.startsWith('http') 
      ? user.profilePicture 
      : `${api.defaults.baseURL}${user.profilePicture}`;
  }, [user?.profilePicture]);

  // Fetch latest user data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      const fetchUserData = async () => {
        // If we already have user data in Redux, use it immediately
        if (reduxUser && isMounted) {
          setUser(reduxUser);
          setName(reduxUser.name || '');
          setEmail(reduxUser.email || '');
          setLoading(false);
          
          // Avoid duplicate fetches - if we have recent data, don't fetch again
          if (reduxUser && 'lastFetched' in reduxUser && 
              Date.now() - (reduxUser.lastFetched as number) < 60000) {
            return;
          }
        }
        
        try {
          // Try to get data from cache first (without showing loading if we already have data)
          const cachedUser = await cacheService.getCachedUserData();
          
          // Only update if component is still mounted
          if (!isMounted) return;
          
          if (cachedUser) {
            // Use cached data
            setUser(cachedUser);
            setName(cachedUser.name || '');
            setEmail(cachedUser.email || '');
            dispatch(updateUserData({...cachedUser, lastFetched: Date.now()}));
            setLoading(false);
            
            // Only do a background refresh if the cache is older than 5 minutes
            const cacheAge = Date.now() - (cachedUser.lastFetched as number || 0);
            if (cacheAge < 300000) return; // Skip refresh if cache is fresh (less than 5 minutes old)
            
            // Do a quick background refresh (without showing loading)
            try {
              const response = await api.get(`/auth/me?t=${new Date().getTime()}`);
              
              // Only update if component is still mounted
              if (!isMounted) return;
              
              if (response.data) {
                // Add lastFetched timestamp
                const userData = {...response.data, lastFetched: Date.now()};
                
                await cacheService.cacheUserData(userData);
                dispatch(updateUserData(userData));
                setUser(userData);
                setName(userData.name || '');
                setEmail(userData.email || '');
              }
            } catch (error) {
              console.error('Background refresh error:', error);
            }
          } else if (!reduxUser) {
            // No cache and no Redux data, show loading and fetch from API
            if (isMounted) setLoading(true);
            const response = await api.get(`/auth/me?t=${new Date().getTime()}`);
            
            // Only update if component is still mounted
            if (!isMounted) return;
            
            if (response.data) {
              // Add lastFetched timestamp
              const userData = {...response.data, lastFetched: Date.now()};
              
              await cacheService.cacheUserData(userData);
              dispatch(updateUserData(userData));
              setUser(userData);
              setName(userData.name || '');
              setEmail(userData.email || '');
            }
            setLoading(false);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          if (isMounted) setLoading(false);
        }
      };

      fetchUserData();
      
      // Cleanup function to handle unmounting
      return () => {
        isMounted = false;
      };
    }, [dispatch, reduxUser])
  );

  useEffect(() => {
    fetchRestrictions();
  }, []);

  const fetchRestrictions = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${api.defaults.baseURL}/auth/restrictions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch restrictions');
      }

      const restrictionsData = await response.json();
      setRestrictions(restrictionsData);
    } catch (error) {
      console.error('Error fetching restrictions:', error);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const settingsSections: SettingSection[] = [
    {
      title: 'Legal',
      items: [
        {
          icon: 'document-text',
          label: 'Terms & Conditions',
          type: 'link',
          onPress: () => {
            Alert.alert(
              'Terms & Conditions',
              `Last Updated: ${new Date().toLocaleDateString()}

1. Acceptance of Terms
By accessing and using this application, you accept and agree to be bound by these Terms and Conditions.

2. User Accounts
- You must provide accurate information when creating an account
- You are responsible for maintaining the confidentiality of your account
- You must notify us immediately of any unauthorized use of your account

3. Content and Intellectual Property
- All course materials, lessons, and content are protected by copyright
- You may not reproduce, distribute, or modify any content without permission
- Your progress and achievements are stored securely on our servers

4. User Conduct
- You agree to use the application for educational purposes only
- You will not attempt to bypass any security measures
- You will not share your account credentials with others

5. Termination
We reserve the right to terminate or suspend your account for violations of these terms.

6. Changes to Terms
We may modify these terms at any time. Continued use of the application constitutes acceptance of modified terms.`,
              [{ text: 'Close', style: 'cancel' }]
            );
          },
        },
        {
          icon: 'shield-checkmark',
          label: 'Privacy Policy',
          type: 'link',
          onPress: () => {
            Alert.alert(
              'Privacy Policy',
              `Last Updated: ${new Date().toLocaleDateString()}

1. Information We Collect
- Account information (name, email, profile picture)
- Learning progress and achievements
- Device information and usage statistics
- Cache data for offline access

2. How We Use Your Information
- To provide and improve our services
- To track your learning progress
- To personalize your learning experience
- To communicate important updates

3. Data Storage and Security
- Your data is stored securely on our servers
- We implement industry-standard security measures
- Regular backups are performed to prevent data loss

4. Third-Party Services
- We use analytics tools to improve our services
- Some features may require third-party integrations
- We ensure all third-party services comply with privacy standards

5. Your Rights
- You can access and update your personal information
- You can request deletion of your account and data
- You can opt-out of certain data collection

6. Cookies and Local Storage
- We use cookies to enhance your experience
- Local storage is used for caching and offline access
- You can clear your cache at any time

7. Children's Privacy
- Our services are not intended for children under 13
- We do not knowingly collect data from children

8. Changes to Privacy Policy
We may update this policy periodically. Continued use of the application constitutes acceptance of the updated policy.`,
              [{ text: 'Close', style: 'cancel' }]
            );
          },
        },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out of your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout())
        }
      ],
      { cancelable: true }
    );
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <View style={styles.headerSection}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Account</Text>
              <Text style={styles.headerSubtitle}>Manage your profile</Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <Surface style={styles.profileCard}>
          <View style={styles.profileContent}>
            <View style={styles.avatarSection}>
              {user?.profilePicture ? (
                <Avatar.Image 
                  size={80} 
                  source={{ 
                    uri: profileImageUrl || undefined
                  }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Text 
                  size={80} 
                  label={user?.name?.charAt(0) || 'U'}
                  style={styles.avatar}
                  labelStyle={styles.avatarLabel}
                />
              )}
            </View>

            <View style={styles.profileInfo}>
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <>
                  <Text style={styles.userName}>{user?.name || 'Loading...'}</Text>
                  <Text style={styles.userEmail}>{user?.email || 'Loading...'}</Text>
                </>
              )}
            </View>

            <Button
              mode="outlined"
              onPress={handleEditProfile}
              style={styles.editButton}
              icon="pencil"
            >
              Edit Profile
            </Button>
          </View>
        </Surface>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Surface style={styles.settingsCard}>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={item.label}>
                  <TouchableOpacity
                    style={styles.settingItem}
                    onPress={item.type === 'link' ? item.onPress : undefined}
                  >
                    <View style={styles.settingLeft}>
                      <View style={styles.iconContainer}>
                        <Ionicons name={item.icon} size={20} color="#6366F1" />
                      </View>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                    </View>
                    
                    {item.type === 'switch' ? (
                      <Switch
                        value={item.value as boolean}
                        onValueChange={item.onValueChange}
                        trackColor={{ false: '#E5E7EB', true: '#818CF8' }}
                        thumbColor={item.value ? '#6366F1' : '#FFFFFF'}
                      />
                    ) : (
                      <View style={styles.settingRight}>
                        {item.value && (
                          <Text style={styles.settingValue}>{item.value}</Text>
                        )}
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                      </View>
                    )}
                  </TouchableOpacity>
                  {itemIndex < section.items.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Surface>
          </View>
        ))}

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor="#EF4444"
          icon="logout"
        >
          Logout
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
  headerSection: {
    backgroundColor: '#6366F1',
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContent: {
    marginLeft: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    marginBottom: 24,
    overflow: 'hidden',
  },
  profileContent: {
    padding: 24,
    alignItems: 'center',
  },
  avatarSection: {
    marginBottom: 16,
  },
  avatarLabel: {
    fontSize: 32,
    color: '#6366F1',
  },
  profileInfo: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  editButton: {
    borderColor: '#6366F1',
    borderRadius: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  settingsCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
    borderColor: '#EF4444',
    borderRadius: 12,
  },
  restrictionText: {
    fontSize: 12,
    color: 'orange',
    marginTop: -5,
    marginBottom: 10,
  },
  avatar: {
    backgroundColor: '#EEF2FF',
  },
}); 