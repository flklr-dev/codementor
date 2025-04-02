import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  ActivityIndicator,
  TouchableOpacity,
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
  error?: string;
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
  const parseResponse = (response: string): { text: string; codeBlock?: { language: string; code: string }; error?: string } => {
    try {
      // First, clean up the response by removing any raw prompt text
      const cleanResponse = response.replace(/You are an expert coding mentor.*?Response:/s, '').trim();
      
      if (!cleanResponse) {
        return { text: 'Sorry, I received an empty response. Please try again.' };
      }

      // Extract code blocks with improved regex
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      const matches = [...cleanResponse.matchAll(codeBlockRegex)];
      
      if (matches.length > 0) {
        // Use the first code block
        const [fullMatch, language, code] = matches[0];
        
        // Get the requested language from the user's message
        const userMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
        let requestedLanguage = 'python'; // default to python
        
        // Check for language in user's message
        if (userMessage.includes('python')) requestedLanguage = 'python';
        else if (userMessage.includes('javascript')) requestedLanguage = 'javascript';
        else if (userMessage.includes('java')) requestedLanguage = 'java';
        else if (userMessage.includes('c++')) requestedLanguage = 'cpp';
        else if (userMessage.includes('c#')) requestedLanguage = 'csharp';
        else if (userMessage.includes('ruby')) requestedLanguage = 'ruby';
        else if (userMessage.includes('php')) requestedLanguage = 'php';
        else if (userMessage.includes('swift')) requestedLanguage = 'swift';
        else if (userMessage.includes('kotlin')) requestedLanguage = 'kotlin';
        else if (userMessage.includes('go')) requestedLanguage = 'go';
        else if (userMessage.includes('rust')) requestedLanguage = 'rust';
        
        // Remove the code block from the text
        const text = cleanResponse.replace(fullMatch, '').trim();
        
        // Validate code content
        if (!code.trim()) {
          return { text: 'Sorry, the code block was empty. Please try again.' };
        }

        return {
          text: text || 'Here\'s the code:',
          codeBlock: {
            language: requestedLanguage,
            code: code.trim()
          }
        };
      }
      
      return { text: cleanResponse };
    } catch (error) {
      console.error('Error parsing response:', error);
      return { 
        text: 'Sorry, I had trouble processing the response. Please try again.',
        error: 'Response parsing failed'
      };
    }
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
      const response = await api.post('/mentor/chat', {
        message: message.trim(),
      });

      if (!response.data || !response.data.response) {
        throw new Error('Invalid response format');
      }

      const aiResponse = response.data.response;
      const parsed = parseResponse(aiResponse);

      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: parsed.text,
        timestamp: new Date(),
        codeBlock: parsed.codeBlock,
        error: parsed.error,
      };

      setMessages(prev => [...prev, aiMessage]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'Sorry, I had trouble responding. Please try again.',
        timestamp: new Date(),
        error: 'API request failed',
      };
      setMessages(prev => [...prev, errorMessage]);
      setSnackbarMessage('Failed to get AI response');
      setShowSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = async (message: Message, messageId: string) => {
    try {
      if (!message.content && !message.codeBlock) {
        throw new Error('No content to copy');
      }

      // Combine text and code block if present
      let fullResponse = message.content;
      if (message.codeBlock) {
        fullResponse += `\n\n\`\`\`${message.codeBlock.language}\n${message.codeBlock.code}\n\`\`\``;
      }

      await Clipboard.setStringAsync(fullResponse);
      
      // Set copy state to true for this specific message
      setCopyStates(prev => ({
        ...prev,
        [`response_${messageId}`]: true
      }));

      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopyStates(prev => ({
          ...prev,
          [`response_${messageId}`]: false
        }));
      }, 2000);

      setSnackbarMessage('Response copied to clipboard!');
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error copying response:', error);
      setSnackbarMessage('Failed to copy response');
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
                msg.type === 'user' ? styles.userMessageText : null,
                msg.error ? styles.errorText : null
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
                        onPress={() => copyResponse(msg, msg.id)}
                      />
                    </View>
                    <Text style={styles.codeText}>{msg.codeBlock.code}</Text>
                  </Card.Content>
                </Card>
              )}
            </Surface>
            {msg.type === 'ai' && (
              <TouchableOpacity
                style={styles.copyResponseButton}
                onPress={() => copyResponse(msg, msg.id)}
              >
                <IconButton
                  icon={copyStates[`response_${msg.id}`] ? "check" : "content-copy"}
                  size={14}
                  iconColor={copyStates[`response_${msg.id}`] ? "#4CAF50" : "#9CA3AF"}
                />
                <Text style={styles.copyResponseText}>
                  {copyStates[`response_${msg.id}`] ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>
            )}
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
  copyResponseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
    marginLeft: 4,
  },
  copyResponseText: {
    color: '#9CA3AF',
    fontSize: 11,
    marginLeft: 2,
    fontWeight: '400',
  },
  errorText: {
    color: '#EF4444',
  },
}); 