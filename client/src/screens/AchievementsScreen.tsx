import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  ProgressBar,
  Avatar,
  useTheme,
  Surface,
  IconButton,
  Button,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import api from '../services/api';
import { updateUserData } from '../store/slices/authSlice';

interface Achievement {
  _id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  targetValue: number;
  progress: number;
  xpReward: number;
  earned: boolean;
  earnedAt?: Date;
}

interface UserStats {
  level: number;
  xp: number;
  nextLevelXp: number;
  streak: number;
  lessonsCompleted: number;
  quizzesTaken: number;
  avgQuizScore: number;
  completedQuizzes: number;
}

export default function AchievementsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const getUserId = () => {
    return user?.id || user?._id;
  };

  const forceRefresh = async () => {
    try {
      const response = await api.get(`/auth/me?t=${new Date().getTime()}`);
      if (response.data) {
        dispatch(updateUserData(response.data));
        console.log('User data refreshed from server:', JSON.stringify({
          id: response.data.id,
          _id: response.data._id
        }));
      }
    } catch (error) {
      console.error('Force refresh failed:', error);
    }
  };

  const forceUpdateAchievements = async () => {
    try {
      console.log('Force update achievements functionality removed');
      // This endpoint was removed from the server
      return null;
    } catch (error) {
      console.error('Error force updating achievements:', error);
    }
  };

  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      
      const userId = getUserId();
      
      if (!userId) {
        console.error('No user ID available for fetching progress');
        setError('User ID not available');
        setLoading(false);
        await forceRefresh();
        return;
      }
      
      console.log('Fetching progress with user ID:', userId);
      
      // Add a cache-busting timestamp for guaranteed fresh data
      const timestamp = new Date().getTime();
      const response = await api.get(`/progress/users/${userId}/progress?t=${timestamp}&force=true`);
      
      console.log('Progress API response:', response.data);
      
      // Check for blank/undefined data
      if (!response.data) {
        console.error('Received empty response data');
        setError('Received empty response data');
        setLoading(false);
        return;
      }
      
      // Ensure quiz data fields exist
      const completedQuizzes = response.data.completedQuizzes || 0;
      const avgQuizScore = response.data.avgQuizScore || 0;
      
      // Log the quiz scores array directly
      console.log('Raw quiz scores array:', response.data.quizScores);

      console.log('Quiz stats:', {
        completedQuizzes,
        avgQuizScore,
        quizScores: response.data.quizScores || []
      });
      
      // Log achievement progress for debugging
      console.log('Achievement data:', response.data.achievements.map((a: Achievement) => ({
        title: a.title,
        progress: a.progress,
        targetValue: a.targetValue,
        earned: a.earned
      })));
      
      setUserStats({
        level: response.data.level || 1,
        xp: response.data.xp || 0,
        nextLevelXp: response.data.nextLevelXp || 1000,
        streak: response.data.streak || 0,
        lessonsCompleted: response.data.completedLessons?.length || 0,
        quizzesTaken: completedQuizzes,
        avgQuizScore: avgQuizScore,
        completedQuizzes: completedQuizzes,
      });
      
      // Process achievements
      setAchievements(response.data.achievements || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user progress:', err);
      setError('Failed to load user progress');
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const userId = getUserId();
      if (userId) {
        console.log('Screen focused, refreshing with user ID:', userId);
        // Just fetch progress directly
        fetchUserProgress();
      } else {
        console.log('Screen focused but no user ID available, trying to refresh user data');
        forceRefresh().then(() => {
          const refreshedId = getUserId();
          if (refreshedId) {
            console.log('User ID now available after refresh:', refreshedId);
            fetchUserProgress();
          }
        });
      }
      
      return () => {
        // Any cleanup code can go here
      };
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await forceRefresh();
      const userId = getUserId();
      if (userId) {
        await fetchUserProgress();
      } else {
        setError('Unable to fetch user data after refresh');
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (loading && !userStats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If no stats are available yet, show default values
  const stats = userStats || {
    level: 1,
    xp: 0,
    nextLevelXp: 1000,
    streak: 0,
    lessonsCompleted: 0,
    quizzesTaken: 0,
    avgQuizScore: 0,
    completedQuizzes: 0,
  };

  // Count new/unearned achievements that have progress
  const newAchievementsCount = achievements.filter(a => !a.earned && a.progress > 0).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Hero Section with Linear Gradient */}
      <LinearGradient
        colors={['#6366F1', '#818CF8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.levelBadgeContainer}>
              <Surface style={styles.levelBadge}>
                <Text style={styles.levelText}>{stats.level}</Text>
              </Surface>
              <Text style={styles.levelLabel}>LEVEL</Text>
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Your Progress</Text>
              <View style={styles.streakContainer}>
                <View style={styles.streakBadge}>
                  <Ionicons name="flame" size={16} color="#FCD34D" />
                  <Text style={styles.streakText}>{stats.streak} Day Streak</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* XP Progress */}
        <View style={styles.progressInfo}>
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Experience Points</Text>
              <Text style={styles.xpText}>
                {stats.xp}/{stats.nextLevelXp} XP
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill,
                  { width: `${(stats.xp / stats.nextLevelXp) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressSubtext}>
              {stats.nextLevelXp - stats.xp} XP until next level
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Quick Stats</Text>
          
          <View style={styles.statsGrid}>
            {/* First Row */}
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#6366F1', '#818CF8']}
                style={styles.statContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="book" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{stats.lessonsCompleted}</Text>
                <Text style={styles.statLabel}>Lessons Learn</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#0EA5E9', '#38BDF8']}
                style={styles.statContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="trophy" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{stats.avgQuizScore}%</Text>
                <Text style={styles.statLabel}>Quiz Average</Text>
              </LinearGradient>
            </View>

            {/* Second Row */}
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#8B5CF6', '#A78BFA']}
                style={styles.statContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{stats.completedQuizzes}</Text>
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
                <Text style={styles.statValue}>{stats.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {newAchievementsCount > 0 && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>{newAchievementsCount} New</Text>
              </View>
            )}
          </View>

          {achievements.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="trophy-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>
                No achievements yet. Keep learning to earn achievements!
              </Text>
            </View>
          ) : (
            achievements.map((achievement) => (
              <Card key={achievement._id} style={[
                styles.achievementCard,
                achievement.earned && styles.earnedAchievementCard
              ]}>
                <Card.Content style={styles.achievementContent}>
                  <View style={styles.achievementLeft}>
                    <View
                      style={[
                        styles.achievementIcon,
                        { backgroundColor: achievement.color + '20' },
                        achievement.earned && styles.earnedAchievementIcon
                      ]}>
                      <Ionicons
                        name={achievement.icon as any}
                        size={24}
                        color={achievement.color}
                      />
                    </View>
                    <View style={styles.achievementInfo}>
                      <Text style={styles.achievementTitle}>{achievement.title}</Text>
                      <Text style={styles.achievementDesc}>{achievement.description}</Text>
                      
                      <View style={styles.xpRewardContainer}>
                        <Ionicons name="flash" size={14} color="#F59E0B" />
                        {achievement.earned ? (
                          <Text style={styles.xpRewardText}>
                            +{achievement.xpReward || 0} XP Earned!
                          </Text>
                        ) : (
                          <Text style={styles.xpRewardText}>
                            +{achievement.xpReward || 0} XP
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.achievementRight}>
                    {achievement.earned ? (
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark" size={18} color="#22C55E" />
                      </View>
                    ) : (
                      <Text style={styles.progressText}>
                        {Math.min(achievement.progress, achievement.targetValue)}/{achievement.targetValue}
                      </Text>
                    )}
                  </View>
                </Card.Content>
                <View style={styles.progressBarContainer}>
                  {achievement.earned ? (
                    <View style={[styles.progressBarFull, {backgroundColor: achievement.color}]} />
                  ) : (
                    <ProgressBar
                      progress={Math.min(achievement.progress / achievement.targetValue, 1)}
                      color={achievement.color}
                      style={styles.achievementProgress}
                    />
                  )}
                </View>
                {achievement.earned && (
                  <View style={styles.earnedBadgeContainer}>
                    <Text style={styles.earnedBadgeText}>COMPLETED</Text>
                  </View>
                )}
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  achievementProgress: {
    height: 4,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  heroSection: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadgeContainer: {
    alignItems: 'center',
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  levelText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  levelLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#E5E7EB',
    marginTop: 4,
  },
  headerContent: {
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  streakText: {
    color: '#FCD34D',
    fontSize: 14,
    fontWeight: '600',
  },
  progressInfo: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  progressContainer: {
    gap: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    height: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
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
  scrollView: {
    flex: 1,
    padding: 16,
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
  achievementsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  newBadge: {
    marginLeft: 12,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  newBadgeText: {
    color: '#D97706',
    fontSize: 14,
    fontWeight: '600',
  },
  achievementCard: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  earnedAchievementCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#22C55E',
    borderWidth: 1,
  },
  achievementContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnedAchievementIcon: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  achievementInfo: {
    marginLeft: 12,
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#6B7280',
  },
  achievementRight: {
    marginLeft: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  xpRewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  xpRewardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  progressBarFull: {
    height: '100%',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  earnedBadgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#22C55E',
    borderRadius: 8,
  },
  earnedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
}); 