import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Modal,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';

interface LevelUpModalProps {
  visible: boolean;
  onClose: () => void;
  newLevel: number;
  xpGained?: number;
}

const { width } = Dimensions.get('window');

const LevelUpModal = ({ visible, onClose, newLevel, xpGained = 0 }: LevelUpModalProps) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations when modal becomes visible
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      
      // Start animations
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.modalContent}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNumber}>{newLevel}</Text>
            </View>
            
            <Text style={styles.congratsText}>Level Up!</Text>
            <Text style={styles.messageText}>
              You've reached level {newLevel}
            </Text>
            
            {xpGained > 0 && (
              <View style={styles.xpContainer}>
                <Ionicons name="star" size={20} color="#FCD34D" />
                <Text style={styles.xpText}>+{xpGained} XP</Text>
              </View>
            )}
            
            <Button
              mode="contained"
              onPress={onClose}
              style={styles.continueButton}
              labelStyle={styles.buttonLabel}
            >
              Continue
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width - 60,
    maxWidth: 340,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: '#6366F1',
    padding: 24,
    alignItems: 'center',
  },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  congratsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 16,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  xpText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  continueButton: {
    width: '100%',
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
  },
  buttonLabel: {
    color: '#6366F1',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LevelUpModal; 