import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
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
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

export default function LearnScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');
  const navigation = useNavigation();

  const userProgress = {
    level: 12,
    xp: 2450,
    nextLevel: 3000,
    streak: 7,
  };

  const lastLesson = {
    title: "JavaScript Functions",
    progress: 0.35,
    timeLeft: "15 min left",
    module: "JavaScript Basics",
  };

  const recommendedCourses = [
    {
      id: 1,
      title: "React Hooks Mastery",
      description: "Learn to use React Hooks effectively",
      duration: "2h 30m",
      level: "Intermediate",
      progress: 0,
    },
    {
      id: 2,
      title: "API Integration",
      description: "Build RESTful APIs with Express",
      duration: "1h 45m",
      level: "Advanced",
      progress: 0,
    },
  ];

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#6366F1', '#818CF8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Avatar.Image
                size={40}
                source={{ uri: 'https://i.pravatar.cc/150' }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>John Doe</Text>
                <View style={styles.statsRow}>
                  <Text style={styles.levelText}>Level {userProgress.level}</Text>
                  <View style={styles.streakContainer}>
                    <View style={styles.streakCircle}>
                      <Text style={styles.streakText}>{userProgress.streak}</Text>
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
                  {userProgress.xp}/{userProgress.nextLevel} XP
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBarFill,
                    { width: `${(userProgress.xp / userProgress.nextLevel) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressSubtext}>
                {userProgress.nextLevel - userProgress.xp} XP until next level
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Search Section */}
        <View style={styles.section}>
          <Searchbar
            placeholder="Search topics or exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
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
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <Card 
                key={category.id} 
                style={styles.categoryCard}
                onPress={() => navigation.navigate('LessonList', {
                  type: 'category',
                  title: category.name,
                  color: category.color
                })}>
                <Card.Content style={styles.categoryContent}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${category.color}15` },
                    ]}>
                    <Ionicons
                      name={category.icon}
                      size={24}
                      color={category.color}
                    />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Difficulty Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Difficulty</Text>
          <View style={styles.difficultyGrid}>
            {difficultyCategories.map((category) => (
              <Card 
                key={category.id} 
                style={styles.difficultyCard}
                onPress={() => navigation.navigate('LessonList', {
                  type: 'difficulty',
                  title: category.name,
                  color: category.color
                })}>
                <LinearGradient
                  colors={[`${category.color}15`, `${category.color}05`]}
                  style={styles.difficultyGradient}>
                  <View style={styles.difficultyHeader}>
                    <View 
                      style={[
                        styles.iconBadge, 
                        { backgroundColor: `${category.color}15` }
                      ]}>
                      <Ionicons name={category.icon} size={24} color={category.color} />
                    </View>
                    <Chip 
                      style={[styles.levelChip, { backgroundColor: `${category.color}15` }]}
                      textStyle={{ color: category.color }}>
                      {category.name}
                    </Chip>
                  </View>
                  <Text style={styles.difficultyDescription}>{category.description}</Text>
                  <View style={styles.courseTagsContainer}>
                    {category.courses.map((course, index) => (
                      <View 
                        key={index}
                        style={[styles.courseTag, { backgroundColor: `${category.color}10` }]}>
                        <Text style={[styles.courseTagText, { color: category.color }]}>
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

        {/* Recommended Courses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          {recommendedCourses.map((course) => (
            <Card key={course.id} style={styles.courseCard}>
              <Card.Content>
                <View style={styles.courseHeader}>
                  <View>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <Text style={styles.courseDescription}>
                      {course.description}
                    </Text>
                  </View>
                </View>
                <View style={styles.courseMeta}>
                  <Chip icon="clock" style={styles.chip}>
                    {course.duration}
                  </Chip>
                  <Chip icon="school" style={styles.chip}>
                    {course.level}
                  </Chip>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Bottom padding for scroll */}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    borderRadius: 16,
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
    marginBottom: 12,
    borderRadius: 16,
  },
  courseHeader: {
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  courseMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F3F4F6',
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
}); 