import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const routes = [
  { name: 'Home', iconActive: 'home' as const, iconInactive: 'home-outline' as const, label: 'Home' },
  { name: 'Lessons', iconActive: 'book' as const, iconInactive: 'book-outline' as const, label: 'Learn' },
  { name: 'Mentor', iconActive: 'hardware-chip' as const, iconInactive: 'hardware-chip-outline' as const, label: 'AI' },
  { name: 'Achievements', iconActive: 'trophy' as const, iconInactive: 'trophy-outline' as const, label: 'Stats' },
  { name: 'Account', iconActive: 'person' as const, iconInactive: 'person-outline' as const, label: 'Me' },
];

export default function BottomNavBar({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      {routes.map((item) => {
        const isActive = state.routeNames[state.index] === item.name;
        return (
          <Pressable
            key={item.name}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => navigation.navigate(item.name)}>
            <Ionicons
              name={isActive ? item.iconActive : item.iconInactive}
              size={24}
              color={isActive ? theme.colors.primary : '#9CA3AF'}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? theme.colors.primary : '#6B7280',
                  fontWeight: isActive ? '600' : '400'
                }
              ]}>
              {item.label}
            </Text>
            {isActive && <View style={styles.activeIndicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 8,
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: '50%',
    height: 3,
    backgroundColor: '#6366F1',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
}); 