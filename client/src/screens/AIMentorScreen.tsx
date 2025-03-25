import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
} from 'react-native';
import {
  Text,
  Card,
  IconButton,
  TextInput,
  useTheme,
  Surface,
  Avatar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

export default function AIMentorScreen() {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI coding mentor. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<RNTextInput>(null);

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "Here's an example of a React component:",
        timestamp: new Date(),
        codeBlock: {
          language: 'javascript',
          code: `function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}`,
        },
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
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
            <Surface style={styles.messageBubble}>
              <Text style={styles.messageText}>{msg.content}</Text>
              {msg.codeBlock && (
                <Card style={styles.codeBlock}>
                  <Card.Content>
                    <View style={styles.codeHeader}>
                      <Text style={styles.codeLanguage}>
                        {msg.codeBlock.language}
                      </Text>
                      <IconButton
                        icon="content-copy"
                        size={16}
                        iconColor="#9CA3AF"
                        onPress={() => {
                          // Implement copy to clipboard
                        }}
                      />
                    </View>
                    <Text style={styles.codeText}>{msg.codeBlock.code}</Text>
                  </Card.Content>
                </Card>
              )}
            </Surface>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          ref={inputRef}
          value={message}
          onChangeText={setMessage}
          placeholder="Ask me anything about coding..."
          style={styles.input}
          multiline
          right={
            <TextInput.Icon
              icon="send"
              onPress={handleSend}
              disabled={!message.trim()}
              color={message.trim() ? '#6366F1' : '#9CA3AF'}
            />
          }
        />
      </KeyboardAvoidingView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
    padding: 16,
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
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    color: '#1F2937',
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
}); 