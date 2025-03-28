import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Chip, IconButton, useTheme, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getLessonsByCourse } from '../services/courseService';
import { LinearGradient } from 'expo-linear-gradient';

// Add this type definition at the top of your file
type RootStackParamList = {
  Home: undefined;
  CourseDetail: { courseId: string };
  LessonDetail: { lessonId: string };
  CoursesCategory: { difficulty?: string; tag?: string; title: string };
  LessonList: { type: string; title: string; color: string; courseId: string };
};

export default function LessonListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { type, title, color, courseId } = route.params;
  
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        
        if (type === 'course' && courseId) {
          // Get lessons for specific course
          const data = await getLessonsByCourse(courseId);
          setLessons(data);
        } else if (type === 'category') {
          // For categories, we would need a different endpoint
          setLessons([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError('Failed to load lessons');
        setLoading(false);
      }
    };

    fetchLessons();
  }, [type, courseId]);

  // Helper function to get icon based on topic
  const getTopicIcon = (topic) => {
    const topicLower = topic.toLowerCase();
    if (topicLower.includes('javascript')) return 'logo-javascript';
    if (topicLower.includes('react')) return 'logo-react';
    if (topicLower.includes('node')) return 'logo-nodejs';
    if (topicLower.includes('python')) return 'logo-python';
    if (topicLower.includes('data')) return 'bar-chart-outline';
    if (topicLower.includes('algorithm')) return 'git-network-outline';
    if (topicLower.includes('web')) return 'globe-outline';
    return 'code-slash-outline';
  };

  // Helper function to get gradient colors based on topic
  const getTopicGradient = (topic) => {
    const topicLower = topic.toLowerCase();
    if (topicLower.includes('javascript')) return ['#F7DF1E', '#F0DB4F'];
    if (topicLower.includes('react')) return ['#61DAFB', '#00D8FF'];
    if (topicLower.includes('node')) return ['#68A063', '#3C873A'];
    if (topicLower.includes('python')) return ['#4B8BBE', '#306998'];
    if (topicLower.includes('data')) return ['#FF6B6B', '#FF8E53'];
    if (topicLower.includes('algorithm')) return ['#6366F1', '#8B5CF6'];
    return ['#4F46E5', '#7C3AED'];
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
              onPress={() => {
                if (courseId) {
                  navigation.navigate('CourseDetail', { courseId });
                } else {
                  navigation.navigate('Home');
                }
              }}
              iconColor="#FFFFFF"
            />
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, {color: theme.colors.onSurfaceVariant}]}>
            Loading lessons...
          </Text>
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
              onPress={() => {
                if (courseId) {
                  navigation.navigate('CourseDetail', { courseId });
                } else {
                  navigation.navigate('Home');
                }
              }}
              iconColor="#FFFFFF"
            />
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <IconButton
            icon="refresh"
            size={24}
            onPress={() => {
              if (courseId) {
                navigation.navigate('CourseDetail', { courseId });
              } else {
                navigation.navigate('Home');
              }
            }}
            iconColor={theme.colors.primary}
          />
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
            onPress={() => {
              if (courseId) {
                navigation.navigate('CourseDetail', { courseId });
              } else {
                navigation.navigate('Home');
              }
            }}
            iconColor="#FFFFFF"
          />
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        {lessons.length > 0 ? (
          <View style={styles.lessonsList}>
            {lessons.map((lesson, index) => (
              <Card
                key={lesson._id}
                style={styles.lessonCard}
                onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson._id })}
              >
                <LinearGradient
                  colors={['#6366F1', '#818CF8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.lessonCardHeader}
                >
                  <View style={styles.lessonNumberContainer}>
                    <Text style={styles.lessonNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.topicContainer}>
                    <Ionicons name={getTopicIcon(lesson.topic)} size={16} color="#FFFFFF" />
                    <Text style={styles.topicText}>{lesson.topic}</Text>
                  </View>
                </LinearGradient>
                
                <Card.Content style={styles.lessonCardContent}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  
                  <View style={styles.lessonMeta}>
                    <Chip style={styles.timeChip}>
                      <Ionicons name="time-outline" size={16} color="#6366F1" />
                      <Text style={styles.timeText}>{lesson.duration} min</Text>
                    </Chip>
                    
                    <View style={styles.progressIndicator}>
                      {lesson.completed ? (
                        <>
                          <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                          <Text style={styles.progressText}>Completed</Text>
                        </>
                      ) : lesson.inProgress ? (
                        <>
                          <Ionicons name="play-circle" size={16} color="#3B82F6" />
                          <Text style={[styles.progressText, {color: '#3B82F6'}]}>In Progress</Text>
                        </>
                      ) : (
                        <>
                          <Ionicons name="ellipse-outline" size={16} color="#6B7280" />
                          <Text style={styles.notStartedText}>Not Started</Text>
                        </>
                      )}
                    </View>
                  </View>
                </Card.Content>
                
                <Card.Actions style={styles.cardActions}>
                  <IconButton
                    icon="arrow-right"
                    iconColor="#6366F1"
                    size={20}
                    onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson._id })}
                    style={styles.actionButton}
                  />
                </Card.Actions>
              </Card>
            ))}
            <View style={styles.bottomPadding} />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No lessons found for this course</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  lessonsList: {
    padding: 16,
  },
  lessonCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  lessonCardHeader: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  lessonNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonNumber: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  topicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  topicText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  lessonCardContent: {
    paddingVertical: 16,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1F2937',
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    elevation: 0,
  },
  timeText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
  },
  progressText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '500',
  },
  notStartedText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  actionButton: {
    backgroundColor: '#F3F4F6',
    margin: 0,
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 32,
  },
}); 