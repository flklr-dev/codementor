import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Define cache expiration times (in milliseconds)
const CACHE_EXPIRY = {
  USER_DATA: 5 * 60 * 1000, // 5 minutes
  USER_PROGRESS: 10 * 60 * 1000, // 10 minutes
  COURSE_DATA: 30 * 60 * 1000, // 30 minutes
  LESSON_DATA: 60 * 60 * 1000, // 1 hour
  CHAT_HISTORY: 24 * 60 * 60 * 1000, // 24 hours
};

// Cache keys
export const CACHE_KEYS = {
  USER_DATA: 'cache_user_data',
  USER_PROGRESS: 'cache_user_progress_',
  COURSE_LIST: 'cache_course_list',
  COURSE_DETAIL: 'cache_course_',
  LESSON_DETAIL: 'cache_lesson_',
  CHAT_HISTORY: 'cache_chat_history',
  ACHIEVEMENTS: 'cache_achievements',
  LAST_UPDATE: 'cache_last_update_',
};

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Check if the network is connected
export const isNetworkConnected = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected ?? false;
};

// Cache data with expiration
export const cacheData = async <T>(key: string, data: T, expiryTime?: number): Promise<void> => {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    
    // Update the last update timestamp
    await AsyncStorage.setItem(
      `${CACHE_KEYS.LAST_UPDATE}${key}`,
      Date.now().toString()
    );
  } catch (error) {
    console.error(`Error caching data for key ${key}:`, error);
  }
};

// Get data from cache, returns null if expired or not found
export const getCachedData = async <T>(key: string, expiryTime: number): Promise<T | null> => {
  try {
    const cachedItem = await AsyncStorage.getItem(key);
    
    if (!cachedItem) return null;
    
    const { data, timestamp }: CacheItem<T> = JSON.parse(cachedItem);
    const isExpired = Date.now() - timestamp > expiryTime;
    
    return isExpired ? null : data;
  } catch (error) {
    console.error(`Error retrieving cached data for key ${key}:`, error);
    return null;
  }
};

// Clear specific cache
export const clearCache = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
    await AsyncStorage.removeItem(`${CACHE_KEYS.LAST_UPDATE}${key}`);
  } catch (error) {
    console.error(`Error clearing cache for key ${key}:`, error);
  }
};

// Clear all app cache
export const clearAllCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => 
      key.startsWith('cache_') || 
      key === 'chatHistory'
    );
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
};

// Get last update time for a specific cache
export const getLastUpdateTime = async (key: string): Promise<number | null> => {
  try {
    const timestamp = await AsyncStorage.getItem(`${CACHE_KEYS.LAST_UPDATE}${key}`);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.error(`Error getting last update time for key ${key}:`, error);
    return null;
  }
};

// Check if cache is stale (optionally force refresh if online)
export const isStale = async (key: string, expiryTime: number): Promise<boolean> => {
  const lastUpdate = await getLastUpdateTime(key);
  if (!lastUpdate) return true;
  
  return Date.now() - lastUpdate > expiryTime;
};

// Fetch with cache (universal function for API calls)
export const fetchWithCache = async <T>(
  key: string,
  fetchFunction: () => Promise<T>,
  expiryTime: number,
  forceRefresh = false
): Promise<T> => {
  // If not forcing refresh, try to get from cache first
  if (!forceRefresh) {
    const cachedData = await getCachedData<T>(key, expiryTime);
    if (cachedData) {
      console.log(`Using cached data for ${key}`);
      return cachedData;
    }
  }
  
  // No valid cache or forced refresh, check network
  const isOnline = await isNetworkConnected();
  
  if (!isOnline) {
    // Offline - use expired cache if available
    const expired = await getCachedData<T>(key, Number.MAX_SAFE_INTEGER);
    if (expired) {
      console.log(`Offline mode: using expired cache for ${key}`);
      return expired;
    }
    throw new Error('No network connection and no cached data available');
  }
  
  // Online - fetch fresh data
  try {
    console.log(`Fetching fresh data for ${key}`);
    const freshData = await fetchFunction();
    await cacheData<T>(key, freshData, expiryTime);
    return freshData;
  } catch (error) {
    // If fetch fails, try to use expired cache as fallback
    const expired = await getCachedData<T>(key, Number.MAX_SAFE_INTEGER);
    if (expired) {
      console.log(`Fetch failed: using expired cache for ${key}`);
      return expired;
    }
    throw error;
  }
};

