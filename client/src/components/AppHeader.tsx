import React, { useEffect, useState } from 'react';
import { StyleSheet, View, StatusBar, TouchableOpacity } from 'react-native';
import { Text, Avatar, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector } from '../store/hooks';
import { TabNavigatorParamList } from '../navigation/AppNavigator';
import api from '../services/api';

// Define navigation prop type for this component
type AppHeaderNavigation = StackNavigationProp<TabNavigatorParamList>;

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

export default function AppHeader({
  title,
  showBackButton = false,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AppHeaderNavigation>();
  const { user } = useAppSelector(state => state.auth);
  
  // Get first letter of name for avatar
  const avatarText = user?.name ? user.name.charAt(0).toUpperCase() : 'C';
  
  // Use the user's name if available
  const userName = user?.name || 'Coder';
  
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (user?.profilePicture) {
      try {
        console.log('Attempting to display profile picture:', user.profilePicture);
        
        // Check for pre-constructed URLs first
        if (user.profilePictureUrl) {
          console.log('Using server-provided URL:', user.profilePictureUrl);
          setProfileImageUrl(user.profilePictureUrl);
          return;
        }
        
        if (user.fullProfilePictureUrl) {
          console.log('Using fullProfilePictureUrl:', user.fullProfilePictureUrl);
          setProfileImageUrl(user.fullProfilePictureUrl);
          return;
        }
        
        // Direct URL check
        if (user.profilePicture.startsWith('http')) {
          console.log('Using direct http URL:', user.profilePicture);
          setProfileImageUrl(user.profilePicture);
          return;
        }
        
        // Build URL from parts - handle different path formats
        const baseUrl = api.defaults.baseURL || '';
        // Remove /api from the base URL if the profilePicture already has /public
        const adjustedBaseUrl = user.profilePicture.startsWith('/public') && baseUrl.includes('/api') 
          ? baseUrl.replace('/api', '')
          : baseUrl;
        
        // Construct the full URL
        const fullUrl = `${adjustedBaseUrl}${user.profilePicture}`;
        console.log('Constructed profile image URL:', fullUrl);
        setProfileImageUrl(fullUrl);
      } catch (error) {
        console.error('Error processing profile picture URL:', error);
        setProfileImageUrl(null);
      }
    } else {
      console.log('No profile picture available');
      setProfileImageUrl(null);
    }
  }, [user]);
  
  const handleProfilePress = () => {
    navigation.navigate('Account');
  };
  
  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <StatusBar translucent backgroundColor="#6366F1" barStyle="light-content" />
        
        {showBackButton ? (
          <IconButton
            icon="arrow-left"
            iconColor="#FFFFFF"
            size={24}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          />
        ) : null}
        
        <TouchableOpacity 
          style={styles.headerLeft}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          {profileImageUrl ? (
            <Avatar.Image
              size={40}
              source={{ uri: profileImageUrl }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text
              size={40}
              label={userName.charAt(0).toUpperCase()}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
          )}
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <View style={styles.statsRow}>
              <Text style={styles.levelText}>Level {user?.level || 1}</Text>
              <View style={styles.streakContainer}>
                <View style={styles.streakCircle}>
                  <Text style={styles.streakText}>{user?.streak || 0}</Text>
                  <Ionicons name="flame" size={16} color="#FCD34D" />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    zIndex: 10,
    backgroundColor: '#6366F1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: '#A78BFA',
  },
  avatarLabel: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelText: {
    color: '#E5E7EB',
    fontSize: 13,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  streakText: {
    color: '#FCD34D',
    fontSize: 13,
    fontWeight: '500',
  },
  notificationButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 8,
  },
}); 