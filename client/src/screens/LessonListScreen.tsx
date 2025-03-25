import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Chip, IconButton, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function LessonListScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { type, title, color } = route.params;

  const lessons = [
    {
      id: 1,
      title: "Introduction to HTML",
      description: "Learn the basics of HTML structure and elements",
      duration: "45 min",
      difficulty: "Beginner",
      xp: 100,
      progress: 0,
    },
    // Add more lessons...
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroSection}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <IconButton
              icon={() => <Ionicons name="chevron-back" size={24} color="#FFFFFF" />}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSubtitle}>
                {type === 'category' ? 'Category' : 'Difficulty Level'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {lessons.map((lesson) => (
          <Card
            key={lesson.id}
            style={styles.lessonCard}
            onPress={() => navigation.navigate('LessonDetail', { lesson })}>
            <Card.Content>
              <View style={styles.lessonHeader}>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Chip 
                  style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(lesson.difficulty) }]}>
                  {lesson.difficulty}
                </Chip>
              </View>
              <Text style={styles.lessonDescription}>{lesson.description}</Text>
              <View style={styles.lessonMeta}>
                <View style={[styles.metaItem, { backgroundColor: 'rgba(107, 114, 128, 0.1)' }]}>
                  <Ionicons name="time-outline" size={16} color="#6B7280" />
                  <Text style={styles.metaText}>{lesson.duration}</Text>
                </View>
                <View style={[styles.metaItem, { backgroundColor: '#22C55E20' }]}>
                  <Ionicons name="star-outline" size={16} color="#059669" />
                  <Text style={[styles.metaText, { color: '#059669' }]}>{lesson.xp} XP</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 0,
  },
  headerContent: {
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  lessonCard: {
    marginBottom: 12,
    borderRadius: 16,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  difficultyChip: {
    borderRadius: 12,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 8,
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