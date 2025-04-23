import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import {
  Text,
  useTheme,
  Button,
  Avatar,
  Card,
  IconButton,
  ProgressBar,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp, createStackNavigator } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { TabNavigatorParamList } from '../navigation/AppNavigator';
import api from '../services/api';
import { updateUserData } from '../store/slices/authSlice';
import AppHeader from '../components/AppHeader';
import XPProgressBar from '../components/XPProgressBar';
import cacheService from '../services/cacheService';

// Define stats interface
interface UserStats {
  streak: number;
  completedLessons: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  quizAverage: number;
  completedQuizzes: number;
  todayLessons: number;
  todayQuizzes: number;
  recentActivities?: Array<{
    type: string;
    title: string;
    timestamp: Date;
    details?: string;
  }>;
}

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<TabNavigatorParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  
  // Get the user from auth state
  const { user } = useAppSelector(state => state.auth);
  
  // Get first letter of name for avatar
  const avatarText = user?.name ? user.name.charAt(0).toUpperCase() : 'C';
  
  // Use the user's name if available
  const userName = user?.name || 'Coder';

  // Initialize user stats with default values from Redux
  const [userStats, setUserStats] = useState<UserStats>({
    streak: user?.streak || 0,
    completedLessons: 0,
    level: user?.level || 1,
    xp: user?.xp || 0,
    nextLevelXp: user?.level ? user.level * 1000 : 1000,
    quizAverage: 0,
    completedQuizzes: 0,
    todayLessons: 0,
    todayQuizzes: 0
  });

  const getUserId = () => {
    return user?.id || user?._id;
  };

  const forceRefresh = async () => {
    try {
      // Try to get data from cache first
      const cachedUser = await cacheService.getCachedUserData();
      
      // If cache miss or explicitly forcing refresh
      if (!cachedUser || refreshing) {
        const response = await api.get(`/auth/me?t=${new Date().getTime()}`);
        if (response.data) {
          // Update cache with new data
          await cacheService.cacheUserData(response.data);
          // Update Redux store
          dispatch(updateUserData(response.data));
          console.log('User data refreshed from server');
          return response.data;
        }
      } else {
        // Use cached data
        dispatch(updateUserData(cachedUser));
        console.log('User data loaded from cache');
        return cachedUser;
      }
      return null;
    } catch (error) {
      console.error('Force refresh failed:', error);
      return null;
    }
  };

  // Function to fetch user stats from the server
  const fetchUserStats = async () => {
    const userId = getUserId();
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Try to get from cache first unless we're explicitly refreshing
      if (!refreshing) {
        const cachedStats = await cacheService.getCachedUserProgress(userId);
        if (cachedStats) {
          console.log('Using cached user progress data');
          setUserStats(cachedStats);
          setLoading(false);
          return;
        }
      }
      
      console.log('Fetching user progress data from server...');
      
      // Fetch user progress data
      const timestamp = new Date().getTime();
      const progressResponse = await api.get(`/progress/users/${userId}/progress?t=${timestamp}&force=true`);
      
      if (!progressResponse.data) {
        console.error('Received empty response data');
        setLoading(false);
        return;
      }
      
      // Check for today's activities
      const today = new Date().setHours(0, 0, 0, 0);
      
      // Count today's completed lessons
      const todayLessons = progressResponse.data.completedLessons?.filter(
        (lesson: any) => new Date(lesson.completedAt).setHours(0, 0, 0, 0) === today
      ).length || 0;
      
      // Count today's quizzes
      const todayQuizzes = progressResponse.data.quizScores?.filter(
        (quiz: any) => new Date(quiz.completedAt).setHours(0, 0, 0, 0) === today
      ).length || 0;
      
      // Calculate quiz average
      const quizScores = progressResponse.data.quizScores || [];
      const completedQuizzes = quizScores.length;
      const avgQuizScore = completedQuizzes > 0 
        ? Math.round(quizScores.reduce((sum: number, quiz: any) => sum + quiz.score, 0) / completedQuizzes)
        : 0;
      
      // Generate recent activities from actual user data
      const recentActivities: Array<{
        type: string;
        title: string;
        timestamp: Date;
        details?: string;
      }> = [];
      
      // Add recent lessons (last 3)
      const recentLessons = [...(progressResponse.data.completedLessons || [])]
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, 3);
      
      recentLessons.forEach(lesson => {
        recentActivities.push({
          type: 'lesson',
          title: `Completed ${lesson.title || 'a lesson'}`,
          timestamp: new Date(lesson.completedAt),
          details: lesson.category
        });
      });
      
      // Add recent quizzes (last 3)
      const recentQuizzes = [...(progressResponse.data.quizScores || [])]
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, 3);
      
      recentQuizzes.forEach(quiz => {
        recentActivities.push({
          type: 'quiz',
          title: `Completed quiz with ${quiz.score}% score`,
          timestamp: new Date(quiz.completedAt),
          details: quiz.quizId
        });
      });
      
      // Add recent achievements (last 3)
      const earnedAchievements = progressResponse.data.achievements
        ?.filter((a: any) => a.earned && a.earnedAt)
        .sort((a: any, b: any) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
        .slice(0, 3) || [];
      
      earnedAchievements.forEach((achievement: any) => {
        recentActivities.push({
          type: 'achievement',
          title: `Earned "${achievement.title}" achievement`,
          timestamp: new Date(achievement.earnedAt),
          details: achievement.description
        });
      });
      
      // Sort all activities by timestamp (newest first)
      recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      // Create final stats object
      const stats = {
        streak: progressResponse.data.streak || user?.streak || 0,
        completedLessons: progressResponse.data.completedLessons?.length || 0,
        level: progressResponse.data.level || user?.level || 1,
        xp: progressResponse.data.xp || user?.xp || 0,
        nextLevelXp: progressResponse.data.nextLevelXp || (user?.level ? user.level * 1000 : 1000),
        quizAverage: avgQuizScore,
        completedQuizzes: completedQuizzes,
        todayLessons,
        todayQuizzes,
        recentActivities: recentActivities.slice(0, 5) // Keep only the 5 most recent activities
      };
      
      // Update state with fetched data
      setUserStats(stats);
      
      // Cache the progress data for future use
      await cacheService.cacheUserProgress(userId, stats);
      
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const userId = getUserId();
      if (userId) {
        console.log('Screen focused, refreshing with user ID:', userId);
        fetchUserStats();
      } else {
        console.log('Screen focused but no user ID available, trying to refresh user data');
        forceRefresh().then(() => {
          const refreshedId = getUserId();
          if (refreshedId) {
            console.log('User ID now available after refresh:', refreshedId);
            fetchUserStats();
          }
        });
      }
      
      return () => {
        // Any cleanup code can go here
      };
    }, [])
  );
  
  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await forceRefresh();
    await fetchUserStats();
    setRefreshing(false);
  };

  if (loading && !userStats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Hero Section with XP Progress */}
        <View style={styles.heroSection}>
          <XPProgressBar 
            xp={userStats.xp} 
            nextLevelXp={userStats.nextLevelXp} 
          />
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Today's Activity</Text>
          
          <View style={styles.todayStatsGrid}>
            <Card style={styles.todayCard}>
              <Card.Content style={styles.todayCardContent}>
                <View style={[styles.todayIconContainer, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="book" size={20} color="#6366F1" />
                </View>
                <Text style={styles.todayValue}>{userStats.todayLessons}</Text>
                <Text style={styles.todayLabel}>Lessons</Text>
              </Card.Content>
            </Card>

            <Card style={styles.todayCard}>
              <Card.Content style={styles.todayCardContent}>
                <View style={[styles.todayIconContainer, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="school" size={20} color="#22C55E" />
                </View>
                <Text style={styles.todayValue}>{userStats.todayQuizzes}</Text>
                <Text style={styles.todayLabel}>Quizzes</Text>
              </Card.Content>
            </Card>

            <Card style={styles.todayCard}>
              <Card.Content style={styles.todayCardContent}>
                <View style={[styles.todayIconContainer, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="flame" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.todayValue}>{userStats.streak}</Text>
                <Text style={styles.todayLabel}>Day Streak</Text>
              </Card.Content>
            </Card>
          </View>
          
          <Text style={[styles.statsTitle, { marginTop: 24 }]}>My Progress</Text>
          
          <View style={styles.statsGrid}>
            {/* Stats Cards */}
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#6366F1', '#818CF8']}
                style={styles.statContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="book" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{userStats.completedLessons}</Text>
                <Text style={styles.statLabel}>Lessons Learned</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#0EA5E9', '#38BDF8']}
                style={styles.statContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="trophy" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{userStats.quizAverage}%</Text>
                <Text style={styles.statLabel}>Quiz Average</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#8B5CF6', '#A78BFA']}
                style={styles.statContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{userStats.completedQuizzes}</Text>
                <Text style={styles.statLabel}>Quizzes Done</Text>
              </LinearGradient>
        </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#F59E0B', '#FBBF24']}
                style={styles.statContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="flame" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{userStats.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </LinearGradient>
            </View>
              </View>
        </View>

        {/* AI Mentor Section */}
        <View style={styles.sectionContainer}>
          <Card style={styles.aiMentorCard} onPress={() => navigation.navigate('Mentor')}>
            <LinearGradient
              colors={['#3B82F6', '#60A5FA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aiGradient}>
              <View style={styles.aiContent}>
                <Ionicons name="hardware-chip" size={32} color="#FFFFFF" />
                <Text style={styles.aiTitle}>AI Mentor</Text>
                <Text style={styles.aiDescription}>
                  Get instant help with your code
                </Text>
                <Button
                  mode="contained"
                  style={styles.aiButton}
                  labelStyle={styles.aiButtonLabel}
                  onPress={() => navigation.navigate('Mentor')}>
                  Ask Question
                </Button>
              </View>
            </LinearGradient>
          </Card>
        </View>

        {/* Recent Activity Section */}
        {userStats.recentActivities && userStats.recentActivities.length > 0 && (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.recentActivityContainer}>
              {userStats.recentActivities.map((activity, index) => {
                const activityDate = new Date(activity.timestamp);
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                
                let dateText = '';
                if (activityDate.setHours(0,0,0,0) === today.setHours(0,0,0,0)) {
                  dateText = 'Today';
                } else if (activityDate.setHours(0,0,0,0) === yesterday.setHours(0,0,0,0)) {
                  dateText = 'Yesterday';
                } else {
                  dateText = activityDate.toLocaleDateString([], {month: 'short', day: 'numeric'});
                }
                
                // Determine icon and color based on activity type
                let iconName = 'checkmark-circle';
                let bgColor = '#6366F1';
                
                if (activity.type === 'quiz') {
                  iconName = 'school';
                  bgColor = '#8B5CF6';
                } else if (activity.type === 'achievement') {
                  iconName = 'trophy';
                  bgColor = '#F59E0B';
                }
                
                return (
                  <View key={index} style={styles.activityItemCard}>
                    <View style={[styles.activityIndicator, { backgroundColor: bgColor }]} />
                    <View style={styles.activityIconContainer}>
                      <View style={[styles.activityIconBg, { backgroundColor: bgColor }]}>
                        <Ionicons name={iconName as any} size={18} color="#FFFFFF" />
                      </View>
                    </View>
                    <View style={styles.activityTextContainer}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityTimeText}>{dateText}</Text>
                    </View>
                  </View>
                );
              })}
                </View>
        </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    marginTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  heroSection: {
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#6366F1',
  },
  statsContainer: {
    marginTop: 32,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  todayStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  todayCard: {
    width: '31%',
    borderRadius: 16,
    elevation: 2,
  },
  todayCardContent: {
    alignItems: 'center',
    padding: 16,
  },
  todayIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  todayLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 'auto',
  },
  statLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  statNumberLight: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statUnitLight: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statSubLight: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 'auto',
  },
  sectionContainer: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1F2937',
  },
  aiMentorCard: {
    overflow: 'hidden',
    borderRadius: 16,
    elevation: 4,
  },
  aiGradient: {
    padding: 24,
  },
  aiContent: {
    alignItems: 'center',
    gap: 12,
  },
  aiTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  aiDescription: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  aiButton: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    borderRadius: 12,
  },
  aiButtonLabel: {
    color: '#3B82F6',
    fontSize: 16,
  },
  // Recent Activity Styles
  activityItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 8,
  },
  activityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  activityTimeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  recentActivityContainer: {
    gap: 12,
  },
});