import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Text,
  Card,
  ProgressBar,
  Avatar,
  useTheme,
  Surface,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

export default function AchievementsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();

  const userStats = {
    level: 12,
    xp: 2450,
    nextLevelXp: 3000,
    streak: 7,
    lessonsCompleted: 23,
    quizzesTaken: 15,
    avgQuizScore: 85,
    totalCodingHours: 45,
  };

  const achievements = [
    {
      id: 1,
      title: 'Syntax Master',
      description: 'Complete 10 beginner lessons',
      progress: 0.8,
      icon: 'code-slash',
      color: '#22C55E',
      current: 8,
      target: 10,
    },
    {
      id: 2,
      title: 'Debugging Champ',
      description: 'Solve 5 coding challenges',
      progress: 0.6,
      icon: 'bug',
      color: '#3B82F6',
      current: 3,
      target: 5,
    },
    {
      id: 3,
      title: 'Consistent Coder',
      description: '7-day coding streak',
      progress: 1,
      icon: 'flame',
      color: '#F59E0B',
      current: 7,
      target: 7,
      completed: true,
    },
  ];

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
                <Text style={styles.levelText}>{userStats.level}</Text>
              </Surface>
              <Text style={styles.levelLabel}>LEVEL</Text>
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Your Progress</Text>
              <View style={styles.streakContainer}>
                <View style={styles.streakBadge}>
                  <Ionicons name="flame" size={16} color="#FCD34D" />
                  <Text style={styles.streakText}>{userStats.streak} Day Streak</Text>
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
                {userStats.xp}/{userStats.nextLevelXp} XP
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill,
                  { width: `${(userStats.xp / userStats.nextLevelXp) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressSubtext}>
              {userStats.nextLevelXp - userStats.xp} XP until next level
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
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
                <Text style={styles.statValue}>{userStats.lessonsCompleted}</Text>
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
                <Text style={styles.statValue}>{userStats.avgQuizScore}%</Text>
                <Text style={styles.statLabel}>Quiz Average</Text>
              </LinearGradient>
            </View>

            {/* Second Row */}
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#8B5CF6', '#A78BFA']}
                style={styles.statContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name="time" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{userStats.totalCodingHours}h</Text>
                <Text style={styles.statLabel}>Hours Coded</Text>
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

        {/* Achievements Section */}
        <View style={styles.achievementsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>3 New</Text>
            </View>
          </View>
          
          {achievements.map((achievement) => (
            <Surface key={achievement.id} style={styles.achievementCard}>
              <View style={styles.achievementContent}>
                <View style={styles.achievementLeft}>
                  <View style={[styles.achievementIcon, { backgroundColor: `${achievement.color}15` }]}>
                    <Ionicons name={achievement.icon} size={24} color={achievement.color} />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDesc}>{achievement.description}</Text>
                  </View>
                </View>
                
                <View style={styles.achievementRight}>
                  {achievement.completed ? (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                    </View>
                  ) : (
                    <Text style={styles.progressText}>
                      {achievement.current}/{achievement.target}
                    </Text>
                  )}
                </View>
              </View>
              
              {!achievement.completed && (
                <ProgressBar
                  progress={achievement.progress}
                  color={achievement.color}
                  style={styles.progressBar}
                />
              )}
            </Surface>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  heroSection: {
    paddingBottom: 24,
  },
  header: {
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  headerContent: {
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  streakContainer: {
    marginTop: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
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
  },
}); 