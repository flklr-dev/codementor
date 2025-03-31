import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import {
  Text,
  Card,
  Chip,
  IconButton,
  Button,
  ProgressBar,
  useTheme,
  Avatar,
  Snackbar,
  Portal,
  Dialog,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getCourseWithLessons } from '../services/courseService';
import { LinearGradient } from 'expo-linear-gradient';

type RootStackParamList = {
  Home: undefined;
  CourseDetail: { courseId: string };
  LessonDetail: { lessonId: string };
  CoursesCategory: { difficulty?: string; tag?: string; title: string };
  LessonList: { type: string; title: string; color: string; courseId: string };
};

interface Course {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  lessons: any[];
  tags: string[];
}

export default function CourseDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { courseId, lessonCompleted } = route.params as { 
    courseId: string;
    lessonCompleted?: boolean;
  };
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [completedLessonsCount, setCompletedLessonsCount] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [progress, setProgress] = useState(0);
  const [xpEarnedDialogVisible, setXpEarnedDialogVisible] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getCourseWithLessons(courseId);
        console.log('Fetched course data:', data);
        setCourse(data);
        
        // Calculate real progress based on completed lessons
        if (data && data.lessons) {
          const total = data.lessons.length;
          const completed = data.lessons.filter(lesson => 
            lesson.completed === true
          ).length;
          
          console.log(`Found ${completed} completed lessons out of ${total}`);
          
          setCompletedLessonsCount(completed);
          setTotalLessons(total);
          setProgress(total > 0 ? completed / total : 0);
        }
        
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
    
    // Set up a listener to refresh data when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('CourseDetailScreen in focus - refreshing data');
      fetchCourse();
    });
    
    return unsubscribe;
  }, [courseId, navigation]);

  useEffect(() => {
    if (lessonCompleted && route.params.xpEarned) {
      setXpEarned(route.params.xpEarned);
      setXpEarnedDialogVisible(true);
      fetchCourse(); // Refresh data
    }
  }, [lessonCompleted, route.params]);

  // Get course-specific gradient colors - always use purple theme
  const getCourseGradient = () => {
    return ['#6366F1', '#818CF8'];
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <LinearGradient
          colors={['#6366F1', '#818CF8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
              iconColor="#FFFFFF"
            />
            <Text style={styles.headerTitle}>Course Details</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading course details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <LinearGradient
          colors={['#6366F1', '#818CF8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
              iconColor="#FFFFFF"
            />
            <Text style={styles.headerTitle}>Course Details</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <LinearGradient
        colors={['#6366F1', '#818CF8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            iconColor="#FFFFFF"
          />
          <Text style={styles.headerTitle}>Course Details</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        {/* Course Hero Section */}
        <Card style={styles.courseHeroCard}>
          <Card.Content style={styles.courseHeroContent}>
            <View style={styles.courseIconContainer}>
              <Ionicons 
                name={getIconForCourse(course?.title || '')} 
                size={32} 
                color={getCourseIconColor(course?.title || '')} 
              />
            </View>
            
            <Text style={styles.courseTitle}>{course?.title}</Text>
            
            <View style={styles.courseMetaRow}>
              <Chip 
                style={[
                  styles.difficultyChip, 
                  {backgroundColor: getDifficultyColor(course?.difficulty || '')}
                ]}
                textStyle={{color: getDifficultyTextColor(course?.difficulty || '')}}
              >
                {course?.difficulty}
              </Chip>
              
              <View style={styles.lessonCountContainer}>
                <Ionicons name="book-outline" size={18} color="#6366F1" />
                <Text style={styles.lessonCountText}>
                  {totalLessons} {totalLessons === 1 ? 'Lesson' : 'Lessons'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.courseDescription}>
              {course?.description}
            </Text>
            
            {course?.tags && course.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {course.tags.map((tag, index) => (
                  <Chip 
                    key={index} 
                    style={styles.tagChip}
                    textStyle={styles.tagChipText}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            )}
            
            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Your Progress</Text>
                <Text style={styles.progressPercentage}>{Math.round(progress * 100)}%</Text>
              </View>
              <ProgressBar 
                progress={progress} 
                color="#6366F1" 
                style={styles.progressBar} 
              />
            </View>
            
            <Button 
              mode="contained" 
              onPress={() => {
                if (progress === 0) {
                  // Start Learning - go to first lesson
                  const firstLesson = course?.lessons[0];
                  if (firstLesson) {
                    navigation.navigate('LessonDetail', { lessonId: firstLesson._id });
                  }
                } else {
                  // Continue Learning - go to first incomplete lesson
                  const firstIncompleteLesson = course?.lessons.find(lesson => !lesson.completed);
                  if (firstIncompleteLesson) {
                    navigation.navigate('LessonDetail', { lessonId: firstIncompleteLesson._id });
                  }
                }
              }}
              style={styles.startButton}
              contentStyle={{height: 48}}
              labelStyle={{fontSize: 16, fontWeight: 'bold'}}
            >
              {progress > 0 ? 'Continue Learning' : 'Start Learning'}
            </Button>
          </Card.Content>
        </Card>
        
        {/* Lessons Section */}
        <View style={styles.lessonsSection}>
          <Text style={styles.sectionTitle}>Course Content</Text>
          
          {course?.lessons.map((lesson, index) => (
            <Card 
              key={lesson._id} 
              style={[
                styles.lessonCard,
                lesson.completed && styles.completedLessonCard,
                lesson.progress && lesson.progress > 0 && lesson.progress < 1 && styles.inProgressLessonCard
              ]}
              onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson._id })}
            >
              <Card.Content style={styles.lessonCardContent}>
                <View style={styles.lessonHeader}>
                  <View style={[
                    styles.lessonNumberContainer,
                    lesson.completed && styles.completedLessonNumberContainer,
                    lesson.progress && lesson.progress > 0 && !lesson.completed && styles.inProgressLessonNumberContainer
                  ]}>
                    <Text style={[
                      styles.lessonNumber,
                      lesson.completed && styles.completedLessonNumber,
                      lesson.progress && lesson.progress > 0 && !lesson.completed && styles.inProgressLessonNumber
                    ]}>{index + 1}</Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <View style={styles.lessonMeta}>
                      <View style={styles.lessonMetaLeft}>
                        <View style={styles.durationContainer}>
                          <Ionicons name="time-outline" size={16} color="#6B7280" />
                          <Text style={styles.durationText}>
                            {lesson.duration} min
                          </Text>
                        </View>
                        
                        <View style={styles.xpContainer}>
                          <Ionicons name="star-outline" size={16} color="#F59E0B" />
                          <Text style={styles.xpText}>{Math.floor((lesson.duration || 5) * 2)} XP</Text>
                        </View>
                      </View>
                      
                      {lesson.completed ? (
                        <Chip 
                          style={styles.completedChip}
                          icon={() => <Ionicons name="checkmark-circle" size={16} color="#22C55E" />}
                        >
                          Completed
                        </Chip>
                      ) : lesson.progress && lesson.progress > 0 ? (
                        <Chip 
                          style={styles.inProgressChip}
                          icon={() => <Ionicons name="time" size={16} color="#F59E0B" />}
                        >
                          In Progress ({Math.round(lesson.progress * 100)}%)
                        </Chip>
                      ) : (
                        <Chip 
                          style={styles.notStartedChip}
                          icon={() => <Ionicons name="ellipse-outline" size={16} color="#6B7280" />}
                        >
                          Ready to Start
                        </Chip>
                      )}
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      {showCompletionMessage && (
        <Snackbar
          visible={showCompletionMessage}
          onDismiss={() => setShowCompletionMessage(false)}
          duration={3000}
          style={styles.completionSnackbar}
        >
          Lesson completed successfully! 🎉
        </Snackbar>
      )}

      <Portal>
        <Dialog visible={xpEarnedDialogVisible} onDismiss={() => setXpEarnedDialogVisible(false)}>
          <Dialog.Title>Lesson Completed! 🎉</Dialog.Title>
          <Dialog.Content>
            <View style={styles.xpDialogContent}>
              <Ionicons name="star" size={48} color="#F59E0B" />
              <Text style={styles.xpDialogText}>You earned {xpEarned} XP!</Text>
              <Text>Keep learning to level up your skills!</Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setXpEarnedDialogVisible(false)}>Continue</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  courseHeroCard: {
    margin: 16,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  courseHeroContent: {
    padding: 16,
  },
  courseIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1F2937',
  },
  courseMetaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  difficultyChip: {
    borderRadius: 12,
  },
  lessonCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonCountText: {
    fontSize: 14,
    color: '#6366F1',
  },
  courseDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    marginBottom: 16,
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tagChip: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
  },
  tagChipText: {
    color: '#6366F1',
  },
  progressSection: {
    marginVertical: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  progressStats: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  startButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  lessonsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  lessonCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  lessonCardContent: {
    padding: 12,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lessonMetaLeft: {
    flexDirection: 'column',
    gap: 6,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
  },
  completedLessonCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
  },
  completedLessonNumberContainer: {
    backgroundColor: '#DCFCE7',
  },
  completedLessonNumber: {
    color: '#22C55E',
  },
  inProgressChip: {
    backgroundColor: '#FEF3C7',
  },
  notStartedChip: {
    backgroundColor: '#F3F4F6',
  },
  completedChip: {
    backgroundColor: '#DCFCE7',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorButton: {
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  bottomPadding: {
    height: 32,
  },
  completionSnackbar: {
    backgroundColor: '#22C55E',
    borderRadius: 8,
  },
  inProgressLessonCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  inProgressLessonNumberContainer: {
    backgroundColor: '#FEF3C7',
  },
  inProgressLessonNumber: {
    color: '#F59E0B',
  },
  xpDialogContent: {
    alignItems: 'center',
    padding: 16,
  },
  xpDialogText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#F59E0B',
  },
});

function getDifficultyColor(difficulty: string): string {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return '#22C55E20';
    case 'intermediate':
      return '#3B82F620';
    case 'advanced':
      return '#8B5CF620';
    default:
      return '#E5E7EB';
  }
}

function getDifficultyTextColor(difficulty: string): string {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return '#22C55E';
    case 'intermediate':
      return '#3B82F6';
    case 'advanced':
      return '#8B5CF6';
    default:
      return '#6B7280';
  }
}

function getIconForCourse(title: string): string {
  if (!title) return 'book-outline';
  
  const titleLower = title.toLowerCase();
  if (titleLower.includes('javascript')) return 'logo-javascript';
  if (titleLower.includes('react')) return 'logo-react';
  if (titleLower.includes('node')) return 'server-outline';
  if (titleLower.includes('python')) return 'logo-python';
  if (titleLower.includes('typescript')) return 'code-slash-outline';
  if (titleLower.includes('mobile') || titleLower.includes('react native')) return 'phone-portrait-outline';
  if (titleLower.includes('graphql')) return 'git-network-outline';
  if (titleLower.includes('devops')) return 'git-branch-outline';
  
  return 'book-outline';
}

function getCourseIconColor(title: string): string {
  if (!title) return '#6366F1';
  
  const titleLower = title.toLowerCase();
  if (titleLower.includes('javascript')) return '#F7DF1E';
  if (titleLower.includes('react')) return '#61DAFB';
  if (titleLower.includes('node')) return '#68A063';
  if (titleLower.includes('python')) return '#3776AB';
  if (titleLower.includes('typescript')) return '#3178C6';
  if (titleLower.includes('mobile') || titleLower.includes('react native')) return '#61DAFB';
  if (titleLower.includes('graphql')) return '#E535AB';
  if (titleLower.includes('devops')) return '#2496ED';
  
  return '#6366F1';
} 