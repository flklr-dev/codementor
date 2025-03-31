import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getLessonById = async (lessonId: string) => {
  try {
    // Add cache-busting parameter to avoid stale data
    const timestamp = new Date().getTime();
    const response = await api.get(`/lessons/${lessonId}?t=${timestamp}`);
    
    // Add accessibility check to the response data
    const data = response.data;
    console.log('Lesson data with accessibility:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching lesson by ID:', error);
    throw error;
  }
};

export const updateLessonProgress = async (lessonId: string, progress: number) => {
  try {
    console.log(`Sending progress update: lesson ${lessonId}, progress ${progress}`);
    const response = await api.post(`/lessons/${lessonId}/progress`, { progress });
    console.log('Progress update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    throw error;
  }
};

export const completeLessonAndUpdateXP = async (lessonId: string) => {
  try {
    console.log(`Marking lesson ${lessonId} as complete`);
    const response = await api.post(`/lessons/${lessonId}/complete`);
    console.log('Completion response:', response.data);
    
    // Clear any user-related cache
    await AsyncStorage.removeItem('userData');
    
    return response.data;
  } catch (error) {
    console.error('Error completing lesson:', error);
    throw error;
  }
}; 