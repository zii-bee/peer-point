// src/screens/admin/HistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { chatAPI } from '../../services/api';

const AdminHistoryScreen = () => {
  const navigation = useNavigation();
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async (refresh = false) => {
    try {
      const newPage = refresh ? 1 : page;
      setLoading(true);
      const { data } = await chatAPI.getUserChatHistory(newPage);
      
      setChatHistory(refresh ? data.chats : [...chatHistory, ...data.chats]);
      setHasMore(newPage < data.pagination.totalPages);
      setPage(newPage + 1);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewChat = (chatId) => {
    navigation.navigate('Chat', { chatId, readOnly: true });
  };

  const renderItem = ({ item }) => {
    // Get other participant info (not the admin)
    const otherParticipant = item.participants.find(p => 
      p.userId._id !== user?.id || p.userId.id !== user?.id
    );
    
    const participantName = otherParticipant?.isAnonymous 
      ? 'Anonymous User' 
      : otherParticipant?.userId.name || 'Unknown User';
    
    const participantRole = otherParticipant?.role.charAt(0).toUpperCase() + otherParticipant?.role.slice(1);
    
    const date = new Date(item.createdAt).toLocaleDateString();
    const time = new Date(item.createdAt).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return (
      <TouchableOpacity 
        className="bg-white p-4 mb-2 rounded-lg shadow-sm border border-gray-100"
        onPress={() => viewChat(item.id)}
      >
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-primary-700 font-bold">
            {participantName} ({participantRole})
          </Text>
          <Text className="text-gray-500 text-xs">{date} at {time}</Text>
        </View>
        
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-600">
            {item.messages.length} messages
          </Text>
          <View className="flex-row items-center">
            <Text className={item.isActive ? 'text-green-600' : 'text-red-600'}>
              {item.isActive ? 'Active' : 'Ended'}
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color="#9ca3af"
              style={{ marginLeft: 4 }}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-primary-800 mb-4">Admin Chat History</Text>
      
      {chatHistory.length === 0 && !loading ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="chatbubble-ellipses-outline" size={64} color="#d1d5db" />
          <Text className="text-gray-500 mt-4 text-center">
            You don't have any chat history yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={chatHistory}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          onEndReached={() => hasMore && fetchChatHistory()}
          onEndReachedThreshold={0.3}
          refreshing={loading && page === 1}
          onRefresh={() => fetchChatHistory(true)}
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator size="small" color="#8b5cf6" style={{ marginVertical: 20 }} />
            ) : null
          }
        />
      )}
    </View>
  );
};

export default AdminHistoryScreen;