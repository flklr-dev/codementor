import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

const OfflineNotice = () => {
  const theme = useTheme();
  const [isOffline, setIsOffline] = useState(false);
  const translateY = new Animated.Value(-60);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !(state.isConnected && state.isInternetReachable);
      setIsOffline(offline);
      
      if (offline) {
        // Slide in animation
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start();
      } else {
        // Slide out animation
        Animated.timing(translateY, {
          toValue: -60,
          duration: 300,
          useNativeDriver: true
        }).start();
      }
    });

    // Check initial network state
    NetInfo.fetch().then(state => {
      setIsOffline(!(state.isConnected && state.isInternetReachable));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!isOffline) return null;

  return (
    <Animated.View 
      style={[
        styles.offlineContainer, 
        { transform: [{ translateY }] }
      ]}
    >
      <Ionicons name="cloud-offline" size={18} color="#FFFFFF" />
      <Text style={styles.offlineText}>
        You're offline. Using cached data.
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: '#EF4444',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  }
});

export default OfflineNotice; 