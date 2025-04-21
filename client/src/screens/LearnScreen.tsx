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
import AppHeader from '../components/AppHeader';
import XPProgressBar from '../components/XPProgressBar';
import cacheService from '../services/cacheService';

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
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [beginnerCourses, setBeginnerCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [currentLesson, setCurrentLesson] = useState<{
    lessonId: string;
    title: string;
    courseTitle: string;
    progress: number;
    timeLeft: string;
  } | null>(null);
  
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

  // Function to fetch user's current lesson - with improved fallback mechanisms
  const fetchCurrentLesson = useCallback(async () => {
    if (!user || !user._id) return;
    
    try {
      console.log('Fetching current lesson for user:', user._id);
      
      // Try dashboard endpoint first
      const dashboardResponse = await api.get(`/dashboard?t=${new Date().getTime()}`);
      console.log('Dashboard response:', JSON.stringify(dashboardResponse.data));
      
      if (dashboardResponse.data && dashboardResponse.data.nextLesson) {
        const lesson = dashboardResponse.data.nextLesson;
        console.log('Found current lesson from dashboard:', JSON.stringify(lesson));
        
        // Calculate time left based on duration and progress
        const durationMatch = lesson.duration?.match(/(\d+)/);
        const durationMins = durationMatch ? parseInt(durationMatch[1]) : 30;
        const timeLeftMins = Math.round(durationMins * (1 - (lesson.progress || 0)));
        
        const currentLessonData = {
          lessonId: lesson._id || lesson.id || '',
          title: lesson.title || 'Continue Learning',
          courseTitle: lesson.topic || 'Current Course',
          progress: lesson.progress || 0,
          timeLeft: `${timeLeftMins} min left`
        };
        
        console.log('Setting current lesson state from dashboard:', JSON.stringify(currentLessonData));
        setCurrentLesson(currentLessonData);
        return;
      }
      
      // If dashboard didn't work, try user progress directly
      console.log('No lesson from dashboard, trying user progress');
      try {
        const progressResponse = await api.get(`/users/${user._id}/progress?t=${new Date().getTime()}`);
        console.log('Progress response:', JSON.stringify(progressResponse.data));
        
        // Check if there are completed lessons - if so, get the most recent one
        if (progressResponse.data && 
            progressResponse.data.completedLessons && 
            progressResponse.data.completedLessons.length > 0) {
          
          // Sort by completion date (most recent first)
          const sortedLessons = [...progressResponse.data.completedLessons]
            .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
          
          const latestLesson = sortedLessons[0];
          console.log('Latest completed lesson:', JSON.stringify(latestLesson));
          
          if (latestLesson && latestLesson.lessonId) {
            // Fetch the course that contains this lesson
            try {
              const lessonResponse = await api.get(`/lessons/${latestLesson.lessonId._id || latestLesson.lessonId}`);
              const lesson = lessonResponse.data;
              console.log('Lesson details:', JSON.stringify(lesson));
              
              if (lesson && lesson.courseId) {
                const courseResponse = await api.get(`/courses/${lesson.courseId}`);
                const course = courseResponse.data;
                console.log('Course details:', JSON.stringify(course));
                
                // Find the next lesson in the course
                if (course && course.lessons && course.lessons.length > 0) {
                  const currentLessonIndex = course.lessons.findIndex(
                    (l: any) => l._id === (latestLesson.lessonId._id || latestLesson.lessonId)
                  );
                  
                  // If there's a next lesson, use that
                  if (currentLessonIndex !== -1 && currentLessonIndex < course.lessons.length - 1) {
                    const nextLessonId = course.lessons[currentLessonIndex + 1];
                    const nextLessonResponse = await api.get(`/lessons/${nextLessonId}`);
                    const nextLesson = nextLessonResponse.data;
                    
                    setCurrentLesson({
                      lessonId: nextLesson._id,
                      title: nextLesson.title || 'Next Lesson',
                      courseTitle: course.title || 'Continue Course',
                      progress: 0,
                      timeLeft: `${nextLesson.duration || 30} min`
                    });
                    console.log('Set next lesson in course');
                    return;
                  } 
                  // If that was the last lesson, suggest another course
                  else if (currentLessonIndex === course.lessons.length - 1) {
                    // Course completed, find a new one
                    console.log('Course completed, finding new one');
                    createMockLesson();
                    return;
                  }
                }
              }
            } catch (err) {
              console.error('Error getting lesson/course details:', err);
            }
          }
        }
        
        // If we get here, fall back to a mock lesson
        console.log('Falling back to mock lesson');
        createMockLesson();
      } catch (err) {
        console.error('Error fetching user progress:', err);
        createMockLesson();
      }
    } catch (error) {
      console.error('Error in fetchCurrentLesson:', error);
      createMockLesson();
    }
  }, [user]);

  // Helper function to create a mock lesson
  const createMockLesson = useCallback(() => {
    console.log('Creating mock lesson');
    setCurrentLesson({
      lessonId: '',
      title: 'Start Learning',
      courseTitle: 'JavaScript Fundamentals',
      progress: 0,
      timeLeft: 'New course'
    });
  }, []);

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
      
      // Also fetch current lesson
      await fetchCurrentLesson();
    } catch (error) {
      console.error('Error refreshing user progress:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user, fetchCurrentLesson]);

  // Add a function to force UI update
  const forceRefresh = async () => {
    try {
      // Check if cached data is available and not stale
      const cachedUserData = await cacheService.getCachedUserData();
      
      // Only fetch from server if cache is stale or refreshing
      if (!cachedUserData || refreshing) {
        // Force refresh from database
        const response = await api.get(`/auth/me?t=${new Date().getTime()}`);
        if (response.data) {
          // Cache the fresh data
          await cacheService.cacheUserData(response.data);
          
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
          
          console.log('User data refreshed from server');
        }
      } else {
        // Use cached data
        dispatch({ 
          type: 'auth/updateUserData/fulfilled', 
          payload: cachedUserData 
        });
        
        // Update local state with cached data
        setUserXpData({
          level: cachedUserData.level || 1,
          xp: cachedUserData.xp || 0,
          nextLevelXp: cachedUserData.level * 1000 || 1000,
          streak: cachedUserData.streak || 0,
        });
        
        console.log('User data loaded from cache');
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
        // Also refresh progress data and current lesson
        refreshUserData();
      }
    }, [user?._id, refreshUserData])
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
        setRecommendedCourses(recommendedData);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userXpData.level]);

  // Only keep the necessary functions and remove any references to search
  function getCourseIcon(title: string | undefined): string {
    if (!title) return "code";
    title = title.toLowerCase();
    
    if (title.includes("javascript") || title.includes("js")) return "logo-javascript";
    if (title.includes("python")) return "logo-python";
    if (title.includes("react")) return "logo-react";
    if (title.includes("node")) return "logo-nodejs";
    if (title.includes("html")) return "logo-html5";
    if (title.includes("css")) return "logo-css3";
    
    return "code-slash";
  }

  function getCourseColor(difficulty: string | undefined): string {
    if (!difficulty) return "#6366F1";
    
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "#22C55E";
      case "intermediate":
        return "#3B82F6";
      case "advanced":
        return "#8B5CF6";
      default:
        return "#6366F1";
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
    <View style={styles.container}>
      <AppHeader />
      
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
          <View style={styles.heroSection}>
            <XPProgressBar 
              xp={userXpData.xp} 
              nextLevelXp={userXpData.nextLevelXp}
            />
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
              {recommendedCourses.map((course) => (
                <Card
                  key={course._id}
                  style={styles.recommendedCard}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
                >
                  <View style={styles.recommendedCardContent}>
                    <View 
                      style={[
                        styles.recommendedIconContainer,
                        { backgroundColor: `${getCourseColor(course.difficulty)}15` }
                      ]}
                    >
                      <Ionicons 
                        name={getCourseIcon(course.title) as any} 
                        size={24} 
                        color={getCourseColor(course.difficulty)} 
                      />
                    </View>
                    <Text style={styles.recommendedTitle}>{course.title}</Text>
                    <Text style={styles.recommendedDescription} numberOfLines={2}>
                      {course.description}
                    </Text>
                    <View style={styles.recommendedMeta}>
                      <Chip 
                        style={[
                          styles.recommendedChip,
                          { backgroundColor: `${getCourseColor(course.difficulty)}15` }
                        ]}
                        textStyle={{ 
                          color: getCourseColor(course.difficulty),
                          fontWeight: '500',
                          fontSize: 12
                        }}
                      >
                        {course.difficulty}
                      </Chip>
                      <Text style={styles.recommendedLessons}>
                        {course.lessons?.length || 0} lessons
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </ScrollView>
          </View>

          {/* Recent Courses - If we have beginner courses */}
          {beginnerCourses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Beginner Courses</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendedContainer}>
                {beginnerCourses.slice(0, 5).map((course) => (
                  <Card
                    key={course._id}
                    style={styles.recommendedCard}
                    onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
                  >
                    <View style={styles.recommendedCardContent}>
                      <View 
                        style={[
                          styles.recommendedIconContainer,
                          { backgroundColor: `${getCourseColor(course.difficulty)}15` }
                        ]}
                      >
                        <Ionicons 
                          name={getCourseIcon(course.title) as any} 
                          size={24} 
                          color={getCourseColor(course.difficulty)} 
                        />
                      </View>
                      <Text style={styles.recommendedTitle}>{course.title}</Text>
                      <Text style={styles.recommendedDescription} numberOfLines={2}>
                        {course.description}
                      </Text>
                      <View style={styles.recommendedMeta}>
                        <Chip 
                          style={[
                            styles.recommendedChip,
                            { backgroundColor: `${getCourseColor(course.difficulty)}15` }
                          ]}
                          textStyle={{ 
                            color: getCourseColor(course.difficulty),
                            fontWeight: '500',
                            fontSize: 12
                          }}
                        >
                          {course.difficulty}
                        </Chip>
                        <Text style={styles.recommendedLessons}>
                          {course.lessons?.length || 0} lessons
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </ScrollView>
            </View>
          )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
    marginTop: 0,
  },
  heroSection: {
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#6366F1',
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
  recommendedLessons: {
    fontSize: 12,
    color: '#6B7280',
  },
  recommendedIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 