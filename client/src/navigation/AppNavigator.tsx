import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import BottomNavBar from '../components/BottomNavBar';
import HomeScreen from '../screens/HomeScreen';
import LearnScreen from '../screens/LearnScreen';
import LessonListScreen from '../screens/LessonListScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import AIMentorScreen from '../screens/AIMentorScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import AccountScreen from '../screens/AccountScreen';
import CoursesCategoryScreen from '../screens/CoursesCategoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
      <Stack.Screen name="LessonList" component={LessonListScreen} />
      <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
      <Stack.Screen name="CoursesCategory" component={CoursesCategoryScreen} />
    </Stack.Navigator>
  );
} 