// Cache specific functions for common data types

// Cache user data
export const cacheUserData = async (userData: any): Promise<void> => {
  await cacheData(CACHE_KEYS.USER_DATA, userData, CACHE_EXPIRY.USER_DATA);
};

// Get cached user data
export const getCachedUserData = async (): Promise<any | null> => {
  return getCachedData(CACHE_KEYS.USER_DATA, CACHE_EXPIRY.USER_DATA);
};

// Cache user progress
export const cacheUserProgress = async (userId: string, progressData: any): Promise<void> => {
  await cacheData(`${CACHE_KEYS.USER_PROGRESS}${userId}`, progressData, CACHE_EXPIRY.USER_PROGRESS);
};

// Get cached user progress
export const getCachedUserProgress = async (userId: string): Promise<any | null> => {
  return getCachedData(`${CACHE_KEYS.USER_PROGRESS}${userId}`, CACHE_EXPIRY.USER_PROGRESS);
};

// Cache course list
export const cacheCourseList = async (courses: any[]): Promise<void> => {
  await cacheData(CACHE_KEYS.COURSE_LIST, courses, CACHE_EXPIRY.COURSE_DATA);
};

// Get cached course list
export const getCachedCourseList = async (): Promise<any[] | null> => {
  return getCachedData(CACHE_KEYS.COURSE_LIST, CACHE_EXPIRY.COURSE_DATA);
};

// Cache course detail
export const cacheCourseDetail = async (courseId: string, courseData: any): Promise<void> => {
  await cacheData(`${CACHE_KEYS.COURSE_DETAIL}${courseId}`, courseData, CACHE_EXPIRY.COURSE_DATA);
};

// Get cached course detail
export const getCachedCourseDetail = async (courseId: string): Promise<any | null> => {
  return getCachedData(`${CACHE_KEYS.COURSE_DETAIL}${courseId}`, CACHE_EXPIRY.COURSE_DATA);
};

// Cache lesson detail
export const cacheLessonDetail = async (lessonId: string, lessonData: any): Promise<void> => {
  await cacheData(`${CACHE_KEYS.LESSON_DETAIL}${lessonId}`, lessonData, CACHE_EXPIRY.LESSON_DATA);
};

// Get cached lesson detail
export const getCachedLessonDetail = async (lessonId: string): Promise<any | null> => {
  return getCachedData(`${CACHE_KEYS.LESSON_DETAIL}${lessonId}`, CACHE_EXPIRY.LESSON_DATA);
};

// Cache achievements
export const cacheAchievements = async (userId: string, achievements: any[]): Promise<void> => {
  await cacheData(`${CACHE_KEYS.ACHIEVEMENTS}_${userId}`, achievements, CACHE_EXPIRY.USER_PROGRESS);
};

// Get cached achievements 
export const getCachedAchievements = async (userId: string): Promise<any[] | null> => {
  return getCachedData(`${CACHE_KEYS.ACHIEVEMENTS}_${userId}`, CACHE_EXPIRY.USER_PROGRESS);
};

export default {
  cacheData,
  getCachedData,
  clearCache,
  clearAllCache,
  cacheUserData,
  getCachedUserData,
  cacheUserProgress,
  getCachedUserProgress,
  cacheCourseList,
  getCachedCourseList,
  cacheCourseDetail,
  getCachedCourseDetail,
  cacheLessonDetail,
  getCachedLessonDetail,
  cacheAchievements,
  getCachedAchievements,
  isNetworkConnected,
  fetchWithCache,
  CACHE_KEYS,
  CACHE_EXPIRY,
}; 