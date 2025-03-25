import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomNavBar from '../components/BottomNavBar';
import HomeScreen from '../screens/HomeScreen';
import LearnScreen from '../screens/LearnScreen';
import LessonListScreen from '../screens/LessonListScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';
import AIMentorScreen from '../screens/AIMentorScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import AccountScreen from '../screens/AccountScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator 
      tabBar={props => <BottomNavBar {...props} />}
      screenOptions={{
        headerShown: false // This removes the headers
      }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Lessons" component={LearnScreen} />
      <Tab.Screen name="Mentor" component={AIMentorScreen} />
      <Tab.Screen name="Achievements" component={AchievementsScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
      <Tab.Screen 
        name="LessonList" 
        component={LessonListScreen} 
        options={{ headerShown: false, tabBarButton: () => null }}
      />
      <Tab.Screen 
        name="LessonDetail" 
        component={LessonDetailScreen} 
        options={{ headerShown: false, tabBarButton: () => null }} 
      />
    </Tab.Navigator>
  );
} 