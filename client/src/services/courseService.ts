import api from './api';

// Get all courses
export const getAllCourses = async () => {
  try {
    const response = await api.get('/courses');
    return response.data;
  } catch (error) {
    console.error('Error fetching all courses:', error);
    throw error;
  }
};

// Get course details with lessons
export const getCourseWithLessons = async (courseId: string) => {
  try {
    // Add cache-busting query parameter
    const timestamp = new Date().getTime();
    const response = await api.get(`/courses/${courseId}/lessons?t=${timestamp}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course with lessons:', error);
    throw error;
  }
};

// Get lessons for a course
export const getLessonsByCourse = async (courseId: string) => {
  const response = await api.get(`/lessons/course/${courseId}`);
  return response.data;
};

// Get lesson details
export const getLesson = async (lessonId: string) => {
  const response = await api.get(`/lessons/${lessonId}`);
  return response.data;
};

// Update lesson progress
export const updateLessonProgress = async (lessonId: string, progress: number) => {
  const response = await api.post(`/lessons/${lessonId}/progress`, { progress });
  return response.data;
};

// Get courses by difficulty
export const getCoursesByDifficulty = async (difficulty: string) => {
  const response = await api.get(`/courses/difficulty/${difficulty}`);
  return response.data;
};

// Get courses by tag/category
export const getCoursesByTag = async (tag: string) => {
  const response = await api.get(`/courses/tag/${tag}`);
  return response.data;
}; 