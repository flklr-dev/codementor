import React from 'react';
import { StyleSheet, View, ScrollView, Switch } from 'react-native';
import {
  Text,
  Avatar,
  useTheme,
  Surface,
  IconButton,
  Button,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';

export default function AccountScreen() {
  const theme = useTheme();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const dispatch = useAppDispatch();

  const userProfile = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    level: 12,
    xp: 2450,
    nextLevelXp: 3000,
    avatar: null, // Add avatar URL here
  };

  const settingsSections = [
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
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'mail',
          label: 'Email',
          value: userProfile.email,
          type: 'link',
        },
        {
          icon: 'lock-closed',
          label: 'Change Password',
          type: 'link',
        },
        {
          icon: 'shield-checkmark',
          label: 'Privacy Settings',
          type: 'link',
        },
      ],
    },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Header */}
      <LinearGradient
        colors={['#6366F1', '#818CF8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <View style={styles.profileInfo}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {userProfile.avatar ? (
                <Avatar.Image 
                  size={100} 
                  source={{ uri: userProfile.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Text 
                  size={100} 
                  label={userProfile.name.charAt(0)}
                  style={styles.avatar}
                />
              )}
              <View style={styles.editAvatarButton}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </View>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userProfile.name}</Text>
              <Text style={styles.userEmail}>{userProfile.email}</Text>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.levelBadgeContainer}>
              <Surface style={styles.levelBadge}>
                <Text style={styles.levelText}>{userProfile.level}</Text>
              </Surface>
              <Text style={styles.levelLabel}>LEVEL</Text>
            </View>

            <View style={styles.xpContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Experience Points</Text>
                <Text style={styles.xpText}>
                  {userProfile.xp}/{userProfile.nextLevelXp} XP
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBarFill,
                    { width: `${(userProfile.xp / userProfile.nextLevelXp) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressSubtext}>
                {userProfile.nextLevelXp - userProfile.xp} XP until next level
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {settingsSections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Surface style={styles.settingsCard}>
              {section.items.map((item, itemIndex) => (
                <View
                  key={item.label}
                  style={[
                    styles.settingItem,
                    itemIndex < section.items.length - 1 && styles.settingBorder,
                  ]}>
                  <View style={styles.settingLeft}>
                    <View style={styles.iconContainer}>
                      <Ionicons name={item.icon} size={20} color="#6366F1" />
                    </View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  
                  {item.type === 'switch' ? (
                    <Switch
                      value={item.value}
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
                </View>
              ))}
            </Surface>
          </View>
        ))}

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor="#EF4444">
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
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileInfo: {
    gap: 24,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#6366F1',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  
  // Updated styles to match AchievementsScreen
  levelBadgeContainer: {
    alignItems: 'center',
  },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },
  levelText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366F1',
  },
  levelLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  xpContainer: {
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  xpText: {
    fontSize: 14,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FCD34D',
    borderRadius: 5,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
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
  settingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  },
}); 