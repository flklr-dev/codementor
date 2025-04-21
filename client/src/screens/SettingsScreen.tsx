import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, IconButton, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import cacheService from '../services/cacheService';

type SettingsOption = {
  title: string;
  description: string;
  icon: string;
  action: () => void;
};

export default function SettingsScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [clearing, setClearing] = useState(false);

  // Function to clear specific cache
  const clearSpecificCache = async (cacheKey: string, cacheName: string) => {
    try {
      setClearing(true);
      await cacheService.clearCache(cacheKey);
      Alert.alert(
        'Success',
        `${cacheName} cache has been cleared.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error(`Error clearing ${cacheName} cache:`, error);
      Alert.alert(
        'Error',
        `Failed to clear ${cacheName} cache. Please try again.`,
        [{ text: 'OK' }]
      );
    } finally {
      setClearing(false);
    }
  };

  // Function to clear all cache
  const clearAllCache = async () => {
    try {
      setClearing(true);
      await cacheService.clearAllCache();
      Alert.alert(
        'Success',
        'All app cache has been cleared.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error clearing all cache:', error);
      Alert.alert(
        'Error',
        'Failed to clear all cache. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setClearing(false);
    }
  };

  // Create settings options
  const cacheOptions: SettingsOption[] = [
    {
      title: 'Clear User Data Cache',
      description: 'Clear cached user profile and progress data',
      icon: 'person-circle',
      action: () => {
        Alert.alert(
          'Clear User Data Cache',
          'This will clear cached user profile and progress data. You will need to fetch this data from the server again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Clear', 
              style: 'destructive', 
              onPress: () => clearSpecificCache(cacheService.CACHE_KEYS.USER_DATA, 'User data') 
            }
          ]
        );
      }
    },
    {
      title: 'Clear Course Data Cache',
      description: 'Clear cached course listings and lesson data',
      icon: 'library',
      action: () => {
        Alert.alert(
          'Clear Course Data Cache',
          'This will clear cached course listings and lesson data. You will need to fetch this data from the server again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Clear', 
              style: 'destructive', 
              onPress: () => clearSpecificCache(cacheService.CACHE_KEYS.COURSE_LIST, 'Course data') 
            }
          ]
        );
      }
    },
    {
      title: 'Clear Chat History Cache',
      description: 'Clear cached AI mentor chat history',
      icon: 'chatbubbles',
      action: () => {
        Alert.alert(
          'Clear Chat History Cache',
          'This will clear your AI mentor chat history. This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Clear', 
              style: 'destructive', 
              onPress: () => clearSpecificCache(cacheService.CACHE_KEYS.CHAT_HISTORY, 'Chat history') 
            }
          ]
        );
      }
    },
    {
      title: 'Clear All Cache',
      description: 'Clear all cached data and reset the app to fetch fresh data',
      icon: 'trash',
      action: () => {
        Alert.alert(
          'Clear All Cache',
          'This will clear all cached data. You will need to fetch all data from the server again. Continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Clear All', 
              style: 'destructive', 
              onPress: clearAllCache 
            }
          ]
        );
      }
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          size={24} 
          iconColor="#FFFFFF"
          onPress={() => navigation.goBack()} 
        />
        <Text style={styles.headerTitle}>Cache Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Cache Management</Text>
        <Text style={styles.sectionDescription}>
          Clear cached data to free up space or force the app to fetch fresh data from the server.
          This is useful if you're experiencing sync issues or outdated information.
        </Text>

        {cacheOptions.map((option, index) => (
          <Surface key={index} style={styles.optionCard}>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={option.action}
              disabled={clearing}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name={option.icon as any} size={24} color="#6366F1" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </Surface>
        ))}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Caching</Text>
          <Text style={styles.infoText}>
            This app caches data locally on your device to improve performance and allow basic functionality when offline.
            Cached data is automatically refreshed periodically, but you can manually clear it here.
          </Text>
        </View>

      </ScrollView>
      
      {clearing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Clearing cache...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1F2937',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  optionCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoSection: {
    marginTop: 24,
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
}); 