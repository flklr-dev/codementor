import api from './api';
import cacheService from './cacheService';

// Get all courses
export const getAllCourses = async (forceRefresh = false) => {
  try {
    return await cacheService.fetchWithCache(
      cacheService.CACHE_KEYS.COURSE_LIST,
      async () => {
        const response = await api.get('/courses');
        return response.data;
      },
      cacheService.CACHE_EXPIRY.COURSE_DATA,
      forceRefresh
    );
  } catch (error) {
    console.error('Error fetching all courses:', error);
    throw error;
  }
};

// Get course details with lessons
export const getCourseWithLessons = async (courseId: string, forceRefresh = false) => {
  try {
    return await cacheService.fetchWithCache(
      `${cacheService.CACHE_KEYS.COURSE_DETAIL}${courseId}`,
      async () => {
        // Add cache-busting query parameter
        const timestamp = new Date().getTime();
        const response = await api.get(`/courses/${courseId}/lessons?t=${timestamp}`);
        return response.data;
      },
      cacheService.CACHE_EXPIRY.COURSE_DATA,
      forceRefresh
    );
  } catch (error) {
    console.error('Error fetching course with lessons:', error);
    throw error;
  }
};

// Get lessons for a course
export const getLessonsByCourse = async (courseId: string, forceRefresh = false) => {
  try {
    return await cacheService.fetchWithCache(
      `${cacheService.CACHE_KEYS.COURSE_DETAIL}${courseId}_lessons`,
      async () => {
        const response = await api.get(`/lessons/course/${courseId}`);
        return response.data;
      },
      cacheService.CACHE_EXPIRY.COURSE_DATA,
      forceRefresh
    );
  } catch (error) {
    console.error('Error fetching lessons by course:', error);
    throw error;
  }
};

// Get lesson details
export const getLesson = async (lessonId: string, forceRefresh = false) => {
  try {
    return await cacheService.fetchWithCache(
      `${cacheService.CACHE_KEYS.LESSON_DETAIL}${lessonId}`,
      async () => {
        const response = await api.get(`/lessons/${lessonId}`);
        return response.data;
      },
      cacheService.CACHE_EXPIRY.LESSON_DATA,
      forceRefresh
    );
  } catch (error) {
    console.error('Error fetching lesson:', error);
    throw error;
  }
};

// Update lesson progress
export const updateLessonProgress = async (lessonId: string, progress: number) => {
  try {
    const response = await api.post(`/lessons/${lessonId}/progress`, { progress });
    
    // Clear lesson cache after updating progress
    await cacheService.clearCache(`${cacheService.CACHE_KEYS.LESSON_DETAIL}${lessonId}`);
    
    return response.data;
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    throw error;
  }
};

// Get courses by difficulty
export const getCoursesByDifficulty = async (difficulty: string, forceRefresh = false) => {
  try {
    return await cacheService.fetchWithCache(
      `${cacheService.CACHE_KEYS.COURSE_LIST}_difficulty_${difficulty}`,
      async () => {
        const response = await api.get(`/courses/difficulty/${difficulty}`);
        return response.data;
      },
      cacheService.CACHE_EXPIRY.COURSE_DATA,
      forceRefresh
    );
  } catch (error) {
    console.error(`Error fetching courses by difficulty ${difficulty}:`, error);
    throw error;
  }
};

// Get courses by tag/category
export const getCoursesByTag = async (tag: string, forceRefresh = false) => {
  try {
    return await cacheService.fetchWithCache(
      `${cacheService.CACHE_KEYS.COURSE_LIST}_tag_${tag}`,
      async () => {
        const response = await api.get(`/courses/tag/${tag}`);
        return response.data;
      },
      cacheService.CACHE_EXPIRY.COURSE_DATA,
      forceRefresh
    );
  } catch (error) {
    console.error(`Error fetching courses by tag ${tag}:`, error);
    throw error;
  }
}; 