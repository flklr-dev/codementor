import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import {
  Text,
  useTheme,
  Searchbar,
  Card,
  Button,
  Chip,
  ProgressBar,
  IconButton,
  Avatar,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getAllCourses, getCoursesByDifficulty } from '../services/courseService';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import api from '../services/api';
import { getUserProgress } from '../services/progressService';
import LevelUpModal from '../components/LevelUpModal';
import { updateUserData } from '../store/slices/authSlice';

interface Course {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  lessons: any[];
  tags: string[];
}

// Add type definition at the top of the file
type RootStackParamList = {
  Home: undefined;
  CourseDetail: { courseId: string };
  LessonDetail: { lessonId: string };
  CoursesCategory: { difficulty?: string; tag?: string; title: string };
  // Add other screens as needed
};

export default function LearnScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [beginnerCourses, setBeginnerCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  // Get first letter of name for avatar
  const avatarText = user?.name ? user.name.charAt(0).toUpperCase() : 'C';

  // Use the user's name if available
  const userName = user?.name || 'Coder';

  // Replace the userXpData state with this
  const [userXpData, setUserXpData] = useState({
    level: user?.level || 1,
    xp: user?.xp || 0,
    nextLevelXp: 1000,
    streak: user?.streak || 0,
  });

  const lastLesson = {
    title: "JavaScript Functions",
    progress: 0.35,
    timeLeft: "15 min left",
    module: "JavaScript Basics",
  };

  const categories = [
    { id: 1, name: "Frontend", icon: "logo-html5", color: "#E34F26" },
    { id: 2, name: "Backend", icon: "server", color: "#68A063" },
    { id: 3, name: "Mobile", icon: "phone-portrait", color: "#61DAFB" },
    { id: 4, name: "Database", icon: "cube", color: "#4479A1" },
  ];

  const difficultyCategories = [
    {
      id: 1,
      name: "Beginner",
      icon: "leaf",
      color: "#22C55E",
      courses: ["HTML", "CSS", "JavaScript"],
      description: "Perfect starting point for new coders"
    },
    {
      id: 2,
      name: "Intermediate",
      icon: "rocket",
      color: "#3B82F6",
      courses: ["React", "TypeScript", "APIs"],
      description: "Level up your development skills"
    },
    {
      id: 3,
      name: "Advanced",
      icon: "diamond",
      color: "#8B5CF6",
      courses: ["GraphQL", "AI/ML", "System Design"],
      description: "Master complex programming concepts"
    },
  ];

  const [levelUpModalVisible, setLevelUpModalVisible] = useState(false);
  const [previousLevel, setPreviousLevel] = useState(userXpData.level);
  const [xpGained, setXpGained] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const refreshUserData = useCallback(async () => {
    if (!user || !user._id) return;
    
    setRefreshing(true);
    try {
      console.log('Refreshing user progress for:', user._id);
      const progressData = await getUserProgress(user._id);
      console.log('Fresh progress data received:', progressData);
      
      if (progressData) {
        console.log('Setting XP data:', progressData);
        setUserXpData(prevData => ({
          level: progressData.level || prevData.level,
          xp: progressData.xp || prevData.xp,
          nextLevelXp: progressData.nextLevelXp || prevData.nextLevelXp,
          streak: progressData.streak || prevData.streak,
        }));
      }
    } catch (error) {
      console.error('Error refreshing user progress:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  // Add a function to force UI update
  const forceRefresh = async () => {
    try {
      // Force refresh from database
      const response = await api.get(`/auth/me?t=${new Date().getTime()}`);
      if (response.data) {
        // Update Redux store
        dispatch({ 
          type: 'auth/updateUserData/fulfilled', 
          payload: response.data 
        });
        
        // Also update local state for immediate UI effect
        setUserXpData({
          level: response.data.level || 1,
          xp: response.data.xp || 0,
          nextLevelXp: response.data.level * 1000 || 1000,
          streak: response.data.streak || 0,
        });
        
        console.log('Forced refresh with data:', response.data);
      }
    } catch (error) {
      console.error('Force refresh failed:', error);
    }
  };

  // Call this function in useFocusEffect
  useFocusEffect(
    useCallback(() => {
      if (user?._id) {
        // Use the new force refresh function
        forceRefresh();
        // Also refresh progress data
        refreshUserData();
      }
    }, [user?._id])
  );

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await getAllCourses();
        setCourses(data);
        
        // Get beginner courses
        const beginnerData = await getCoursesByDifficulty('Beginner');
        setBeginnerCourses(beginnerData);
        
        // Get recommended courses based on user level
        let recommendedData;
        if (userXpData.level <= 2) {
          recommendedData = await getCoursesByDifficulty('Beginner');
        } else if (userXpData.level <= 5) {
          recommendedData = await getCoursesByDifficulty('Intermediate');
        } else {
          recommendedData = await getCoursesByDifficulty('Advanced');
        }
        setRecommendedCourses(recommendedData.slice(0, 3));
        
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userXpData.level]);

  // Filter courses based on search query
  const filteredCourses: Course[] = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get recommended courses based on user's level
  const recommendedCoursesFiltered: Course[] = filteredCourses.filter(course => {
    if (userXpData.level <= 2) return course.difficulty === 'Beginner';
    if (userXpData.level <= 5) return course.difficulty === 'Intermediate';
    return course.difficulty === 'Advanced';
  }).slice(0, 3);

  const onSearch = (query: string) => {
    setSearchQuery(query);
  };

  const renderCourseCard = (course: Course) => (
    <Card
      key={course._id}
      style={styles.courseCard}
      onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
    >
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.courseCardHeader}
      >
        <IconButton 
          icon="code-tags" 
          iconColor="#FFFFFF" 
          size={28}
          style={styles.courseIcon}
        />
      </LinearGradient>
      <Card.Content style={styles.courseCardContent}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseDescription} numberOfLines={2}>
          {course.description}
        </Text>
        <View style={styles.courseMeta}>
          <Chip style={styles.courseChip}>{course.difficulty}</Chip>
          <Text style={styles.courseDuration}>
            {course.lessons?.length || 0} lessons
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  function getCourseIcon(title: string | undefined): string {
    if (!title) return "book-outline";
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes('javascript')) return "language-javascript";
    if (titleLower.includes('react')) return "react";
    if (titleLower.includes('node')) return "nodejs";
    if (titleLower.includes('python')) return "language-python";
    return "code-braces";
  }

  function getCourseColor(difficulty: string | undefined): string {
    switch(difficulty?.toLowerCase()) {
      case 'beginner': return '#22C55E';
      case 'intermediate': return '#3B82F6';
      case 'advanced': return '#8B5CF6';
      default: return '#6366F1';
    }
  }

  useEffect(() => {
    // Check if user leveled up
    if (userXpData.level > previousLevel && previousLevel !== 0) {
      setLevelUpModalVisible(true);
      setXpGained(userXpData.xp); // This is just an approximation
    }
    setPreviousLevel(userXpData.level);
  }, [userXpData.level]);

  // Update the useEffect to watch for user changes
  useEffect(() => {
    if (user) {
      // Update the local state whenever the Redux user object changes
      setUserXpData({
        level: user.level || 1,
        xp: user.xp || 0, 
        nextLevelXp: user.level * 1000 || 1000,
        streak: user.streak || 0,
      });
      console.log('Updated userXpData from user:', user);
    }
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshUserData}
              colors={[theme.colors.primary]}
            />
          }
        >
          {/* Hero Section */}
          <LinearGradient
            colors={['#6366F1', '#818CF8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroSection}>
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
                    labelStyle={[{ 
                      color: '#6366F1',
                      fontSize: 20,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      includeFontPadding: false,
                      textAlignVertical: 'center',
                      lineHeight: 40,
                    }]}
                  />
                )}
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{userName}</Text>
                  <View style={styles.statsRow}>
                    <Text style={styles.levelText}>Level {userXpData.level}</Text>
                    <View style={styles.streakContainer}>
                      <View style={styles.streakCircle}>
                        <Text style={styles.streakText}>{userXpData.streak}</Text>
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

            {/* Progress Section - Styled like AchievementsScreen */}
            <View style={styles.progressInfo}>
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Experience Points</Text>
                  <Text style={styles.xpText}>
                    {userXpData.xp}/{userXpData.nextLevelXp} XP
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { width: `${(userXpData.xp / userXpData.nextLevelXp) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressSubtext}>
                  {userXpData.nextLevelXp - userXpData.xp} XP until next level
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Search Section */}
          <View style={styles.section}>
            <Searchbar
              placeholder="Search topics or exercises..."
              value={searchQuery}
              onChangeText={onSearch}
              style={styles.searchBar}
            />
          </View>

          {/* Continue Learning Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <Card style={styles.continueCard}>
              <Card.Content>
                <Text style={styles.moduleText}>{lastLesson.module}</Text>
                <Text style={styles.lessonTitle}>{lastLesson.title}</Text>
                <View style={styles.lessonMeta}>
                  <Text style={styles.timeLeft}>{lastLesson.timeLeft}</Text>
                  <ProgressBar
                    progress={lastLesson.progress}
                    color={theme.colors.primary}
                    style={styles.lessonProgress}
                  />
                </View>
                <Button
                  mode="contained"
                  style={styles.continueButton}
                  labelStyle={styles.buttonLabel}>
                  Continue
                </Button>
              </Card.Content>
            </Card>
          </View>

          {/* Categories Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((item) => (
                <Card
                  key={item.id}
                  style={styles.categoryCard}
                  onPress={() => navigation.navigate('CoursesCategory', {
                    tag: item.name,
                    title: `${item.name} Courses`
                  })}
                >
                  <Card.Content style={styles.categoryContent}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: `${item.color}20` },
                      ]}
                    >
                      <Ionicons name={item.icon as any} size={24} color={item.color} />
                    </View>
                    <Text style={styles.categoryName}>{item.name}</Text>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </View>

          {/* Difficulty Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse by Difficulty</Text>
            <View style={styles.difficultyGrid}>
              {difficultyCategories.map((item) => (
                <Card 
                  key={item.id} 
                  style={styles.difficultyCard}
                  onPress={() => navigation.navigate('CoursesCategory', { 
                    difficulty: item.name,
                    title: `${item.name} Courses` 
                  })}
                >
                  <LinearGradient
                    colors={[`${item.color}20`, `${item.color}10`]}
                    style={styles.difficultyGradient}
                  >
                    <View style={styles.difficultyHeader}>
                      <View style={[styles.iconBadge, { backgroundColor: `${item.color}30` }]}>
                        <Ionicons name={item.icon as any} size={24} color={item.color} />
                      </View>
                      <Chip 
                        style={[styles.levelChip, { backgroundColor: `${item.color}20` }]}
                        textStyle={{ color: item.color, fontWeight: '500' }}
                      >
                        {item.name}
                      </Chip>
                    </View>
                    <Text style={styles.difficultyDescription}>{item.description}</Text>
                    
                    <View style={styles.courseTagsContainer}>
                      {item.courses.map((course, idx) => (
                        <View 
                          key={idx} 
                          style={[styles.courseTag, { backgroundColor: `${item.color}15` }]}
                        >
                          <Text style={[styles.courseTagText, { color: item.color }]}>
                            {course}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </LinearGradient>
                </Card>
              ))}
            </View>
          </View>

          {/* Recommended Courses - Redesigned */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendedContainer}>
              {recommendedCoursesFiltered.map((course) => (
                <Card
                  key={course._id}
                  style={styles.recommendedCard}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
                >
                  <LinearGradient
                    colors={[getCourseColor(course.difficulty), getCourseColor(course.difficulty) + '80']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.recommendedCardHeader}
                  >
                    <IconButton
                      icon={getCourseIcon(course.title)}
                      iconColor="#FFFFFF"
                      size={30}
                      style={styles.recommendedIcon}
                    />
                  </LinearGradient>
                  <Card.Content style={styles.recommendedCardContent}>
                    <Text style={styles.recommendedTitle} numberOfLines={1}>{course.title}</Text>
                    <Text style={styles.recommendedDescription} numberOfLines={2}>
                      {course.description}
                    </Text>
                    <View style={styles.recommendedMeta}>
                      <Chip 
                        style={[styles.recommendedChip, {backgroundColor: getCourseColor(course.difficulty) + '20'}]}
                        textStyle={{color: getCourseColor(course.difficulty), fontSize: 12, fontWeight: '600', lineHeight: 16}}
                      >
                        {course.difficulty}
                      </Chip>
                      <Text style={styles.recommendedDuration}>
                        {course.lessons?.length || 0} lessons
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>
          </View>

          {/* Popular Beginner Courses */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular for Beginners</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {/* Delete or comment out this line (which is likely around line 97-100)
              const beginnerCourses = filteredCourses.filter(course => course.difficulty === 'Beginner');
              */}
            </ScrollView>
          </View>

          {/* Bottom padding for scroll */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        action={{
          label: 'Retry',
          onPress: async () => {
            setError('');
            try {
              setLoading(true);
              const data = await getAllCourses();
              setCourses(data);
              setLoading(false);
            } catch (err) {
              console.error('Error fetching courses:', err);
              setError('Failed to load courses. Please try again.');
              setLoading(false);
            }
          },
        }}>
        {error}
      </Snackbar>

      <LevelUpModal
        visible={levelUpModalVisible}
        onClose={() => setLevelUpModalVisible(false)}
        newLevel={userXpData.level}
        xpGained={xpGained}
      />
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
    paddingBottom: 24,
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
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: '#A78BFA',
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
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  continueCard: {
    borderRadius: 16,
  },
  moduleText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  lessonMeta: {
    marginBottom: 16,
  },
  timeLeft: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  lessonProgress: {
    height: 6,
    borderRadius: 3,
  },
  continueButton: {
    borderRadius: 12,
  },
  buttonLabel: {
    fontSize: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  categoryCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
  },
  categoryContent: {
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  courseCard: {
    width: 260,
    marginLeft: 16,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 1,
  },
  courseCardHeader: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  courseIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  courseCardContent: {
    paddingVertical: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    height: 40,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courseChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: 24,
  },
  courseDuration: {
    fontSize: 14,
    color: '#6B7280',
  },
  difficultyGrid: {
    gap: 12,
  },
  difficultyCard: {
    borderRadius: 16,
    elevation: 2,
    marginBottom: 4,
  },
  difficultyGradient: {
    padding: 20,
    borderRadius: 16,
  },
  difficultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelChip: {
    borderRadius: 20,
  },
  difficultyDescription: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
    fontWeight: '500',
  },
  courseTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  courseTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  courseTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchSection: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  bottomPadding: {
    height: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  recommendedContainer: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  recommendedCard: {
    width: 240,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    marginLeft: 2,
    marginBottom: 4,
  },
  recommendedCardHeader: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  recommendedIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  recommendedCardContent: {
    padding: 16,
    paddingTop: 12,
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
    height: 22,
  },
  recommendedDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    height: 40,
    lineHeight: 20,
  },
  recommendedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommendedChip: {
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  recommendedDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
}); 