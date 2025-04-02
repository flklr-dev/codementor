import React from 'react';
import { StyleSheet, View, ScrollView, Switch, TouchableOpacity } from 'react-native';
import {
  Text,
  Avatar,
  useTheme,
  Surface,
  IconButton,
  Button,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type IconName = 'moon' | 'notifications' | 'globe' | 'shield-checkmark' | 'chevron-forward';

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
};

export default function AccountScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  const userProfile = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: null,
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const settingsSections: SettingSection[] = [
    {
      title: 'Preferences',
      items: [
        {
          icon: 'moon',
          label: 'Dark Mode',
          type: 'switch',
          value: isDarkMode,
          onValueChange: setIsDarkMode,
        },
        {
          icon: 'notifications',
          label: 'Notifications',
          type: 'switch',
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          icon: 'globe',
          label: 'Language',
          value: 'English',
          type: 'link',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: 'shield-checkmark',
          label: 'Privacy Settings',
          type: 'link',
          onPress: () => {},
        },
      ],
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: '#6366F1' }]}>
        <IconButton
          icon="chevron-left"
          size={24}
          iconColor="#FFFFFF"
          style={{ opacity: 0 }}
        />
        <Text style={styles.headerTitle}>Account</Text>
        <IconButton
          icon="chevron-left"
          size={24}
          iconColor="#FFFFFF"
          style={{ opacity: 0 }}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <Surface style={styles.profileCard}>
          <View style={styles.profileContent}>
            <View style={styles.avatarSection}>
              {userProfile.avatar ? (
                <Avatar.Image 
                  size={80} 
                  source={{ uri: userProfile.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Text 
                  size={80} 
                  label={userProfile.name.charAt(0)}
                  style={styles.avatar}
                  labelStyle={styles.avatarLabel}
                />
              )}
              <View style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userProfile.name}</Text>
              <Text style={styles.userEmail}>{userProfile.email}</Text>
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
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#EEF2FF',
  },
  avatarLabel: {
    fontSize: 32,
    color: '#6366F1',
  },
  editAvatarButton: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
}); 