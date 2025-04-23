import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Animated, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';

// Define navigation types to fix type errors
type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export default function LoadingScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { token } = useAppSelector(state => state.auth);
  const spinValue = new Animated.Value(0);
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const dotOpacity1 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity2 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Animate the logo appearance with scale and opacity
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Start the spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    ).start();

    // Animated dots sequence
    const animateDots = () => {
      Animated.sequence([
        // First dot
        Animated.timing(dotOpacity1, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Second dot
        Animated.timing(dotOpacity2, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Third dot
        Animated.timing(dotOpacity3, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Reset all dots
        Animated.parallel([
          Animated.timing(dotOpacity1, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity2, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity3, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animateDots());
    };

    animateDots();

    // Navigate based on authentication status after 3 seconds
    const timer = setTimeout(() => {
      if (token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [token, navigation, spinValue, scaleValue, opacityValue, dotOpacity1, dotOpacity2, dotOpacity3]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.logoContainer, 
            { 
              transform: [
                { rotate: spin },
                { scale: scaleValue }
              ],
              opacity: opacityValue 
            }
          ]}
        >
          <Image 
            source={require('../assets/app-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        
        <View style={styles.loadingTextContainer}>
          <Text style={styles.loadingText}>Loading</Text>
          <View style={styles.dotsContainer}>
            <Animated.Text style={[styles.dot, { opacity: dotOpacity1 }]}>.</Animated.Text>
            <Animated.Text style={[styles.dot, { opacity: dotOpacity2 }]}>.</Animated.Text>
            <Animated.Text style={[styles.dot, { opacity: dotOpacity3 }]}>.</Animated.Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 90,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#6366F1',
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
  },
  loadingTextContainer: {
    flexDirection: 'row',
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6366F1',
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: 4,
  },
  dot: {
    fontSize: 24,
    color: '#6366F1',
    fontWeight: 'bold',
    marginTop: -8,
  },
}); 