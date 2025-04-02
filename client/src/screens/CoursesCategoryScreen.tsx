import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { Text, IconButton, Card, useTheme, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCoursesByDifficulty, getCoursesByTag } from '../services/courseService';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

// Add this interface at the top of the file
interface Course {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  lessons: any[];
  tags?: string[];
}

// Add this type at the top of your file
type CoursesCategoryScreenParams = {
  difficulty?: string;
  tag?: string;
  title: string;
};

// Add this type definition
type RootStackParamList = {
  Home: undefined;
  CourseDetail: { courseId: string };
  LessonDetail: { lessonId: string };
  CoursesCategory: { difficulty?: string; tag?: string; title: string };
  LessonList: { type: string; title: string; color: string; courseId: string };
};

export default function CoursesCategoryScreen() {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { difficulty, tag, title } = route.params as CoursesCategoryScreenParams;
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        let data;
        
        // Fetch based on parameter provided
        if (difficulty) {
          data = await getCoursesByDifficulty(difficulty);
        } else if (tag) {
          data = await getCoursesByTag(tag);
        }
        
        setCourses(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
        setLoading(false);
      }
    };

    fetchCourses();
  }, [difficulty, tag]);

  // Render course cards with enhanced styling
  const renderCourseItem = (course: Course, index: number) => (
    <Card
      key={course._id}
      style={styles.courseCard}
      onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
      mode="elevated"
    >
      <LinearGradient
        colors={['#6366F1', '#818CF8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.courseCardHeader}
      >
        <Text style={styles.courseNumber}>{index + 1}</Text>
        <Chip 
          style={[styles.difficultyChip, {backgroundColor: 'rgba(255, 255, 255, 0.2)'}]}
          textStyle={{color: '#FFFFFF'}}
        >
          {course.difficulty}
        </Chip>
      </LinearGradient>
      
      <Card.Content style={styles.courseCardContent}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseDescription} numberOfLines={2}>
          {course.description}
        </Text>
        
        <View style={styles.courseMetaContainer}>
          <View style={styles.courseMetaItem}>
            <Ionicons name="book-outline" size={16} color="#6366F1" />
            <Text style={styles.metaText}>
              {course.lessons.length} {course.lessons.length === 1 ? 'Lesson' : 'Lessons'}
            </Text>
          </View>
          
          {course.tags && course.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {course.tags.slice(0, 2).map((tag, idx) => (
                <Chip key={idx} style={styles.tagChip} textStyle={styles.tagChipText}>
                  {tag}
                </Chip>
              ))}
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View style={[styles.header, { backgroundColor: '#6366F1' }]}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            iconColor="#FFFFFF"
          />
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View style={[styles.header, { backgroundColor: '#6366F1' }]}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            iconColor="#FFFFFF"
          />
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <IconButton
            icon="refresh"
            size={24}
            onPress={() => navigation.navigate('Home')}
            iconColor={theme.colors.primary}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, { backgroundColor: '#6366F1' }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          iconColor="#FFFFFF"
        />
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {courses.length > 0 ? (
          <View style={styles.coursesList}>
            {courses.map((course, index) => renderCourseItem(course, index))}
            <View style={styles.bottomPadding} />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No courses found</Text>
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
  scrollView: {
    flex: 1,
  },
  coursesList: {
    padding: 16,
  },
  courseCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  courseCardHeader: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  courseNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  difficultyChip: {
    height: 32,
  },
  courseCardContent: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  courseDescription: {
    fontSize: 14,
    marginBottom: 16,
    color: '#4B5563',
    lineHeight: 20,
  },
  courseMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  courseMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
  },
  tagChipText: {
    color: '#6366F1',
    fontSize: 12,
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
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginVertical: 16,
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
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
  },
  bottomPadding: {
    height: 32,
  },
}); 