import React from 'react';
import { StyleSheet, View, ScrollView, ImageBackground } from 'react-native';
import {
  Text,
  useTheme,
  Button,
  Avatar,
  Card,
  IconButton,
  Searchbar,
  ProgressBar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../store/hooks';

export default function HomeScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Get the user from auth state
  const { user } = useAppSelector(state => state.auth);
  
  // Get first letter of name for avatar
  const avatarText = user?.name ? user.name.charAt(0).toUpperCase() : 'C';
  
  // Use the user's name if available
  const userName = user?.name || 'Coder';

  const userProgress = {
    streak: user?.streak || 0,
    todayMinutes: user?.todayMinutes || 0,
    completedChallenges: user?.completedChallenges || 0,
    level: user?.level || 1
  };

  const nextLesson = {
    title: "Advanced JavaScript",
    topic: "Async/Await",
    duration: "25 mins",
    progress: 0.35
  };

  const recommendedChallenges = [
    {
      id: 1,
      title: "Build a REST API",
      difficulty: "Intermediate",
      xp: 150,
      tags: ["Node.js", "Express"]
    },
    {
      id: 2,
      title: "React State Management",
      difficulty: "Advanced",
      xp: 200,
      tags: ["React", "Redux"]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {user?.avatar ? (
                <Avatar.Image
                  size={40}
                  source={{ uri: user.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Text
                  size={40}
                  label={avatarText}
                  style={[styles.avatar, { backgroundColor: '#FFFFFF' }]}
                  labelStyle={[styles.avatarLabel, { 
                    color: '#6366F1',
                    textAlign: 'center',
                    textAlignVertical: 'center',
                  }]}
                />
              )}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userName}</Text>
                <View style={styles.statsRow}>
                  <Text style={styles.levelText}>Level {userProgress.level}</Text>
                  <View style={styles.streakContainer}>
                    <View style={styles.streakCircle}>
                      <Text style={styles.streakText}>{userProgress.streak}</Text>
                      <Ionicons name="flame" size={16} color="#FCD34D" />
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <IconButton
              icon="bell-outline"
              iconColor="#FFFFFF"
              size={24}
              style={styles.notificationButton}
            />
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search lessons or ask AI..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            iconColor={theme.colors.primary}
          />
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <View style={styles.statHeader}>
                  <View style={[styles.statIconContainer, { backgroundColor: '#EEF2FF' }]}>
                    <Ionicons name="time-outline" size={24} color="#6366F1" />
                  </View>
                  <Text style={styles.statLabel}>Time Spent</Text>
                </View>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statNumber}>{userProgress.todayMinutes}</Text>
                  <Text style={styles.statUnit}>minutes</Text>
                </View>
                <Text style={styles.statTrend}>+15min from yesterday</Text>
              </View>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <View style={styles.statHeader}>
                  <View style={[styles.statIconContainer, { backgroundColor: '#F0FDF4' }]}>
                    <Ionicons name="trophy-outline" size={24} color="#22C55E" />
                  </View>
                  <Text style={styles.statLabel}>Challenges</Text>
                </View>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statNumber}>{userProgress.completedChallenges}</Text>
                  <Text style={styles.statUnit}>completed</Text>
                </View>
                <Text style={styles.statTrend}>2 more to next level</Text>
              </View>
            </Card>
          </View>
        </View>

        {/* Continue Learning */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <Card style={styles.continueCard}>
            <Card.Content>
              <View style={styles.lessonHeader}>
                <View>
                  <Text style={styles.lessonTitle}>{nextLesson.title}</Text>
                  <Text style={styles.lessonTopic}>{nextLesson.topic}</Text>
                </View>
                <Text style={styles.lessonDuration}>{nextLesson.duration}</Text>
              </View>
              <ProgressBar
                progress={nextLesson.progress}
                color={theme.colors.primary}
                style={styles.lessonProgress}
              />
              <Button
                mode="contained"
                style={styles.continueButton}
                labelStyle={styles.buttonLabel}>
                Continue
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* AI Mentor Section */}
        <View style={styles.sectionContainer}>
          <Card style={styles.aiMentorCard}>
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
                  labelStyle={styles.aiButtonLabel}>
                  Ask Question
                </Button>
              </View>
            </LinearGradient>
          </Card>
        </View>

        {/* Recommended Challenges */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recommended Challenges</Text>
          {recommendedChallenges.map((challenge) => (
            <Card key={challenge.id} style={styles.challengeCard}>
              <Card.Content>
                <View style={styles.challengeHeader}>
                  <View>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <View style={styles.tagContainer}>
                      {challenge.tags.map((tag) => (
                        <Text key={tag} style={styles.tag}>{tag}</Text>
                      ))}
                    </View>
                  </View>
                  <Text style={styles.xpText}>+{challenge.xp} XP</Text>
                </View>
              </Card.Content>
            </Card>
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
  scrollView: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#6366F1',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    gap: 4,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  levelText: {
    color: '#E5E7EB',
    fontSize: 13,
  },
  avatar: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  searchSection: {
    padding: 16,
    marginTop: 12,
  },
  searchBar: {
    borderRadius: 12,
    elevation: 4,
  },
  statsContainer: {
    padding: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  statContent: {
    padding: 16,
    gap: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIconContainer: {
    padding: 8,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statUnit: {
    fontSize: 14,
    color: '#6B7280',
  },
  statTrend: {
    fontSize: 12,
    color: '#6B7280',
    opacity: 0.8,
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937',
  },
  continueCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  lessonTopic: {
    color: '#6B7280',
    marginTop: 4,
  },
  lessonDuration: {
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lessonProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: 16,
  },
  continueButton: {
    borderRadius: 12,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
  },
  aiMentorCard: {
    overflow: 'hidden',
    borderRadius: 16,
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
  challengeCard: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#EEF2FF',
    color: '#6366F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
  },
  xpText: {
    color: '#059669',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  avatarLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366F1',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 40,
  },
});