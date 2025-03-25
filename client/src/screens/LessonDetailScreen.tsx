import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Text,
  Card,
  Chip,
  IconButton,
  Button,
  ProgressBar,
  useTheme,
  FAB,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

interface LessonSection {
  id: number;
  title: string;
  content: string;
  type: 'text' | 'code' | 'image';
  codeLanguage?: string;
}

export default function LessonDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  
  // Define mockData separately to ensure it's always available
  const mockData = {
    id: 1,
    title: "Introduction to HTML",
    description: "Learn the basics of HTML structure and elements",
    duration: "45 min",
    difficulty: "Beginner",
    xp: 100,
    progress: 0.35,
    sections: [
      {
        id: 1,
        title: 'What is HTML?',
        type: 'text',
        content: 'HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser.'
      },
      {
        id: 2,
        title: 'Basic HTML Structure',
        type: 'code',
        codeLanguage: 'html',
        content: `<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Title</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>`
      },
      {
        id: 3,
        title: 'Common Elements',
        type: 'text',
        content: 'HTML documents are made up of various elements. Each element serves a specific purpose in structuring your web content.'
      }
    ]
  };

  // Use nullish coalescing to fall back to mockData
  const lesson = route.params?.lesson ?? mockData;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.heroSection}>
        <View style={styles.header}>
          <IconButton
            icon={() => <Ionicons name="chevron-back" size={24} color="#FFFFFF" />}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <View style={styles.headerContent}>
            <Text style={styles.headerSubtitle}>Lesson</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonDescription}>{lesson.description}</Text>
            
          <View style={styles.metaInfo}>
            <Chip 
              style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(lesson.difficulty) }]}>
              {lesson.difficulty}
            </Chip>
            <View style={[styles.metaItem, { backgroundColor: 'rgba(107, 114, 128, 0.1)' }]}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{lesson.duration}</Text>
            </View>
            <View style={[styles.metaItem, { backgroundColor: '#22C55E20' }]}>
              <Ionicons name="star-outline" size={16} color="#059669" />
              <Text style={[styles.metaText, { color: '#059669' }]}>{lesson.xp} XP</Text>
            </View>
          </View>
        </View>
        
        {/* Progress Section */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressText}>
              {Math.round(lesson.progress * 100)}%
            </Text>
          </View>
          <ProgressBar
            progress={lesson.progress}
            color="#6366F1"
            style={styles.progressBar}
          />
        </View>

        {/* Lesson Content */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionHeader}>Lesson Content</Text>
          
          {lesson.sections?.map((section, index) => (
            <View key={section.id} style={styles.lessonBlock}>
              <View style={styles.lessonBlockHeader}>
                <View style={styles.lessonNumberBadge}>
                  <Text style={styles.lessonNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.lessonBlockTitle}>{section.title}</Text>
              </View>
              
              {section.type === 'text' ? (
                <View style={styles.textContent}>
                  <Text style={styles.textBody}>{section.content}</Text>
                </View>
              ) : section.type === 'code' ? (
                <View style={styles.codeContent}>
                  <View style={styles.codeHeader}>
                    <Text style={styles.codeLanguage}>{section.codeLanguage}</Text>
                  </View>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.codeScrollView}
                  >
                    <Text style={styles.codeText}>{section.content}</Text>
                  </ScrollView>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        {/* Quiz Section */}
        <Card style={styles.quizCard}>
          <Card.Content>
            <Text style={styles.quizTitle}>Challenge Yourself</Text>
            <Text style={styles.quizDescription}>
              Test your knowledge with interactive quizzes and earn XP!
            </Text>
            <Button 
              mode="outlined" 
              onPress={() => {/* Handle quiz start */}}
              style={styles.quizButton}>
              Start Quiz
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating AI Chat Button */}
      <View style={styles.fabContainer}>
        <Text style={styles.fabLabel}>Chat with AI</Text>
        <FAB
          icon="chat-processing"
          style={styles.fab}
          onPress={() => {/* Handle AI chat */}}
          color="#FFFFFF"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  heroSection: {
    backgroundColor: '#6366F1',
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 0,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    padding: 16,
    paddingBottom: 0,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  difficultyChip: {
    borderRadius: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  contentSection: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  lessonBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lessonBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  lessonNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  lessonBlockTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  textContent: {
    padding: 16,
  },
  textBody: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4B5563',
  },
  codeContent: {
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1F2937',
  },
  codeHeader: {
    backgroundColor: '#374151',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  codeLanguage: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  codeScrollView: {
    maxHeight: 200,
  },
  codeText: {
    color: '#E5E7EB',
    fontFamily: 'monospace',
    fontSize: 14,
    padding: 12,
  },
  quizCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 16,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1F2937',
  },
  quizDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  quizButton: {
    borderRadius: 8,
    borderColor: '#6366F1',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  fab: {
    backgroundColor: '#6366F1',
  }
});

function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
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