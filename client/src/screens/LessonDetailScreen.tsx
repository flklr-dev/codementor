import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, Alert, TouchableOpacity, ViewStyle, TextStyle, Modal, RefreshControl } from 'react-native';
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
  TextInput,
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
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateUserData } from '../store/slices/authSlice';
import * as Clipboard from 'expo-clipboard';

type RootStackParamList = {
  Home: undefined;
  CourseDetail: { 
    courseId: string; 
    lessonCompleted?: boolean; 
    xpEarned?: number;
    quizCompleted?: boolean;
  };
  LessonDetail: { lessonId: string };
  CoursesCategory: { difficulty?: string; tag?: string; title: string };
  LessonList: { type: string; title: string; color: string; courseId: string };
  Quiz: { courseId: string };
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
  courseId: string;
}

interface Quiz {
  _id: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  xpReward: number;
}

interface Message {
  type: 'user' | 'ai';
  content: string;
  id: string;
  codeBlock?: {
    language: string;
    code: string;
    copied?: boolean;
  };
}

interface CopyState {
  [key: string]: boolean;
}

// Define the style types
interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  headerTitle: TextStyle;
  scrollView: ViewStyle;
  titleSection: ViewStyle;
  lessonTitle: TextStyle;
  metaRow: ViewStyle;
  topicChip: ViewStyle;
  topicChipText: TextStyle;
  durationText: TextStyle;
  xpText: TextStyle;
  progressContainer: ViewStyle;
  progressLabelRow: ViewStyle;
  progressLabel: TextStyle;
  progressPercent: TextStyle;
  progressBar: ViewStyle;
  contentContainer: ViewStyle;
  sectionContainer: ViewStyle;
  sectionTitle: TextStyle;
  contentText: TextStyle;
  codeContainer: ViewStyle;
  codeHeader: ViewStyle;
  windowButtons: ViewStyle;
  windowBtn: ViewStyle;
  closeBtn: ViewStyle;
  minimizeBtn: ViewStyle;
  maximizeBtn: ViewStyle;
  codeLang: TextStyle;
  code: TextStyle;
  imageContainer: ViewStyle;
  imageBox: ViewStyle;
  imageCaption: TextStyle;
  actionContainer: ViewStyle;
  actionButton: ViewStyle;
  snackbar: ViewStyle;
  xpDialog: ViewStyle;
  completionContainer: ViewStyle;
  xpBadge: ViewStyle;
  xpAmount: TextStyle;
  xpLabel: TextStyle;
  completionTitle: TextStyle;
  completionButton: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  lockedContainer: ViewStyle;
  lockedContent: ViewStyle;
  lockedTitle: TextStyle;
  lockedText: TextStyle;
  backButton: ViewStyle;
  divider: ViewStyle;
  buttonCenter: ViewStyle;
  buttonLabel: TextStyle;
  completionButtonLabel: TextStyle;
  questionText: TextStyle;
  optionsContainer: ViewStyle;
  optionItem: ViewStyle;
  selectedOption: ViewStyle;
  optionText: TextStyle;
  confirmDialog: ViewStyle;
  confirmContent: ViewStyle;
  confirmIcon: ViewStyle;
  confirmTitle: TextStyle;
  confirmXP: TextStyle;
  confirmButtons: ViewStyle;
  cancelButton: ViewStyle;
  cancelButtonLabel: TextStyle;
  completeButton: ViewStyle;
  completeButtonLabel: TextStyle;
  copyCodeButton: ViewStyle;
  copyCodeText: TextStyle;
  codeActions: ViewStyle;
  aiChatButton: ViewStyle;
  aiChatModal: ViewStyle;
  aiChatContainer: ViewStyle;
  aiChatHeader: ViewStyle;
  aiChatTitle: TextStyle;
  aiChatMessages: ViewStyle;
  messageWrapper: ViewStyle;
  messageBubble: ViewStyle;
  userMessage: ViewStyle;
  aiMessage: ViewStyle;
  userMessageText: TextStyle;
  aiMessageText: TextStyle;
  aiAssistantAvatar: ViewStyle;
  aiChatInputContainer: ViewStyle;
  aiChatInput: ViewStyle;
  aiChatSendButton: ViewStyle;
  aiChatCloseButton: ViewStyle;
  aiLoadingIndicator: ViewStyle;
  codeBlock: ViewStyle;
  codeLanguage: TextStyle;
  copyButton: ViewStyle;
  copyButtonText: TextStyle;
  codeText: TextStyle;
  chatCodeHeader: ViewStyle;
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
  const dispatch = useAppDispatch();
  const [isLastLesson, setIsLastLesson] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const user = useAppSelector(state => state.auth.user);
  const [quizStatus, setQuizStatus] = useState<{ completed: boolean; passed: boolean } | null>(null);
  const [canAccess, setCanAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiMessages, setAiMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI assistant for this lesson. How can I help you understand the content better?"
    }
  ]);
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const [aiLoading, setAiLoading] = useState(false);
  const aiChatScrollViewRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    const checkIfLastLesson = async () => {
      if (lesson?.courseId) {
        try {
          const courseData = await getCourseWithLessons(lesson.courseId);
          console.log('Course data received:', courseData);
          
          if (courseData && courseData.lessons) {
            const sortedLessons = [...courseData.lessons].sort((a, b) => 
              (a.order || 0) - (b.order || 0)
            );
            const isLast = sortedLessons[sortedLessons.length - 1]._id === lessonId;
            console.log('Is last lesson:', isLast);
            setIsLastLesson(isLast);
            
            // If it's the last lesson, fetch the quiz
            if (isLast) {
              try {
                const courseId = lesson.courseId as string;
                console.log('Fetching quiz for course:', courseId);
                const response = await api.get(`/quiz/course/${courseId}`);
                console.log('Quiz data received:', response.data);
                setQuiz(response.data);
              } catch (error: any) {
                console.error('Error fetching quiz:', error.response?.data || error.message);
                if (error.response?.status === 404) {
                  setSnackbarMessage('No quiz available for this course yet.');
                } else {
                  setSnackbarMessage('Error loading quiz. Please try again.');
                }
                setShowSnackbar(true);
              }
            }
          }
        } catch (error) {
          console.error('Error checking last lesson:', error);
          setSnackbarMessage('Error loading course data. Please try again.');
          setShowSnackbar(true);
        }
      }
    };

    if (lesson) {
      checkIfLastLesson();
    }
  }, [lesson, lessonId]);

  useEffect(() => {
    const checkQuizStatus = async () => {
      if (isLastLesson && lesson?.courseId) {
        try {
          const response = await api.get(`/quiz/status/${lesson.courseId}`);
          setQuizStatus(response.data);
        } catch (error) {
          console.error('Error checking quiz status:', error);
        }
      }
    };

    if (isLastLesson) {
      checkQuizStatus();
    }
  }, [isLastLesson, lesson?.courseId]);

  useEffect(() => {
    const checkLessonAccess = async () => {
      if (!lesson?.courseId) return;
      
      try {
        const courseData = await getCourseWithLessons(lesson.courseId);
        if (courseData && courseData.lessons) {
          const sortedLessons = [...courseData.lessons].sort((a, b) => 
            (a.order || 0) - (b.order || 0)
          );
          
          // Find current lesson index
          const currentIndex = sortedLessons.findIndex(l => l._id === lessonId);
          
          // First lesson is always accessible
          if (currentIndex === 0) {
            setCanAccess(true);
            setIsLoading(false);
            return;
          }
          
          // Check if previous lesson exists and is completed
          if (currentIndex > 0) {
            const previousLesson = sortedLessons[currentIndex - 1];
            const response = await api.get(`/lessons/${previousLesson._id}/progress`);
            setCanAccess(response.data.completed);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking lesson access:', error);
        setIsLoading(false);
        setError('Failed to check lesson access');
      }
    };

    checkLessonAccess();
  }, [lessonId, lesson?.courseId]);

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
                
                // Update user data in Redux store
                await dispatch(updateUserData({}));
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
        
        // Show simple XP celebration
        setEarnedXp(result.xpEarned || 0);
        setShowXpCelebration(true);
        
        // Update user data in Redux store
        await dispatch(updateUserData({}));
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      setSnackbarMessage('Error completing lesson. Please try again.');
      setShowSnackbar(true);
    }
  };

  // Add these functions to handle quiz
  const handleStartQuiz = () => {
    if (lesson?.courseId) {
      navigation.navigate('Quiz', { courseId: lesson.courseId });
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !user || !lesson) return;

    try {
      const response = await api.post('/quiz/submit', {
        quizId: quiz._id,
        courseId: lesson.courseId,
        answers: selectedAnswers
      });

      if (response.data.success) {
        // Show completion dialog with earned XP
        setEarnedXp(response.data.xpEarned);
        setShowXpCelebration(true);
        
        // Update user data in Redux store
        await dispatch(updateUserData({}));
        
        // Navigate back to course with quiz completion state
        setTimeout(() => {
          navigation.navigate('CourseDetail', { 
            courseId: lesson.courseId,
            quizCompleted: true,
            xpEarned: response.data.xpEarned
          });
        }, 2000);
      } else {
        setSnackbarMessage(response.data.message || 'Quiz completed, but score was too low to pass. Try again!');
        setShowSnackbar(true);
      }
    } catch (error: any) {
      console.error('Error submitting quiz:', error.response?.data || error.message);
      setSnackbarMessage('Error submitting quiz. Please try again.');
      setShowSnackbar(true);
    }
  };

  // Function to copy code
  const copyCodeToClipboard = async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
      
      // Update copy states to show feedback
      const copyKey = `code_${Date.now()}`;
      setCopyStates(prev => ({
        ...prev,
        [copyKey]: true
      }));
      
      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopyStates(prev => ({
          ...prev,
          [copyKey]: false
        }));
      }, 2000);
      
      setSnackbarMessage('Code copied to clipboard!');
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error copying code:', error);
      setSnackbarMessage('Failed to copy code');
      setShowSnackbar(true);
    }
  };

  // Function to handle AI chat
  const handleAiChatSend = async () => {
    if (!aiMessage.trim() || aiLoading) return;
    
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: aiMessage.trim()
    };
    setAiMessages(prev => [...prev, userMsg]);
    setAiMessage('');
    setAiLoading(true);
    
    try {
      // Get lesson content as context for the AI in a more structured way
      let lessonContext = '';
      
      // Add lesson title and metadata for better context
      if (lesson) {
        lessonContext += `Lesson Title: ${lesson.title}\n`;
        lessonContext += `Topic: ${lesson.topic}\n`;
        
        // Process content based on its type
        if (typeof lesson.content === 'string') {
          lessonContext += `Content: ${lesson.content}\n`;
        } else if (Array.isArray(lesson.content)) {
          // Process structured content
          lesson.content.forEach((section, i) => {
            if (section.title) {
              lessonContext += `Section ${i+1}: ${section.title}\n`;
            }
            
            if (section.type === 'text') {
              lessonContext += `${section.content}\n\n`;
            } else if (section.type === 'code') {
              lessonContext += `Code Example (${section.codeLanguage || 'code'}):\n${section.content}\n\n`;
            }
          });
        }
      }
      
      console.log('Sending AI context:', lessonContext.substring(0, 100) + '...');
      
      // Send to AI API with improved lesson context
      const response = await api.post('/mentor/chat', {
        message: `Based on this lesson: "${lesson?.title}", ${aiMessage.trim()}`,
        context: lessonContext
      });
      
      if (response.data && response.data.response) {
        // Parse response to extract code blocks
        const aiResponse = parseAiResponse(response.data.response);
        
        // Add AI response
        setAiMessages(prev => [...prev, aiResponse]);
        
        // Scroll to bottom
        setTimeout(() => {
          aiChatScrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an issue. Please try again or ask a different question.'
      };
      setAiMessages(prev => [...prev, errorMsg]);
    } finally {
      setAiLoading(false);
    }
  };
  
  // Function to parse AI response and extract code blocks
  const parseAiResponse = (response: string): Message => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: response
    };
    
    // Check for code blocks using regex pattern ```language code ```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const match = codeBlockRegex.exec(response);
    
    if (match) {
      // Extract language and code
      const language = match[1] || 'code';
      const code = match[2].trim();
      
      // Remove code block from the message content
      message.content = response.replace(match[0], '').trim();
      
      // Add code block to message
      message.codeBlock = {
        language,
        code
      };
    }
    
    return message;
  };

  // Function to handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Force refresh from server
      const data = await getLessonById(lessonId, true);
      setLesson(data);
      setProgress(data.progress || 0);
      setIsCompleted(data.completed || data.progress >= 1);
      
      // Refresh course data as well
      if (data.courseId) {
        await getCourseWithLessons(data.courseId, true);
      }
    } catch (err) {
      console.error('Error refreshing lesson:', err);
      setSnackbarMessage('Failed to refresh. Pull down to try again.');
      setShowSnackbar(true);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading || isLoading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View style={[styles.header, { backgroundColor: '#6366F1' }]}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={handleBackNavigation}
            iconColor="#FFFFFF"
          />
          <Text style={styles.headerTitle}>Lesson</Text>
          <View style={{ width: 40 }} />
        </View>
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
        <View style={[styles.header, { backgroundColor: '#6366F1' }]}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={handleBackNavigation}
            iconColor="#FFFFFF"
          />
          <Text style={styles.headerTitle}>Lesson</Text>
          <View style={{ width: 40 }} />
        </View>
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

  if (!canAccess) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View style={[styles.header, { backgroundColor: '#6366F1' }]}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={handleBackNavigation}
            iconColor="#FFFFFF"
          />
          <Text style={styles.headerTitle}>{lesson?.title || 'Lesson'}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.lockedContainer}>
          <View style={styles.lockedContent}>
            <Ionicons name="lock-closed" size={64} color="#6B7280" />
            <Text style={styles.lockedTitle}>Lesson Locked</Text>
            <Text style={styles.lockedText}>
              Complete the previous lesson to unlock this content.
            </Text>
            <Button 
              mode="contained" 
              onPress={handleBackNavigation}
              style={styles.backButton}
            >
              Go Back
            </Button>
          </View>
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
          onPress={handleBackNavigation}
          iconColor="#FFFFFF"
        />
        <Text style={styles.headerTitle}>{lesson?.title || 'Lesson'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366F1']}
          />
        }
      >
        {/* Simple Title Section */}
        <View style={styles.titleSection}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <View style={styles.metaRow}>
            <Chip 
              style={styles.topicChip} 
              textStyle={styles.topicChipText}
            >
              {lesson.topic}
            </Chip>
            <Text style={styles.durationText}>
              <Ionicons name="time-outline" size={14} color="#6B7280" /> {lesson.duration} mins
            </Text>
            <Text style={styles.xpText}>
              <Ionicons name="star-outline" size={14} color="#F59E0B" /> {Math.floor((lesson.duration || 5) * 2)} XP
            </Text>
          </View>
              </View>
              
        {/* Lesson Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
              </View>
          <ProgressBar 
            progress={progress} 
            color="#6366F1" 
            style={styles.progressBar}
          />
            </View>
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Content */}
        <View style={styles.contentContainer}>
        {typeof lesson.content === 'string' ? (
            <Text style={styles.contentText}>{lesson.content}</Text>
        ) : (
          lesson?.content && lesson.content.map((section, index) => (
              <View key={index} style={styles.sectionContainer}>
                {section.title && (
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                )}
                
                {section.type === 'text' && (
                  <Text style={styles.contentText}>{section.content}</Text>
                )}
                
                {section.type === 'code' && (
                  <View style={styles.codeContainer}>
                    <View style={styles.codeHeader}>
                      <View style={styles.windowButtons}>
                        <View style={[styles.windowBtn, styles.closeBtn]} />
                        <View style={[styles.windowBtn, styles.minimizeBtn]} />
                        <View style={[styles.windowBtn, styles.maximizeBtn]} />
                    </View>
                      <View style={styles.codeActions}>
                        <Text style={styles.codeLang}>{section.codeLanguage || 'Code'}</Text>
                        <TouchableOpacity 
                          style={styles.copyCodeButton}
                          onPress={() => copyCodeToClipboard(section.content)}
                        >
                          <Ionicons name="copy-outline" size={14} color="#6B7280" />
                          <Text style={styles.copyCodeText}>Copy</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <Text style={styles.code}>{section.content}</Text>
                    </ScrollView>
                  </View>
                )}
                
                {section.type === 'image' && (
                  <View style={styles.imageContainer}>
                    <View style={styles.imageBox}>
                      <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                    </View>
                    {section.title && <Text style={styles.imageCaption}>{section.title}</Text>}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
        
        {/* Bottom Action Buttons */}
        <View style={styles.actionContainer}>
          {progress < 1 ? (
            <View style={styles.buttonCenter}>
            <Button 
              mode="contained" 
                style={styles.actionButton}
                labelStyle={styles.buttonLabel}
              onPress={markAsComplete}
                icon="check"
            >
              Mark Complete
            </Button>
            </View>
          ) : isLastLesson ? (
            quizStatus?.passed ? (
              <View style={styles.buttonCenter}>
              <Button 
                mode="contained" 
                  style={[styles.actionButton, { backgroundColor: '#22C55E' }]}
                  labelStyle={styles.buttonLabel}
                disabled
                  icon="check-circle"
              >
                Quiz Passed
              </Button>
              </View>
            ) : (
              <View style={styles.buttonCenter}>
              <Button 
                mode="contained" 
                  style={[styles.actionButton, { backgroundColor: '#22C55E' }]}
                  labelStyle={styles.buttonLabel}
                onPress={handleStartQuiz}
                  icon="school"
              >
                Take Quiz
              </Button>
              </View>
            )
          ) : (
            <View style={styles.buttonCenter}>
            <Button 
              mode="contained" 
                style={[styles.actionButton, { backgroundColor: '#22C55E' }]}
                labelStyle={styles.buttonLabel}
              onPress={continueToNextLesson}
                icon="arrow-right"
            >
              Next Lesson
            </Button>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* AI Chat Floating Action Button */}
      <FAB
        icon="robot"
        color="#FFFFFF"
        style={styles.aiChatButton}
        onPress={() => setShowAiChat(true)}
      />
      
      {/* AI Chat Modal */}
      <Modal
        visible={showAiChat}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAiChat(false)}
      >
        <View style={styles.aiChatModal}>
          <View style={styles.aiChatContainer}>
            <View style={styles.aiChatHeader}>
              <Text style={styles.aiChatTitle}>Lesson Assistant</Text>
              <IconButton
                icon="close"
                size={20}
                onPress={() => setShowAiChat(false)}
                style={styles.aiChatCloseButton}
              />
            </View>
            
            <ScrollView 
              ref={aiChatScrollViewRef}
              style={styles.aiChatMessages}
              contentContainerStyle={{ paddingBottom: 20 }}
              onContentSizeChange={() => aiChatScrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {aiMessages.map((msg, index) => (
                <View key={index} style={styles.messageWrapper}>
                  {msg.type === 'user' ? (
                    // User message - align right
                    <View style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
                      <View style={styles.userMessage}>
                        <Text style={styles.userMessageText}>{msg.content}</Text>
                      </View>
                    </View>
                  ) : (
                    // AI message - align left with avatar
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <View style={styles.aiAssistantAvatar}>
                        <Ionicons name="school" size={16} color="#FFFFFF" />
                      </View>
                      <View style={{ maxWidth: '80%' }}>
                        <View style={styles.aiMessage}>
                          <Text style={styles.aiMessageText}>{msg.content}</Text>
                          {msg.codeBlock && (
                            <View style={styles.codeBlock}>
                              <View style={styles.chatCodeHeader}>
                                <Text style={styles.codeLanguage}>
                                  {msg.codeBlock.language || 'code'}
                                </Text>
                                <TouchableOpacity 
                                  style={styles.copyButton}
                                  onPress={() => copyCodeToClipboard(msg.codeBlock?.code || '')}
                                >
                                  <Ionicons 
                                    name={copyStates[`code_${msg.id}`] ? "checkmark-circle" : "copy-outline"} 
                                    size={16} 
                                    color={copyStates[`code_${msg.id}`] ? "#4CAF50" : "#9CA3AF"} 
                                  />
                                  <Text style={styles.copyButtonText}>
                                    {copyStates[`code_${msg.id}`] ? 'Copied' : 'Copy'}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                              <Text style={styles.codeText}>{msg.codeBlock.code}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              ))}
              
              {aiLoading && (
                <View style={styles.aiLoadingIndicator}>
                  <ActivityIndicator size="small" color="#6366F1" />
                </View>
              )}
            </ScrollView>
            
            <View style={styles.aiChatInputContainer}>
              <TextInput
                style={styles.aiChatInput}
                value={aiMessage}
                onChangeText={setAiMessage}
                placeholder="Ask about this lesson..."
                multiline
                right={
                  <TextInput.Icon
                    icon="send"
                    onPress={handleAiChatSend}
                    disabled={!aiMessage.trim() || aiLoading}
                    color={aiMessage.trim() && !aiLoading ? '#6366F1' : '#9CA3AF'}
                  />
                }
              />
            </View>
          </View>
        </View>
      </Modal>
      
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
        <Dialog 
          visible={confirmDialogVisible} 
          onDismiss={() => setConfirmDialogVisible(false)}
          style={styles.confirmDialog}
        >
          <View style={styles.confirmContent}>
            <Ionicons name="checkmark-circle" size={40} color="#6366F1" style={styles.confirmIcon} />
            <Text style={styles.confirmTitle}>Complete Lesson?</Text>
            <Text style={styles.confirmXP}>+{Math.floor((lesson?.duration || 5) * 2)} XP</Text>
            
            <View style={styles.confirmButtons}>
              <Button 
                mode="outlined" 
                onPress={() => setConfirmDialogVisible(false)}
                style={styles.cancelButton}
                labelStyle={styles.cancelButtonLabel}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={confirmCompletion}
                style={styles.completeButton}
                labelStyle={styles.completeButtonLabel}
              >
                Complete
              </Button>
            </View>
          </View>
        </Dialog>
      </Portal>

      {/* XP Celebration Dialog */}
      <Portal>
        <Dialog 
          visible={showXpCelebration} 
          onDismiss={() => setShowXpCelebration(false)}
          style={styles.xpDialog}
        >
          <View style={styles.completionContainer}>
            <View style={styles.xpBadge}>
                <Text style={styles.xpAmount}>+{earnedXp}</Text>
                <Text style={styles.xpLabel}>XP</Text>
            </View>
            
            <Text style={styles.completionTitle}>
                Lesson Complete!
            </Text>
            
            <Button
              mode="contained"
              onPress={() => setShowXpCelebration(false)}
              style={styles.completionButton}
              labelStyle={styles.completionButtonLabel}
            >
              Continue
            </Button>
          </View>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  
  // Title section
  titleSection: {
    padding: 24,
    paddingBottom: 16,
  },
  lessonTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  topicChip: {
    backgroundColor: '#EEF2FF',
  },
  topicChipText: {
    color: '#6366F1',
  },
  durationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  xpText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
  },
  
  // Progress section
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 24,
    marginBottom: 24,
  },
  
  // Content
  contentContainer: {
    paddingHorizontal: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
  },
  
  // Code blocks
  codeContainer: {
    marginVertical: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  windowButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  windowBtn: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  closeBtn: {
    backgroundColor: '#FF605C',
  },
  minimizeBtn: {
    backgroundColor: '#FFBD44',
  },
  maximizeBtn: {
    backgroundColor: '#00CA4E',
  },
  codeLang: {
    fontSize: 12,
    color: '#6B7280',
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: '#1F2937',
    padding: 16,
    minWidth: '100%',
  },
  
  // Image
  imageContainer: {
    marginVertical: 16,
  },
  imageBox: {
    height: 160,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCaption: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  
  // Action buttons
  actionContainer: {
    padding: 24,
    paddingBottom: 48,
  },
  actionButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  
  // Other components
  snackbar: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
  },
  xpDialog: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  completionContainer: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  xpBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  xpAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  xpLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366F1',
    marginTop: -4,
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  completionButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#6366F1',
  },
  completeButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  
  // Locked state
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  lockedContent: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  lockedText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  backButton: {
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  buttonCenter: {
    alignItems: 'center',
    width: '100%',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmDialog: {
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  confirmContent: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  confirmIcon: {
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  confirmXP: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  cancelButton: {
    minWidth: '45%',
    borderColor: '#E5E7EB',
  },
  cancelButtonLabel: {
    color: '#6B7280',
  },
  copyCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  copyCodeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  codeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiChatButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#6366F1',
    borderRadius: 28,
  },
  aiChatModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  aiChatContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  aiChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#6366F1',
  },
  aiChatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  aiChatCloseButton: {
    margin: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  aiChatMessages: {
    flex: 1,
    padding: 16,
  },
  messageWrapper: {
    width: '100%', 
    paddingHorizontal: 16, 
    marginBottom: 16
  },
  messageBubble: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: '#6366F1',
    padding: 12,
    borderRadius: 16,
    borderTopRightRadius: 4,
    elevation: 2,
  },
  aiMessage: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    elevation: 2,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
  },
  aiMessageText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 20,
  },
  aiAssistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  aiChatInputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  aiChatInput: {
    backgroundColor: '#FFFFFF',
  },
  aiChatSendButton: {
    margin: 0,
  },
  aiLoadingIndicator: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 16,
  },
  optionsContainer: {
    marginTop: 16,
  },
  optionItem: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  selectedOption: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  optionText: {
    fontSize: 16,
    color: '#4B5563',
  },
  completeButton: {
    backgroundColor: '#6366F1',
    minWidth: '45%',
  },
  completionButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  codeBlock: {
    marginTop: 8,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    overflow: 'hidden',
  },
  chatCodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  codeLanguage: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  copyButtonText: {
    color: '#9CA3AF',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '400',
  },
  codeText: {
    color: '#E5E7EB',
    fontFamily: 'monospace',
    fontSize: 14,
    padding: 12,
  },
}); 