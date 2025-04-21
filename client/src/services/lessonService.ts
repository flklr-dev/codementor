import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cacheService from './cacheService';

export const getLessonById = async (lessonId: string, forceRefresh = false) => {
  try {
    return await cacheService.fetchWithCache(
      `${cacheService.CACHE_KEYS.LESSON_DETAIL}${lessonId}`,
      async () => {
        // Add cache-busting parameter for fresh data
        const timestamp = new Date().getTime();
        const response = await api.get(`/lessons/${lessonId}?t=${timestamp}`);
        return response.data;
      },
      cacheService.CACHE_EXPIRY.LESSON_DATA,
      forceRefresh
    );
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
    
    // Clear lesson cache after updating progress
    await cacheService.clearCache(`${cacheService.CACHE_KEYS.LESSON_DETAIL}${lessonId}`);
    
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
    
    // Clear lesson and user caches
    await cacheService.clearCache(`${cacheService.CACHE_KEYS.LESSON_DETAIL}${lessonId}`);
    await cacheService.clearCache(cacheService.CACHE_KEYS.USER_DATA);
    
    return response.data;
  } catch (error) {
    console.error('Error completing lesson:', error);
    throw error;
  }
}; 