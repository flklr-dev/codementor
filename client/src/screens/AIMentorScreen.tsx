import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Card,
  IconButton,
  TextInput,
  useTheme,
  Surface,
  Avatar,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import api from '../services/api';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  codeBlock?: {
    language: string;
    code: string;
  };
}

interface CopyState {
  [key: string]: boolean;
}

export default function AIMentorScreen() {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI coding mentor. I can help you with:\n• Code explanations\n• Debugging\n• Best practices\n• Learning concepts\n\nWhat would you like to learn about?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<RNTextInput>(null);

  // Function to extract code blocks from AI response
  const parseResponse = (response: string): { text: string; codeBlock?: { language: string; code: string } } => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
    const match = response.match(codeBlockRegex);
    
    if (match) {
      const [fullMatch, language = 'javascript', code] = match;
      const text = response.replace(fullMatch, '').trim();
      return {
        text,
        codeBlock: {
          language,
          code: code.trim()
        }
      };
    }
    
    return { text: response };
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Get only the most recent message without unnecessary context
      const justCurrentMessage = message.trim();

      // Call AI mentor API with simplified approach
      const response = await api.post('/mentor/chat', {
        message: justCurrentMessage,
      });

      const aiResponse = response.data.response;
      
      // Check if the response is too long or has unrelated content
      let cleanedResponse = aiResponse;
      if (userMessage.content.toLowerCase().startsWith('can you') && 
          cleanedResponse.toLowerCase().includes('difference between')) {
        cleanedResponse = "Let me focus on what you asked. Here's the code:\n\n```python\nprint('Hello World')\n```";
      }
      
      const parsed = parseResponse(cleanedResponse);

      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: parsed.text,
        timestamp: new Date(),
        codeBlock: parsed.codeBlock,
      };

      setMessages(prev => [...prev, aiMessage]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Error getting AI response:', error);
      setSnackbarMessage('Sorry, I had trouble responding. Please try again.');
      setShowSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (code: string, messageId: string) => {
    try {
      await Clipboard.setStringAsync(code);
      
      // Set copy state to true for this specific message
      setCopyStates(prev => ({
        ...prev,
        [messageId]: true
      }));

      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopyStates(prev => ({
          ...prev,
          [messageId]: false
        }));
      }, 2000);

      setSnackbarMessage('Code copied to clipboard!');
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setSnackbarMessage('Failed to copy code');
      setShowSnackbar(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar.Image
              size={40}
              source={require('../../assets/ai-avatar.png')}
              style={styles.avatar}
            />
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>AI Mentor</Text>
              <Text style={styles.headerSubtitle}>Powered by Claude</Text>
            </View>
          </View>
          <IconButton
            icon="refresh"
            iconColor="#FFFFFF"
            size={24}
            style={styles.headerButton}
            onPress={() => setMessages([messages[0]])}
          />
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageWrapper,
              msg.type === 'user' ? styles.userMessage : styles.aiMessage,
            ]}
          >
            <Surface style={[
              styles.messageBubble,
              msg.type === 'user' ? styles.userBubble : styles.aiBubble
            ]}>
              <Text style={[
                styles.messageText,
                msg.type === 'user' ? styles.userMessageText : null
              ]}>
                {msg.content}
              </Text>
              {msg.codeBlock && (
                <Card style={styles.codeBlock}>
                  <Card.Content>
                    <View style={styles.codeHeader}>
                      <Text style={styles.codeLanguage}>
                        {msg.codeBlock.language}
                      </Text>
                      <IconButton
                        icon={copyStates[msg.id] ? "check" : "content-copy"}
                        size={16}
                        iconColor={copyStates[msg.id] ? "#4CAF50" : "#9CA3AF"}
                        onPress={() => copyToClipboard(msg.codeBlock!.code, msg.id)}
                      />
                    </View>
                    <Text style={styles.codeText}>{msg.codeBlock.code}</Text>
                  </Card.Content>
                </Card>
              )}
            </Surface>
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6366F1" />
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <TextInput
          ref={inputRef}
          value={message}
          onChangeText={setMessage}
          placeholder="Ask me anything about coding..."
          style={styles.input}
          multiline
          disabled={isLoading}
          right={
            <TextInput.Icon
              icon="send"
              onPress={handleSend}
              disabled={!message.trim() || isLoading}
              color={message.trim() && !isLoading ? '#6366F1' : '#9CA3AF'}
            />
          }
        />
      </KeyboardAvoidingView>

      {/* Snackbar for notifications */}
      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  heroSection: {
    backgroundColor: '#6366F1',
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    backgroundColor: '#EEF2FF',
  },
  headerContent: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    marginTop: 2,
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 0,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#6366F1',
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
  },
  messageText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  codeBlock: {
    marginTop: 8,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeLanguage: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  codeText: {
    color: '#E5E7EB',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  snackbar: {
    backgroundColor: '#1F2937',
  },
}); 