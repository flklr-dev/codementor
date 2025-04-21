import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppSelector } from '../store/hooks';

interface XPProgressBarProps {
  xp?: number;
  nextLevelXp?: number;
  customStyle?: object;
}

export default function XPProgressBar({ 
  xp: propXp, 
  nextLevelXp: propNextLevelXp,
  customStyle
}: XPProgressBarProps) {
  const { user } = useAppSelector(state => state.auth);
  
  // Use props if provided, otherwise fallback to user data from Redux
  const xp = propXp !== undefined ? propXp : (user?.xp || 0);
  const nextLevelXp = propNextLevelXp !== undefined ? propNextLevelXp : (user?.level ? user.level * 1000 : 1000);
  const remainingXp = nextLevelXp - xp;
  
  return (
    <View style={[styles.progressInfo, customStyle]}>
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Experience Points</Text>
          <Text style={styles.xpText}>
            {xp}/{nextLevelXp} XP
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarFill,
              { width: `${Math.min((xp / nextLevelXp) * 100, 100)}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressSubtext}>
          {remainingXp} XP until next level
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressInfo: {
    marginHorizontal: 16,
    backgroundColor: '#7375F3',
    borderRadius: 16,
    padding: 16,
  },
  progressContainer: {
    gap: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  xpText: {
    fontSize: 14,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FCD34D',
    borderRadius: 5,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#E5E7EB',
    textAlign: 'center',
  },
}); 