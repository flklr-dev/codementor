import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import BottomNavBar from '../components/BottomNavBar';
import HomeScreen from '../screens/HomeScreen';
import LearnScreen from '../screens/LearnScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import AIMentorScreen from '../screens/AIMentorScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import AccountScreen from '../screens/AccountScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import CoursesCategoryScreen from '../screens/CoursesCategoryScreen';
import QuizScreen from '../screens/QuizScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Define the tab navigator param list
export type TabNavigatorParamList = {
  Home: undefined;
  Lessons: undefined;
  Mentor: undefined;
  Achievements: undefined;
  Account: undefined;
};

// Define the stack navigator param list
export type RootStackParamList = {
  TabNavigator: undefined;
  CourseDetail: { courseId: string };
  LessonDetail: { lessonId: string };
  CoursesCategory: { difficulty?: string; tag?: string; title: string };
  Quiz: { quizId: string };
  EditProfile: undefined;
  CacheSettings: undefined;
};

const Tab = createBottomTabNavigator<TabNavigatorParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator 
      tabBar={props => <BottomNavBar {...props} />}
      screenOptions={{
        headerShown: false
      }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Lessons" component={LearnScreen} />
      <Tab.Screen name="Mentor" component={AIMentorScreen} />
      <Tab.Screen name="Achievements" component={AchievementsScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
      <Stack.Screen name="CoursesCategory" component={CoursesCategoryScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="CacheSettings" component={SettingsScreen} />
    </Stack.Navigator>
  );
} 