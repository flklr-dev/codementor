import api from './api';

// Get user progress data
export const getUserProgress = async (userId: string) => {
  try {
    console.log(`Fetching progress for user ${userId}`);
    // Add cache-busting parameter to avoid stale data
    const timestamp = new Date().getTime();
    const response = await api.get(`/users/${userId}/progress?t=${timestamp}`);
    console.log('Progress response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};

// Track coding time
export const trackCodingTime = async (minutes: number) => {
  try {
    const response = await api.post('/tracking/track-time', { minutes });
    return response.data;
  } catch (error) {
    console.error('Error tracking coding time:', error);
    throw error;
  }
}; 