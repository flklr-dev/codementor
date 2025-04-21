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
  Button,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TabNavigatorParamList } from '../navigation/AppNavigator';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cacheService from '../services/cacheService';

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

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

interface CopyState {
  [key: string]: boolean;
}

export default function AIMentorScreen() {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<TabNavigatorParamList>>();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "I can assist you with:\n\n• Code explanations and concepts\n• Debugging and troubleshooting\n• Best practices and design patterns\n• Learning paths and resources\n• Project architecture and implementation\n\nWhat would you like to learn about today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const [currentSessionId, setCurrentSessionId] = useState<string>(Date.now().toString());
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<RNTextInput>(null);

  // Load chat history on component mount
  React.useEffect(() => {
    loadChatHistory();
  }, []);

  // Save current chat to history when messages change
  React.useEffect(() => {
    if (messages.length > 1) { // Only save if there's user interaction
      saveCurrentSession();
    }
  }, [messages]);

  // Load chat history from cache
  const loadChatHistory = async () => {
    try {
      const cachedHistory = await cacheService.getCachedData<ChatSession[]>(
        cacheService.CACHE_KEYS.CHAT_HISTORY, 
        cacheService.CACHE_EXPIRY.CHAT_HISTORY
      );
      
      if (cachedHistory) {
        // Convert string dates back to Date objects
        const parsedHistory = cachedHistory.map((session: any) => ({
          ...session,
          timestamp: new Date(session.timestamp),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChatHistory(parsedHistory);
        console.log('Chat history loaded from cache');
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // Save current chat session to history
  const saveCurrentSession = async () => {
    try {
      // Create a title from the first user message or default
      const firstUserMessage = messages.find(msg => msg.type === 'user');
      const title = firstUserMessage 
        ? firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '') 
        : 'New conversation';
      
      // Create session object
      const currentSession: ChatSession = {
        id: currentSessionId,
        title,
        lastMessage: messages[messages.length - 1].content.substring(0, 50) + 
          (messages[messages.length - 1].content.length > 50 ? '...' : ''),
        timestamp: new Date(),
        messages: messages
      };
      
      // Update history, keeping only the 5 most recent chats
      const updatedHistory = [
        currentSession,
        ...chatHistory.filter(session => session.id !== currentSessionId)
      ].slice(0, 5);
      
      setChatHistory(updatedHistory);
      
      // Cache the updated history
      await cacheService.cacheData(
        cacheService.CACHE_KEYS.CHAT_HISTORY, 
        updatedHistory, 
        cacheService.CACHE_EXPIRY.CHAT_HISTORY
      );
      
      console.log('Chat session saved to cache');
    } catch (error) {
      console.error('Error saving chat session:', error);
    }
  };

  // Start a new chat session
  const startNewChat = () => {
    setCurrentSessionId(Date.now().toString());
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: "I can assist you with:\n\n• Code explanations and concepts\n• Debugging and troubleshooting\n• Best practices and design patterns\n• Learning paths and resources\n• Project architecture and implementation\n\nWhat would you like to learn about today?",
        timestamp: new Date(),
      },
    ]);
    setShowHistory(false);
  };

  // Load a saved chat session
  const loadChatSession = (sessionId: string) => {
    const session = chatHistory.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setShowHistory(false);
      
      // Schedule scrolling to the end after the component re-renders
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  };

  // Function to extract code blocks from AI response
  const parseResponse = (response: string): { text: string; codeBlock?: { language: string; code: string }; error?: string } => {
    try {
      // First, clean up the response by removing any raw prompt text
      const cleanResponse = response.replace(/You are an expert coding mentor.*?Response:/s, '').trim();
      
      if (!cleanResponse) {
        return { text: 'I apologize, but I received an empty response. Please try again with a more specific question.' };
      }

      // Remove any standalone language names that might appear in the text
      const cleanedResponse = cleanResponse.replace(/\b(javascript|typescript|python|java|c\+\+|cpp|c#|csharp|ruby|php|swift|kotlin|go|rust|html|css|sql)\b/g, '');
      
      // Extract code blocks with improved regex
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      const matches = [...cleanedResponse.matchAll(codeBlockRegex)];
      
      if (matches.length > 0) {
        // Use the first code block
        const [fullMatch, language, code] = matches[0];
        
        // Get the requested language from the user's message
        const userMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
        let requestedLanguage = ''; // Don't default to javascript
        
        // Check for language in user's message
        if (userMessage.includes('python')) requestedLanguage = 'python';
        else if (userMessage.includes('javascript') || userMessage.includes('js')) requestedLanguage = 'javascript';
        else if (userMessage.includes('java')) requestedLanguage = 'java';
        else if (userMessage.includes('c++') || userMessage.includes('cpp')) requestedLanguage = 'cpp';
        else if (userMessage.includes('c#') || userMessage.includes('csharp')) requestedLanguage = 'csharp';
        else if (userMessage.includes('ruby')) requestedLanguage = 'ruby';
        else if (userMessage.includes('php')) requestedLanguage = 'php';
        else if (userMessage.includes('swift')) requestedLanguage = 'swift';
        else if (userMessage.includes('kotlin')) requestedLanguage = 'kotlin';
        else if (userMessage.includes('go')) requestedLanguage = 'go';
        else if (userMessage.includes('rust')) requestedLanguage = 'rust';
        else if (userMessage.includes('typescript') || userMessage.includes('ts')) requestedLanguage = 'typescript';
        else if (userMessage.includes('html')) requestedLanguage = 'html';
        else if (userMessage.includes('css')) requestedLanguage = 'css';
        else if (userMessage.includes('sql')) requestedLanguage = 'sql';
        
        // Use language from code block if provided, otherwise use detected or default
        const codeLanguage = language || requestedLanguage || 'code';
        
        // Remove the code block from the text
        const text = cleanedResponse.replace(fullMatch, '').trim();
        
        // Validate code content
        if (!code.trim()) {
          return { text: 'I apologize, but the code block was empty. Please try again with a more specific request.' };
        }

        return {
          text: text || 'Here\'s the code example:',
          codeBlock: {
            language: codeLanguage,
            code: code.trim()
          }
        };
      }
      
      return { text: cleanedResponse };
    } catch (error) {
      console.error('Error parsing response:', error);
      return { 
        text: 'I apologize, but I had trouble processing the response. Please try again with a clearer question.',
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
        content: 'I apologize, but I encountered an issue while processing your request. Please try again or rephrase your question.',
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

  const copyCode = async (code: string, messageId: string) => {
    try {
      if (!code) {
        throw new Error('No code to copy');
      }

      await Clipboard.setStringAsync(code);
      
      // Set copy state to true for this specific message
      setCopyStates(prev => ({
        ...prev,
        [`code_${messageId}`]: true
      }));

      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopyStates(prev => ({
          ...prev,
          [`code_${messageId}`]: false
        }));
      }, 2000);

      setSnackbarMessage('Code copied to clipboard');
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error copying code:', error);
      setSnackbarMessage('Failed to copy code');
      setShowSnackbar(true);
    }
  };

  // Function to format text with basic styling
  const formatText = (text: string) => {
    // Replace markdown-style bold with styled text
    const boldText = text.replace(/\*\*(.*?)\*\*/g, '<bold>$1</bold>');
    
    // Replace markdown-style italic with styled text
    const italicText = boldText.replace(/\*(.*?)\*/g, '<italic>$1</italic>');
    
    // Replace checkmarks
    const checkmarkText = italicText.replace(/✅/g, '✓ ');
    
    // Replace magnifying glass
    const magnifyingGlassText = checkmarkText.replace(/🔍/g, '🔍 ');
    
    // Replace warning
    const warningText = magnifyingGlassText.replace(/⚠️/g, '⚠️ ');
    
    // Split by newlines to handle paragraphs
    const paragraphs = warningText.split('\n\n');
    
    return (
      <View>
        {paragraphs.map((paragraph, index) => {
          // Check if this is a bullet point
          if (paragraph.trim().startsWith('•')) {
            return (
              <View key={index} style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  {formatStyledText(paragraph.substring(1).trim())}
                </Text>
              </View>
            );
          }
          
          return (
            <Text key={index} style={styles.messageText}>
              {formatStyledText(paragraph)}
            </Text>
          );
        })}
      </View>
    );
  };
  
  // Helper function to format text with bold and italic
  const formatStyledText = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    
    // Find all styled parts
    const boldMatches = [...text.matchAll(/<bold>(.*?)<\/bold>/g)];
    const italicMatches = [...text.matchAll(/<italic>(.*?)<\/italic>/g)];
    
    // Combine and sort all matches
    const allMatches = [
      ...boldMatches.map(match => ({ 
        start: match.index, 
        end: match.index + match[0].length, 
        type: 'bold', 
        content: match[1] 
      })),
      ...italicMatches.map(match => ({ 
        start: match.index, 
        end: match.index + match[0].length, 
        type: 'italic', 
        content: match[1] 
      }))
    ].sort((a, b) => a.start - b.start);
    
    // If no matches, return plain text
    if (allMatches.length === 0) {
      return <Text>{text}</Text>;
    }
    
    // Build parts array
    for (let i = 0; i < allMatches.length; i++) {
      const match = allMatches[i];
      
      // Add text before match
      if (match.start > lastIndex) {
        parts.push(
          <Text key={`text-${i}`}>
            {text.substring(lastIndex, match.start)}
          </Text>
        );
      }
      
      // Add styled text
      if (match.type === 'bold') {
        parts.push(
          <Text key={`bold-${i}`} style={styles.boldText}>
            {match.content}
          </Text>
        );
      } else if (match.type === 'italic') {
        parts.push(
          <Text key={`italic-${i}`} style={styles.italicText}>
            {match.content}
          </Text>
        );
      }
      
      lastIndex = match.end;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <Text key="text-end">
          {text.substring(lastIndex)}
        </Text>
      );
    }
    
    return <Text>{parts}</Text>;
  };

  // Render chat history overlay
  const renderChatHistory = () => {
    if (!showHistory) return null;
    
    return (
      <View style={styles.historyOverlay}>
        <View style={styles.historyContent}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Chats</Text>
            <IconButton
              icon="close"
              size={20}
              onPress={() => setShowHistory(false)}
            />
          </View>
          
          <ScrollView style={styles.historyList}>
            {chatHistory.length === 0 ? (
              <Text style={styles.emptyHistoryText}>No previous chats</Text>
            ) : (
              chatHistory.map(session => (
                <TouchableOpacity
                  key={session.id}
                  style={styles.historyItem}
                  onPress={() => loadChatSession(session.id)}
                >
                  <View style={styles.historyItemContent}>
                    <Text style={styles.historyItemTitle} numberOfLines={1}>
                      {session.title}
                    </Text>
                    <Text style={styles.historyItemDate}>
                      {new Date(session.timestamp).toLocaleDateString()} • {new Date(session.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  </View>
                  <IconButton
                    icon="chevron-right"
                    size={20}
                    iconColor="#9CA3AF"
                  />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
          
          <Button
            mode="contained"
            icon="plus"
            style={styles.newChatButton}
            onPress={startNewChat}
          >
            New Chat
          </Button>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar.Image
              size={40}
              source={require('../../assets/ai-avatar.png')}
              style={styles.avatar}
            />
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Code Mentor</Text>
              <Text style={styles.headerSubtitle}>Powered by AI</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <IconButton
              icon="history"
              iconColor="#FFFFFF"
              size={24}
              style={styles.headerButton}
              onPress={() => setShowHistory(true)}
            />
            <IconButton
              icon="plus-circle"
              iconColor="#FFFFFF"
              size={24}
              style={styles.headerButton}
              onPress={startNewChat}
            />
          </View>
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
              {msg.type === 'user' ? (
                <Text style={styles.userMessageText}>{msg.content}</Text>
              ) : (
                formatText(msg.content)
              )}
              {msg.codeBlock && (
                <Card style={styles.codeBlock}>
                  <Card.Content>
                    <View style={styles.codeHeader}>
                      <Text style={styles.codeLanguage}>
                        {msg.codeBlock.language}
                      </Text>
                      <TouchableOpacity 
                        style={styles.copyButton}
                        onPress={() => copyCode(msg.codeBlock!.code, msg.id)}
                      >
                        <Ionicons 
                          name={copyStates[`code_${msg.id}`] ? "checkmark-circle" : "copy-outline"} 
                          size={16} 
                          color={copyStates[`code_${msg.id}`] ? "#4CAF50" : "#9CA3AF"} 
                        />
                        <Text style={styles.copyButtonText}>
                          {copyStates[`code_${msg.id}`] ? 'Copied' : 'Copy'}
                        </Text>
                      </TouchableOpacity>
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
            <Text style={styles.loadingText}>Processing your request...</Text>
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
          placeholder="Ask me anything about programming..."
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

      {/* Chat History Overlay */}
      {renderChatHistory()}

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
  headerSection: {
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 8,
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
    fontSize: 15,
    lineHeight: 20,
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
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  copyButtonText: {
    color: '#9CA3AF',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '400',
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
  loadingText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  snackbar: {
    backgroundColor: '#1F2937',
  },
  errorText: {
    color: '#EF4444',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#6366F1',
  },
  italicText: {
    fontStyle: 'italic',
    color: '#10B981',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    marginRight: 8,
    fontSize: 16,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  // Chat history styles
  historyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  historyContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  historyList: {
    maxHeight: '80%',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  historyItemDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyHistoryText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 32,
    marginBottom: 32,
  },
  newChatButton: {
    marginTop: 16,
    backgroundColor: '#6366F1',
  },
}); 