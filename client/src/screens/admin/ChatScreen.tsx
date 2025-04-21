// src/screens/admin/ChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { chatAPI } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { Message } from '../../types';

const AdminChatScreen = () => {
  // Implementation is almost identical to UserChatScreen
  // with possibly admin-specific features
  const route = useRoute();
  const navigation = useNavigation();
  const { state } = useAuth();
  const { 
    joinChat, 
    leaveChat, 
    sendMessage: socketSendMessage,
    listenForMessages,
    listenForTyping,
    listenForChatEnded,
    setTyping,
    endChat: socketEndChat
  } = useSocket();
  
  const { chatId, readOnly = false } = route.params as { chatId: string; readOnly?: boolean };
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [chat, setChat] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  
  const listRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load chat details
  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        setIsLoading(true);
        const { data } = await chatAPI.getChatDetails(chatId);
        setChat(data.chat);
        setMessages(data.chat.messages || []);
        if (!readOnly) {
          joinChat(chatId);
        }
      } catch (error) {
        console.error('Error fetching chat:', error);
        setError('Failed to load chat. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatDetails();

    // Cleanup
    return () => {
      if (!readOnly) {
        leaveChat(chatId);
      }
    };
  }, [chatId]);

  // Socket listeners
  useEffect(() => {
    if (readOnly) return;

    const messageHandler = (message: Message) => {
      if (message.chatId === chatId) {
        setMessages(prev => [...prev, message]);
      }
    };

    const typingHandler = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== state.user?.id) {
        setIsTyping(data.isTyping);
        setTypingUser(data.userId);
      }
    };

    const chatEndedHandler = (data: { chatId: string }) => {
      if (data.chatId === chatId) {
        setChat(prev => ({ ...prev, isActive: false }));
        Alert.alert('Chat Ended', 'This conversation has been ended.');
      }
    };

    // Register listeners
    listenForMessages(messageHandler);
    listenForTyping(typingHandler);
    listenForChatEnded(chatEndedHandler);

    // Cleanup
    return () => {
      // Socket cleanup would happen here
    };
  }, [chatId, readOnly]);

  // Handle typing indicator
  const handleTyping = () => {
    if (readOnly) return;
    
    setTyping(chatId, true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(chatId, false);
    }, 3000);
  };

  const sendNewMessage = () => {
    if (!newMessage.trim() || !chat?.isActive || readOnly) return;

    socketSendMessage(chatId, newMessage.trim());
    setNewMessage('');
  };

  const endChat = () => {
    if (readOnly) return;
    
    Alert.alert(
      'End Conversation',
      'Are you sure you want to end this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End', 
          style: 'destructive',
          onPress: () => {
            socketEndChat(chatId);
          }
        }
      ]
    );
  };

  // Determine the other participant (not the admin)
  const getOtherParticipant = () => {
    if (!chat) return null;
    
    return chat.participants.find((p: any) => 
      p.userId._id !== state.user?.id
    );
  };

  // Render message item
  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender === state.user?.id;
    
    return (
      <View 
        className={`mb-3 max-w-3/4 ${
          isOwnMessage ? 'self-end bg-primary-100' : 'self-start bg-gray-100'
        } rounded-lg p-3`}
      >
        <Text className="text-gray-800">{item.content}</Text>
        <Text className="text-gray-500 text-xs mt-1 text-right">
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="mt-4 text-gray-600">Loading conversation...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Text className="text-red-500 mb-4 text-center">{error}</Text>
        <TouchableOpacity 
          className="bg-primary-600 px-6 py-3 rounded-lg"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const otherParticipant = getOtherParticipant();
  const participantName = otherParticipant?.isAnonymous 
    ? 'Anonymous User' 
    : otherParticipant?.userId.name || 'User';
  const participantRole = otherParticipant?.role.charAt(0).toUpperCase() + otherParticipant?.role.slice(1);

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View className="border-b border-gray-200 p-4 flex-row justify-between items-center">
          <View>
            <Text className="text-lg font-bold text-gray-800">
              {participantName} ({participantRole})
            </Text>
            <Text className="text-sm text-gray-500">
              {chat?.isActive ? 'Active Conversation' : 'Conversation Ended'}
              {readOnly ? ' (View Only)' : ''}
            </Text>
          </View>
          {!readOnly && chat?.isActive && (
            <TouchableOpacity onPress={endChat} className="bg-red-100 px-3 py-1 rounded-full">
              <Text className="text-red-600 font-medium">End Chat</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />

        {isTyping && !readOnly && (
          <View className="px-4 py-2">
            <Text className="text-gray-500 italic">Someone is typing...</Text>
          </View>
        )}

        {chat?.isActive && !readOnly ? (
          <View className="p-4 border-t border-gray-200 flex-row items-center">
            <TextInput
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={(text) => {
                setNewMessage(text);
                handleTyping();
              }}
              multiline
            />
            <TouchableOpacity
              onPress={sendNewMessage}
              disabled={!newMessage.trim()}
              className={`rounded-full p-2 ${
                newMessage.trim() ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="p-4 bg-gray-100">
            <Text className="text-center text-gray-600">
              {readOnly 
                ? 'View-only mode' 
                : 'This conversation has ended'}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default AdminChatScreen;