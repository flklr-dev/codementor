import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import {
  Text,
  Card,
  Chip,
  IconButton,
  Button,
  ProgressBar,
  useTheme,
  FAB,
  Snackbar,
  Dialog,
  Portal,
  Paragraph,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getLessonById, updateLessonProgress, completeLessonAndUpdateXP } from '../services/lessonService';
import { getCourseWithLessons } from '../services/courseService';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { Animated as RNAnimated } from 'react-native';

type RootStackParamList = {
  Home: undefined;
  CourseDetail: { courseId: string; lessonCompleted?: boolean; xpEarned?: number };
  LessonDetail: { lessonId: string };
  CoursesCategory: { difficulty?: string; tag?: string; title: string };
  LessonList: { type: string; title: string; color: string; courseId: string };
};

interface Lesson {
  _id: string;
  title: string;
  content: string | Array<{
    title?: string;
    type?: string;
    content: string;
    codeLanguage?: string;
  }>;
  duration: number;
  topic: string;
  order: number;
  courseId?: string;
}

export default function LessonDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { lessonId } = route.params as { lessonId: string };
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [showXpCelebration, setShowXpCelebration] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [xpScaleAnim] = useState(new RNAnimated.Value(1));
  const [textFadeAnim] = useState(new RNAnimated.Value(0));

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const data = await getLessonById(lessonId);
        console.log("Lesson data received:", JSON.stringify(data));
        setLesson(data);
        
        // Set progress and completion status from server data
        setProgress(data.progress || 0);
        setIsCompleted(data.completed || data.progress >= 1);
        
        // Fetch course to find next lesson
        if (data.courseId) {
          const courseData = await getCourseWithLessons(data.courseId);
          if (courseData && courseData.lessons && courseData.lessons.length > 0) {
            // Sort lessons by order if available
            const sortedLessons = [...courseData.lessons].sort((a, b) => 
              (a.order || 0) - (b.order || 0)
            );
            
            // Find current lesson index
            const currentIndex = sortedLessons.findIndex(l => l._id === lessonId);
            if (currentIndex !== -1 && currentIndex < sortedLessons.length - 1) {
              // Set next lesson ID
              setNextLessonId(sortedLessons[currentIndex + 1]._id);
            }
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Failed to load lesson details');
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  // Function to update lesson progress
  const handleUpdateProgress = async (newProgress: number) => {
    try {
      console.log('Updating progress:', lessonId, newProgress);
      
      if (!lessonId) {
        setSnackbarMessage('Invalid lesson ID');
        setShowSnackbar(true);
        return;
      }

      const result = await updateLessonProgress(lessonId, newProgress);
      console.log('Progress update result:', result);
      
      if (result.success) {
        setProgress(newProgress);
        setIsCompleted(newProgress >= 1);
        
        if (newProgress >= 1) {
          try {
            const completionResult = await completeLessonAndUpdateXP(lessonId);
            console.log('Completion result:', completionResult);
            
            if (completionResult.success) {
              if (completionResult.alreadyCompleted) {
                setSnackbarMessage('Lesson marked as complete! 🎉');
              } else {
                const xpEarned = completionResult.xpEarned || 0;
                
                // Instead of a simple snackbar, we'll navigate with the XP info
                setProgress(1);
                setIsCompleted(true);
                
                // Update navigation params to indicate completion with XP
                if (lesson?.courseId) {
                  navigation.navigate('CourseDetail', { 
                    courseId: lesson.courseId,
                    lessonCompleted: true,
                    xpEarned: xpEarned
                  });
                }
                return; // Skip the rest of the function
              }
            }
          } catch (completionErr) {
            console.error('Error in completion:', completionErr);
            setSnackbarMessage('Lesson marked as complete! 🎉');
            setShowSnackbar(true);
          }
        } else {
          setSnackbarMessage('Progress updated!');
          setShowSnackbar(true);
        }
      } else {
        throw new Error('Failed to update progress');
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      setSnackbarMessage('Failed to update progress. Please try again.');
      setShowSnackbar(true);
    }
  };

  // Mark lesson as complete
  const markAsComplete = () => {
    setConfirmDialogVisible(true);
  };

  // Continue to next lesson
  const continueToNextLesson = () => {
    if (nextLessonId) {
      // Navigate to next lesson if available
      navigation.navigate('LessonDetail', { lessonId: nextLessonId });
    } else if (lesson?.courseId) {
      // Navigate back to course if no next lesson
      navigation.navigate('CourseDetail', { 
        courseId: lesson.courseId,
        lessonCompleted: true,
        xpEarned: 0 // No additional XP since lesson was already completed
      });
    } else {
      setSnackbarMessage('Cannot find next lesson');
      setShowSnackbar(true);
    }
  };

  // Handle back navigation
  const handleBackNavigation = () => {
    if (lesson?.courseId) {
      navigation.navigate('CourseDetail', { courseId: lesson.courseId });
    } else {
      navigation.goBack();
    }
  };

  // Get topic-specific gradient colors
  const getTopicGradient = () => {
    return ['#6366F1', '#818CF8'];
  };

  // Add this function to confirm completion
  const confirmCompletion = async () => {
    setConfirmDialogVisible(false);
    try {
      const result = await completeLessonAndUpdateXP(lessonId);
      if (result.success) {
        setProgress(1);
        setIsCompleted(true);
        
        // Show XP celebration
        setEarnedXp(result.xpEarned || 0);
        setShowXpCelebration(true);
        // Trigger animation after dialog is visible
        setTimeout(animateXpCelebration, 100);
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      setSnackbarMessage('Error completing lesson. Please try again.');
      setShowSnackbar(true);
    }
  };

  // Simplify the animation function
  const animateXpCelebration = () => {
    // Reset animation values
    xpScaleAnim.setValue(0.5);
    textFadeAnim.setValue(0);
    
    // Simple scale up animation for the XP badge (just 1 second)
    RNAnimated.timing(xpScaleAnim, {
      toValue: 1,
      duration: 500, // Half a second
      useNativeDriver: true,
    }).start();
    
    // Quick fade in for text
    RNAnimated.timing(textFadeAnim, {
      toValue: 1,
      duration: 300, // 0.3 seconds
      useNativeDriver: true,
    }).start();
    
    // Auto-dismiss after 2 seconds but stay on the same screen
    setTimeout(() => {
      setShowXpCelebration(false);
      // Don't navigate away - just close the dialog
    }, 2000); // 2 seconds total display time
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
              onPress={handleBackNavigation}
              iconColor="#FFFFFF"
            />
            <Text style={styles.headerTitle}>Lesson</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={[styles.loadingText, {color: theme.colors.onSurfaceVariant}]}>
            Loading lesson...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !lesson) {
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
              onPress={handleBackNavigation}
              iconColor="#FFFFFF"
            />
            <Text style={styles.headerTitle}>Lesson</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#6B7280" />
          <Text style={styles.errorText}>{error || 'Something went wrong'}</Text>
          <Button 
            mode="contained" 
            onPress={handleBackNavigation}
            style={{ borderRadius: 12, backgroundColor: '#6366F1' }}
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
            onPress={handleBackNavigation}
            iconColor="#FFFFFF"
          />
          <Text style={styles.headerTitle}>{lesson?.title || 'Lesson'}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        {/* Title Section with enhanced styling */}
        <Card style={styles.titleCard}>
          <Card.Content>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Chip 
              style={[styles.topicChip, {backgroundColor: '#6366F120'}]} 
              textStyle={[styles.topicChipText, {color: '#6366F1'}]}
              icon={() => <Ionicons name="school-outline" size={16} color="#6366F1" />}
            >
              {lesson.topic}
            </Chip>
            
            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={18} color="#6366F1" />
                <Text style={styles.metaText}>{lesson.duration} mins</Text>
              </View>
              
              {/* Add XP reward indicator */}
              <View style={styles.metaItem}>
                <Ionicons name="star-outline" size={18} color="#F59E0B" />
                <Text style={[styles.metaText, {color: '#F59E0B'}]}>
                  {Math.floor((lesson.duration || 5) * 2)} XP reward
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        {/* Content Sections with enhanced styling */}
        {typeof lesson.content === 'string' ? (
          <Card style={styles.contentCard}>
            <Card.Content>
              <Text style={styles.sectionText}>{lesson.content}</Text>
            </Card.Content>
          </Card>
        ) : (
          lesson?.content && lesson.content.map((section, index) => (
            <Card key={index} style={styles.contentCard}>
              <Card.Content>
                {section.title && (
                  <View style={styles.sectionTitleContainer}>
                    <LinearGradient
                      colors={['#6366F1', '#818CF8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.sectionTitleGradient}
                    />
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                  </View>
                )}
                
                {section.type === 'text' && (
                  <Text style={styles.sectionText}>{section.content}</Text>
                )}
                
                {section.type === 'code' && (
                  <View style={styles.codeBlock}>
                    <View style={styles.codeHeader}>
                      <Text style={styles.codeLanguage}>{section.codeLanguage || 'Code'}</Text>
                    </View>
                    <ScrollView horizontal>
                      <Text style={styles.codeContent}>
                        {section.content}
                      </Text>
                    </ScrollView>
                  </View>
                )}
                
                {section.type === 'image' && (
                  <View style={styles.imageContainer}>
                    <LinearGradient
                      colors={['#F3F4F6', '#E5E7EB']}
                      style={styles.imagePlaceholderGradient}
                    >
                      <Ionicons name="image-outline" size={48} color="#6B7280" />
                      <Text style={styles.imagePlaceholder}>Image placeholder</Text>
                    </LinearGradient>
                    {section.title && <Text style={styles.imageCaption}>{section.title}</Text>}
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
        )}
        
        {/* Navigation buttons with enhanced styling */}
        <View style={styles.navigationButtonsContainer}>
          <Button 
            mode="outlined" 
            style={styles.navButton}
            contentStyle={styles.navButtonContent}
            labelStyle={styles.navButtonLabel}
            icon="arrow-left"
            onPress={handleBackNavigation}
          >
            Back
          </Button>
          
          {progress < 1 ? (
            <Button 
              mode="contained" 
              style={[styles.navButton, {backgroundColor: '#6366F1'}]}
              contentStyle={styles.navButtonContent}
              labelStyle={styles.navButtonLabel}
              icon="check"
              onPress={markAsComplete}
            >
              Mark Complete
            </Button>
          ) : (
            <Button 
              mode="contained" 
              style={[styles.navButton, {backgroundColor: '#22C55E'}]}
              contentStyle={styles.navButtonContent}
              labelStyle={styles.navButtonLabel}
              icon="arrow-right"
              onPress={continueToNextLesson}
            >
              Next Lesson
            </Button>
          )}
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Snackbar for notifications */}
      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>

      {/* Confirmation dialog */}
      <Portal>
        <Dialog visible={confirmDialogVisible} onDismiss={() => setConfirmDialogVisible(false)}>
          <Dialog.Title>Confirm Lesson Completion</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Have you understood all the concepts in this lesson? 
              Marking it as complete will earn you {Math.floor((lesson?.duration || 5) * 2)} XP.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmCompletion}>Yes, I've learned it</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* XP Celebration Dialog */}
      <Portal>
        <Dialog 
          visible={showXpCelebration} 
          onDismiss={() => setShowXpCelebration(false)}
          style={styles.xpDialog}
        >
          <View style={styles.xpCelebrationContainer}>
            <LinearGradient
              colors={['#F59E0B', '#FBBF24']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.xpCelebrationGradient}
            >
              {/* Simplified XP badge */}
              <RNAnimated.View 
                style={[
                  styles.xpBadge, 
                  { transform: [{ scale: xpScaleAnim }] }
                ]}
              >
                <Text style={styles.xpAmount}>+{earnedXp}</Text>
                <Text style={styles.xpLabel}>XP</Text>
              </RNAnimated.View>
              
              {/* Simple completion message */}
              <RNAnimated.Text 
                style={[
                  styles.congratsText, 
                  { opacity: textFadeAnim }
                ]}
              >
                Lesson Complete
              </RNAnimated.Text>
            </LinearGradient>
          </View>
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
  titleCard: {
    margin: 16,
    marginTop: 16,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  topicChip: {
    backgroundColor: '#6366F1',
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderRadius: 20,
  },
  topicChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    marginLeft: 4,
    color: '#6366F1',
    fontWeight: '500',
  },
  contentCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleGradient: {
    width: 4,
    height: 24,
    marginRight: 8,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  codeBlock: {
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  codeHeader: {
    backgroundColor: '#1F2937',
    padding: 12,
    paddingHorizontal: 16,
  },
  codeLanguage: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: 'bold',
  },
  codeContent: {
    fontFamily: 'monospace',
    backgroundColor: '#282c34',
    color: '#abb2bf',
    padding: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  imageContainer: {
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePlaceholderGradient: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  imageCaption: {
    textAlign: 'center',
    padding: 8,
    color: '#6B7280',
    fontSize: 14,
    fontStyle: 'italic',
  },
  navigationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  navButton: {
    borderRadius: 12,
    minWidth: 120,
  },
  navButtonContent: {
    height: 48,
  },
  navButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  snackbar: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
  },
  bottomPadding: {
    height: 80,
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
  xpDialog: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  xpCelebrationContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    margin: 24,
  },
  xpCelebrationGradient: {
    width: '100%',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  xpBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  xpAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  xpLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginTop: -4,
  },
  congratsText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 