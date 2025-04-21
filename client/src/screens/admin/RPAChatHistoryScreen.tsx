// src/screens/admin/RPAChatHistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { chatAPI } from '../../services/api';

const RPAChatHistoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { rpaId, name } = route.params;
  
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      title: `${name}'s Chat History`
    });
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async (refresh = false) => {
    try {
      const newPage = refresh ? 1 : page;
      setLoading(true);
      const { data } = await chatAPI.getRPAChatHistory(rpaId, newPage);
      
      setChatHistory(refresh ? data.chats : [...chatHistory, ...data.chats]);
      setHasMore(newPage < data.pagination.totalPages);
      setPage(newPage + 1);
    } catch (error) {
      console.error('Error fetching RPA chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewChat = (chatId) => {
    navigation.navigate('Chat', { chatId, readOnly: true });
  };

  const renderItem = ({ item }) => {
    // Find the user participant (not the RPA)
    const userParticipant = item.participants.find(p => p.userId._id !== rpaId);
    const isAnonymous = userParticipant?.isAnonymous;
    const userName = isAnonymous ? 'Anonymous User' : userParticipant?.userId.name || 'Unknown User';
    
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
            Conversation with {userName}
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
      <Text className="text-xl font-bold text-primary-800 mb-4">{name}'s Chat History</Text>
      
      {chatHistory.length === 0 && !loading ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="chatbubble-ellipses-outline" size={64} color="#d1d5db" />
          <Text className="text-gray-500 mt-4 text-center">
            No chat history found for this RPA.
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

export default RPAChatHistoryScreen;