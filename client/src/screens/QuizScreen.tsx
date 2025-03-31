import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Animated } from 'react-native';
import {
  Text,
  Button,
  Portal,
  Dialog,
  ProgressBar,
  useTheme,
  IconButton,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateUserData } from '../store/slices/authSlice';

type RootStackParamList = {
  CourseDetail: { 
    courseId: string;
    quizCompleted?: boolean;
    xpEarned?: number;
  };
};

interface Quiz {
  _id: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  xpReward: number;
}

interface QuizResult {
  success: boolean;
  score: number;
  xpEarned: number;
  levelsGained: number;
  message: string;
}

export default function QuizScreen() {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { courseId } = route.params as { courseId: string };
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchQuiz();
  }, [courseId]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentQuestionIndex]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/quizzes/course/${courseId}`);
      setQuiz(response.data);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching quiz:', error);
      setError(error.response?.data?.message || 'Failed to load quiz');
      setLoading(false);
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
      fadeAnim.setValue(0);
    } else {
      setShowConfirmation(true);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !user) return;

    try {
      const response = await api.post('/quizzes/submit', {
        quizId: quiz._id,
        courseId,
        answers: selectedAnswers
      });

      setQuizResult(response.data);
      setShowResult(true);

      if (response.data.success) {
        await dispatch(updateUserData());
      }
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      setError(error.response?.data?.message || 'Failed to submit quiz');
    }
  };

  const handleFinishQuiz = () => {
    setShowResult(false);
    navigation.navigate('CourseDetail', {
      courseId,
      quizCompleted: true,
      xpEarned: quizResult?.xpEarned || 0
    });
  };

  const handleRetryQuiz = () => {
    setShowResult(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    fadeAnim.setValue(0);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#6B7280" />
          <Text style={styles.errorText}>{error}</Text>
          <Button
            mode="contained"
            onPress={fetchQuiz}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!quiz) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No quiz available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          <Text style={styles.headerTitle}>Course Quiz</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        <Surface style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progress</Text>
            <Text style={styles.progressText}>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </Text>
          </View>
          <ProgressBar
            progress={(currentQuestionIndex + 1) / quiz.questions.length}
            color="#6366F1"
            style={styles.progressBar}
          />
        </Surface>

        <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.questionText}>
            {quiz.questions[currentQuestionIndex].question}
          </Text>

          <View style={styles.optionsContainer}>
            {quiz.questions[currentQuestionIndex].options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswers[currentQuestionIndex] === index && styles.selectedOption
                ]}
                onPress={() => handleAnswerSelect(index)}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionCircle}>
                    <Text style={styles.optionLetter}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={[
                    styles.optionText,
                    selectedAnswers[currentQuestionIndex] === index && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.navigationButtons}>
            {currentQuestionIndex > 0 && (
              <Button
                mode="outlined"
                onPress={() => setCurrentQuestionIndex(prev => prev - 1)}
                style={styles.navButton}
              >
                Previous
              </Button>
            )}
            <Button
              mode="contained"
              onPress={handleNextQuestion}
              disabled={selectedAnswers[currentQuestionIndex] === undefined}
              style={[styles.navButton, styles.nextButton]}
            >
              {currentQuestionIndex === quiz.questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
            </Button>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Confirmation Dialog */}
      <Portal>
        <Dialog visible={showConfirmation} onDismiss={() => setShowConfirmation(false)}>
          <Dialog.Title>Submit Quiz?</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to submit your answers? You won't be able to change them after submission.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmation(false)}>Review Answers</Button>
            <Button onPress={handleSubmitQuiz}>Submit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Result Dialog */}
      <Portal>
        <Dialog visible={showResult} onDismiss={() => setShowResult(false)}>
          <Dialog.Title>
            {quizResult?.success ? 'Congratulations! 🎉' : 'Keep Learning! 📚'}
          </Dialog.Title>
          <Dialog.Content>
            <View style={styles.resultContent}>
              <Text style={styles.scoreText}>
                Your Score: {quizResult?.score.toFixed(1)}%
              </Text>
              {quizResult?.success ? (
                <>
                  <Text style={styles.xpText}>
                    +{quizResult.xpEarned} XP Earned
                  </Text>
                  {quizResult.levelsGained > 0 && (
                    <Text style={styles.levelText}>
                      Level Up! +{quizResult.levelsGained} Level{quizResult.levelsGained > 1 ? 's' : ''}
                    </Text>
                  )}
                </>
              ) : (
                <Text style={styles.failText}>
                  You need 70% to pass. Keep practicing!
                </Text>
              )}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            {quizResult?.success ? (
              <Button onPress={handleFinishQuiz}>Finish</Button>
            ) : (
              <Button onPress={handleRetryQuiz}>Try Again</Button>
            )}
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
  progressCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  questionContainer: {
    padding: 16,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  selectedOption: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  selectedOptionText: {
    color: '#1F2937',
    fontWeight: '500',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  navButton: {
    flex: 1,
    borderRadius: 12,
  },
  nextButton: {
    backgroundColor: '#6366F1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
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
  retryButton: {
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  resultContent: {
    alignItems: 'center',
    gap: 8,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  xpText: {
    fontSize: 18,
    color: '#F59E0B',
    fontWeight: '600',
  },
  levelText: {
    fontSize: 18,
    color: '#22C55E',
    fontWeight: '600',
  },
  failText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
} as const); 